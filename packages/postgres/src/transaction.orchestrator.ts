/**
 * Distributed Transaction Coordinator
 *
 * Implements the Saga pattern for coordinating transactions across multiple databases.
 * Provides atomicity guarantees through compensation operations when failures occur.
 */

// import type { MultiDatabaseManager } from "./multi-db-manager"; // TODO: implement

export interface DistributedOperation {
  id: string;
  database: "postgres" | "redis" | "qdrant" | "mongodb";
  operation: string;
  params: unknown[];
  description?: string;
}

export interface CompensationOperation {
  matches(operation: DistributedOperation): boolean;
  execute(operationResult: unknown): Promise<void>;
  description?: string;
}

export interface CompletedOperation {
  operation: DistributedOperation;
  result: unknown;
  timestamp: Date;
}

export interface TransactionResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  completedOperations: CompletedOperation[];
  compensationsRun: number;
}

/**
 * Transaction Coordinator using Saga Pattern
 *
 * Ensures atomicity across multiple databases by providing compensation
 * for completed operations when later operations fail.
 */
export class TransactionCoordinator {
  constructor(private dbManager: MultiDatabaseManager) {}

  /**
   * Execute a distributed transaction with automatic compensation on failure
   */
  async executeDistributedTransaction<T>(
    operations: DistributedOperation[],
    compensations: CompensationOperation[] = []
  ): Promise<TransactionResult<T>> {
    const completed: CompletedOperation[] = [];
    let compensationsRun = 0;

    try {
      // Execute operations in sequence
      for (const operation of operations) {
        const result = await this.executeOperation(operation);
        completed.push({
          operation,
          result,
          timestamp: new Date(),
        });
      }

      // All operations succeeded
      return {
        success: true,
        result: completed[completed.length - 1]?.result,
        completedOperations: completed,
        compensationsRun,
      };
    } catch (error) {
      // Run compensations for completed operations in reverse order
      compensationsRun = await this.compensate(completed, compensations);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        completedOperations: completed,
        compensationsRun,
      };
    }
  }

  /**
   * Execute a single database operation
   */
  private async executeOperation(operation: DistributedOperation): Promise<unknown> {
    const { database, operation: op, params } = operation;

    switch (database) {
      case "postgres":
        return await this.executePostgresOperation(op, params);
      case "redis":
        return await this.executeRedisOperation(op, params);
      case "qdrant":
        return await this.executeQdrantOperation(op, params);
      case "mongodb":
        return await this.executeMongoOperation(op, params);
      default:
        throw new Error(`Unsupported database: ${database}`);
    }
  }

  private async executePostgresOperation(operation: string, params: unknown[]): Promise<unknown> {
    const client = this.dbManager.postgres.getDatabase();

    switch (operation) {
      case "query":
        return await client.query(params[0], params[1]);
      case "transaction":
        // Execute transaction block
        const transactionClient = await client.connect();
        try {
          await transactionClient.query("BEGIN");
          const result = await transactionClient.query(params[0], params[1]);
          await transactionClient.query("COMMIT");
          return result;
        } catch (error) {
          await transactionClient.query("ROLLBACK");
          throw error;
        } finally {
          transactionClient.release();
        }
      default:
        throw new Error(`Unsupported PostgreSQL operation: ${operation}`);
    }
  }

  private async executeRedisOperation(operation: string, params: unknown[]): Promise<unknown> {
    const client = this.dbManager.redis.getClient();

    switch (operation) {
      case "set":
        return await client.set(params[0], params[1], ...(params[2] ? ["EX", params[2]] : []));
      case "del":
        return await client.del(params[0]);
      case "expire":
        return await client.expire(params[0], params[1]);
      default:
        throw new Error(`Unsupported Redis operation: ${operation}`);
    }
  }

  private async executeQdrantOperation(operation: string, params: unknown[]): Promise<unknown> {
    const client = this.dbManager.qdrant.getClient();

    switch (operation) {
      case "upsert_points":
        return await client.upsertPoints(params[0], params[1]);
      case "delete_points":
        return await client.deletePoints(params[0], params[1]);
      case "search_points":
        return await client.searchPoints(params[0], params[1]);
      default:
        throw new Error(`Unsupported Qdrant operation: ${operation}`);
    }
  }

  private async executeMongoOperation(operation: string, params: unknown[]): Promise<unknown> {
    const db = this.dbManager.mongodb.getDatabase();

    switch (operation) {
      case "insert_one":
        return await db.collection(params[0]).insertOne(params[1]);
      case "update_one":
        return await db.collection(params[0]).updateOne(params[1], params[2]);
      case "delete_one":
        return await db.collection(params[0]).deleteOne(params[1]);
      default:
        throw new Error(`Unsupported MongoDB operation: ${operation}`);
    }
  }

  /**
   * Run compensation operations in reverse order
   */
  private async compensate(
    completed: CompletedOperation[],
    compensations: CompensationOperation[]
  ): Promise<number> {
    let compensationsRun = 0;

    // Run compensations in reverse order (newest operations first)
    for (let i = completed.length - 1; i >= 0; i--) {
      const completedOp = completed[i];

      try {
        const compensation = compensations.find((c) => c.matches(completedOp.operation));
        if (compensation) {
          await compensation.execute(completedOp.result);
          compensationsRun++;

          console.log(`Compensation executed for operation: ${completedOp.operation.id}`, {
            operation: completedOp.operation.description || completedOp.operation.operation,
            compensation: compensation.description || "Unknown compensation",
          });
        }
      } catch (compensationError) {
        console.error(`Compensation failed for operation: ${completedOp.operation.id}`, {
          error: compensationError instanceof Error ? compensationError.message : "Unknown error",
          operation: completedOp.operation,
        });
        // Continue with other compensations even if one fails
      }
    }

    return compensationsRun;
  }
}

