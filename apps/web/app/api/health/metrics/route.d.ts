import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
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
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    timestamp: string;
}>>;
//# sourceMappingURL=route.d.ts.map