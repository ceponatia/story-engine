import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<import("next/server").NextResponse<unknown> | NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    url: string;
    filename: string;
}>>;
//# sourceMappingURL=route.d.ts.map