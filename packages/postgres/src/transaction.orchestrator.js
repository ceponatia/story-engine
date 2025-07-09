export class TransactionCoordinator {
    constructor(dbManager) {
        this.dbManager = dbManager;
    }
    async executeDistributedTransaction(operations, compensations = []) {
        var _a;
        const completed = [];
        let compensationsRun = 0;
        try {
            for (const operation of operations) {
                const result = await this.executeOperation(operation);
                completed.push({
                    operation,
                    result,
                    timestamp: new Date(),
                });
            }
            return {
                success: true,
                result: (_a = completed[completed.length - 1]) === null || _a === void 0 ? void 0 : _a.result,
                completedOperations: completed,
                compensationsRun,
            };
        }
        catch (error) {
            compensationsRun = await this.compensate(completed, compensations);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                completedOperations: completed,
                compensationsRun,
            };
        }
    }
    async executeOperation(operation) {
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
    async executePostgresOperation(operation, params) {
        const client = this.dbManager.postgres.getDatabase();
        switch (operation) {
            case "query":
                return await client.query(params[0], params[1]);
            case "transaction":
                const transactionClient = await client.connect();
                try {
                    await transactionClient.query("BEGIN");
                    const result = await transactionClient.query(params[0], params[1]);
                    await transactionClient.query("COMMIT");
                    return result;
                }
                catch (error) {
                    await transactionClient.query("ROLLBACK");
                    throw error;
                }
                finally {
                    transactionClient.release();
                }
            default:
                throw new Error(`Unsupported PostgreSQL operation: ${operation}`);
        }
    }
    async executeRedisOperation(operation, params) {
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
    async executeQdrantOperation(operation, params) {
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
    async executeMongoOperation(operation, params) {
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
    async compensate(completed, compensations) {
        let compensationsRun = 0;
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
            }
            catch (compensationError) {
                console.error(`Compensation failed for operation: ${completedOp.operation.id}`, {
                    error: compensationError instanceof Error ? compensationError.message : "Unknown error",
                    operation: completedOp.operation,
                });
            }
        }
        return compensationsRun;
    }
}
export class StandardCompensations {
    static deleteInsertedRow(table, idField = "id") {
        return {
            matches: (operation) => {
                var _a;
                return operation.database === "postgres" &&
                    operation.operation === "query" &&
                    ((_a = operation.params[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(`insert into ${table.toLowerCase()}`));
            },
            execute: async (result) => {
                if (result.rows && result.rows[0]) {
                    const insertedId = result.rows[0][idField];
                    console.log(`Would delete ${table} where ${idField} = ${insertedId}`);
                }
            },
            description: `Delete inserted row from ${table}`,
        };
    }
    static deleteRedisKey() {
        return {
            matches: (operation) => operation.database === "redis" && operation.operation === "set",
            execute: async (result) => {
                console.log(`Would delete Redis key`);
            },
            description: "Delete Redis key",
        };
    }
    static deleteQdrantPoints() {
        return {
            matches: (operation) => operation.database === "qdrant" && operation.operation === "upsert_points",
            execute: async (result) => {
                console.log(`Would delete Qdrant points`);
            },
            description: "Delete Qdrant points",
        };
    }
}
export class DistributedOperationFactory {
    static createCharacterWithEmbeddings(characterData, embedding) {
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
                            id: "{{character_id}}",
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
