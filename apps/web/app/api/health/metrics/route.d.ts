import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<import("next/server").NextResponse<unknown> | NextResponse<{
    success: boolean;
    error: string;
    details: import("zod").ZodIssue[];
}> | NextResponse<{
    timestamp: string;
    health: {
        databases: {
            postgres: boolean;
            mongodb: boolean;
            redis: boolean;
            qdrant: boolean;
        };
        overall: string;
    };
    uptime: number;
}> | NextResponse<{
    success: boolean;
    error: string;
    timestamp: string;
}>>;
export declare function DELETE(request: NextRequest): Promise<import("next/server").NextResponse<unknown> | NextResponse<{
    success: boolean;
    message: string;
    timestamp: string;
}> | NextResponse<{
    success: boolean;
    error: string;
    timestamp: string;
}>>;
//# sourceMappingURL=route.d.ts.map