import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    timestamp: string;
    databases: {
        postgres: boolean;
        mongodb: boolean;
        redis: boolean;
        qdrant: boolean;
    };
    overall: string;
    service: string;
    version: string;
}> | NextResponse<{
    timestamp: string;
    overall: string;
    error: string;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map