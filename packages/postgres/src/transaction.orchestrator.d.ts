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
export declare class TransactionCoordinator {
    private dbManager;
    constructor(dbManager: MultiDatabaseManager);
    executeDistributedTransaction<T>(operations: DistributedOperation[], compensations?: CompensationOperation[]): Promise<TransactionResult<T>>;
    private executeOperation;
    private executePostgresOperation;
    private executeRedisOperation;
    private executeQdrantOperation;
    private executeMongoOperation;
    private compensate;
}
export declare class StandardCompensations {
    static deleteInsertedRow(table: string, idField?: string): CompensationOperation;
    static deleteRedisKey(): CompensationOperation;
    static deleteQdrantPoints(): CompensationOperation;
}
export declare class DistributedOperationFactory {
    static createCharacterWithEmbeddings(characterData: Record<string, unknown>, embedding: number[]): DistributedOperation[];
}
//# sourceMappingURL=transaction.orchestrator.d.ts.map