import { IMultiDatabaseManager } from "./databaseManager.interface";
export interface IRepository<T, ID> {
    findById(id: ID): Promise<T | null>;
    findByUser(userId: string): Promise<T[]>;
    create(data: CreateDTO<T>): Promise<T>;
    update(id: ID, data: UpdateDTO<T>): Promise<T | null>;
    delete(id: ID): Promise<boolean>;
}
export interface IRepositoryWithCache<T, ID> extends IRepository<T, ID> {
    invalidateCache(id: ID): Promise<void>;
    warmCache(id: ID): Promise<void>;
    getCacheKey(id: ID): string;
    getCacheTTL(): number;
}
export interface IRepositoryWithTransaction<T, ID> extends IRepository<T, ID> {
    createWithTransaction(data: CreateDTO<T>, transactionId?: string): Promise<T>;
    updateWithTransaction(id: ID, data: UpdateDTO<T>, transactionId?: string): Promise<T | null>;
    deleteWithTransaction(id: ID, transactionId?: string): Promise<boolean>;
}
export interface IAdvancedRepository<T, ID> extends IRepositoryWithCache<T, ID>, IRepositoryWithTransaction<T, ID> {
    getHealthStatus(): Promise<RepositoryHealthStatus>;
    getPerformanceMetrics(): Promise<RepositoryMetrics>;
    createMany(data: CreateDTO<T>[]): Promise<T[]>;
    updateMany(updates: Array<{
        id: ID;
        data: UpdateDTO<T>;
    }>): Promise<T[]>;
    deleteMany(ids: ID[]): Promise<boolean>;
    findByFilter(filter: FilterOptions<T>): Promise<T[]>;
    count(filter?: FilterOptions<T>): Promise<number>;
    warmUserCache(userId: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
}
export declare abstract class BaseRepository<T, ID> {
    protected dbManager: IMultiDatabaseManager;
    constructor(dbManager: IMultiDatabaseManager);
    abstract getTableName(): string;
    abstract getCachePrefix(): string;
    abstract mapRowToEntity(row: any): T;
    abstract validateCreateData(data: CreateDTO<T>): void;
    abstract validateUpdateData(data: UpdateDTO<T>): void;
    protected getCacheKey(id: ID): string;
    protected getUserCacheKey(userId: string): string;
    protected withCache<R>(key: string, operation: () => Promise<R>, ttl?: number): Promise<R>;
    protected invalidateCache(key: string): Promise<void>;
}
export interface IRepositoryFactory {
    createCharacterRepository(): IAdvancedRepository<any, string>;
    createAdventureRepository(): IAdvancedRepository<any, string>;
    createSettingRepository(): IAdvancedRepository<any, string>;
    createLocationRepository(): IAdvancedRepository<any, string>;
    createMessageRepository(): IAdvancedRepository<any, string>;
    createEmbeddingRepository(): IAdvancedRepository<any, string>;
    createJobRepository(): IAdvancedRepository<any, string>;
    createPersonaRepository(): IAdvancedRepository<any, string>;
    createUserAdventureTypeRepository(): IAdvancedRepository<any, string>;
    createUserRepository(): IAdvancedRepository<any, string>;
}
export type CreateDTO<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type UpdateDTO<T> = Partial<Omit<T, "id" | "created_at" | "updated_at">>;
export interface FilterOptions<T> {
    where?: Partial<T>;
    orderBy?: Array<{
        field: keyof T;
        direction: "ASC" | "DESC";
    }>;
    limit?: number;
    offset?: number;
    search?: {
        fields: Array<keyof T>;
        query: string;
    };
}
export interface PaginationOptions {
    page: number;
    pageSize: number;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface RepositoryHealthStatus {
    name: string;
    status: "healthy" | "degraded" | "unhealthy";
    lastOperation: Date;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
}
export interface RepositoryMetrics {
    totalQueries: number;
    cacheHits: number;
    cacheMisses: number;
    averageQueryTime: number;
    slowQueries: number;
    errors: number;
    lastReset: Date;
}
export interface TransactionContext {
    id: string;
    startTime: Date;
    operations: TransactionOperation[];
    status: "pending" | "committed" | "rolled_back";
}
export interface TransactionOperation {
    repository: string;
    operation: string;
    entityId: string;
    data?: any;
    timestamp: Date;
}
export interface RepositoryConfig {
    cacheTTL: number;
    enableMetrics: boolean;
    enableCircuitBreaker: boolean;
    maxRetries: number;
    retryDelay: number;
}
export interface ICharacterRepository extends IAdvancedRepository<any, string> {
    getTags(characterId: string): Promise<string[]>;
    updateTags(characterId: string, tags: string[]): Promise<void>;
    findByTag(tag: string, userId: string): Promise<any[]>;
    getCharacterContext(characterId: string): Promise<string>;
}
export interface IAdventureRepository extends IAdvancedRepository<any, string> {
    getWithCharacters(id: string, userId: string): Promise<any>;
    getWithPersona(id: string, userId: string): Promise<any>;
    createWithCharacter(adventureData: any, characterId: string, userId: string): Promise<any>;
    updateSystemPrompt(id: string, prompt: string): Promise<void>;
}
export interface IEmbeddingRepository extends IAdvancedRepository<any, string> {
    findSimilar(embedding: number[], limit: number): Promise<any[]>;
    upsertEmbedding(entityId: string, embedding: number[], metadata?: any): Promise<void>;
    deleteByEntity(entityId: string): Promise<boolean>;
}
export interface IRepositoryRegistry {
    character: ICharacterRepository;
    adventure: IAdventureRepository;
    setting: IAdvancedRepository<any, string>;
    location: IAdvancedRepository<any, string>;
    message: IAdvancedRepository<any, string>;
    embedding: IEmbeddingRepository;
    job: IAdvancedRepository<any, string>;
    persona: IAdvancedRepository<any, string>;
    userAdventureType: IAdvancedRepository<any, string>;
    user: IAdvancedRepository<any, string>;
    register<T, ID>(name: string, repository: IAdvancedRepository<T, ID>): void;
    get<T, ID>(name: string): IAdvancedRepository<T, ID>;
    getAll(): Record<string, IAdvancedRepository<any, any>>;
}
//# sourceMappingURL=repository.interface.d.ts.map