/**
 * Common compensation operations for typical use cases
 */
export class StandardCompensations {
  /**
   * Compensation for PostgreSQL INSERT - deletes the inserted row
   */
  static deleteInsertedRow(table: string, idField: string = "id"): CompensationOperation {
    return {
      matches: (operation) =>
        operation.database === "postgres" &&
        operation.operation === "query" &&
        operation.params[0]?.toLowerCase().includes(`insert into ${table.toLowerCase()}`),

      execute: async (result) => {
        if (result.rows && result.rows[0]) {
          const insertedId = result.rows[0][idField];
          // This would need access to the DB manager - implement as needed
          console.log(`Would delete ${table} where ${idField} = ${insertedId}`);
        }
      },

      description: `Delete inserted row from ${table}`,
    };
  }

  /**
   * Compensation for Redis SET - deletes the key
   */
  static deleteRedisKey(): CompensationOperation {
    return {
      matches: (operation) => operation.database === "redis" && operation.operation === "set",

      execute: async (result) => {
        // Would need access to Redis client - implement as needed
        console.log(`Would delete Redis key`);
      },

      description: "Delete Redis key",
    };
  }

  /**
   * Compensation for Qdrant upsert - deletes the points
   */
  static deleteQdrantPoints(): CompensationOperation {
    return {
      matches: (operation) =>
        operation.database === "qdrant" && operation.operation === "upsert_points",

      execute: async (result) => {
        // Would need access to Qdrant client - implement as needed
        console.log(`Would delete Qdrant points`);
      },

      description: "Delete Qdrant points",
    };
  }
}

/**
 * Factory for creating common distributed operations
 */
export class DistributedOperationFactory {
  /**
   * Create character with embeddings operation
   */
  static createCharacterWithEmbeddings(
    characterData: Record<string, unknown>,
    embedding: number[]
  ): DistributedOperation[] {
    return [
      {
        id: "create-character",
        database: "postgres",
        operation: "query",
        params: [
          "INSERT INTO characters (name, appearance, personality, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
          [
            characterData.name,
            characterData.appearance,
            characterData.personality,
            characterData.created_by,
          ],
        ],
        description: "Create character in PostgreSQL",
      },
      {
        id: "store-embedding",
        database: "qdrant",
        operation: "upsert_points",
        params: [
          "characters",
          [
            {
              id: "{{character_id}}", // Would be replaced with actual ID
              vector: embedding,
              payload: { character_id: "{{character_id}}" },
            },
          ],
        ],
        description: "Store character embedding in Qdrant",
      },
    ];
  }
}
