export interface WorkerConfig {
    pollIntervalMs: number;
    maxConcurrentJobs: number;
    enableGracefulShutdown: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
}
export declare class EmbeddingWorker {
    private isRunning;
    private isShuttingDown;
    private activeJobs;
    private config;
    constructor(config?: Partial<WorkerConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    private processJobsLoop;
    private processJob;
    private setupGracefulShutdown;
    private sleep;
    private log;
}
export declare function createEmbeddingWorker(config?: Partial<WorkerConfig>): EmbeddingWorker;
export declare function startWorkerInAPIRoute(): Promise<EmbeddingWorker>;
//# sourceMappingURL=backgroundWorker.d.ts.map