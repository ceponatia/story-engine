import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<import("next/server").NextResponse<unknown> | NextResponse<{
    success: boolean;
    stats: any;
    worker: {
        isRunning: boolean;
        startedAt: string | null;
    };
}> | NextResponse<{
    success: boolean;
    nextJob: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<import("next/server").NextResponse<unknown> | NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map