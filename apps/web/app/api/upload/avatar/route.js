import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createSecureApiMiddleware } from "@story-engine/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@story-engine/validation";
const UPLOAD_DIR = join(process.cwd(), "public", "avatars");
const secureMiddleware = createSecureApiMiddleware({
    rateLimit: {
        windowMs: 60 * 1000,
        max: 5,
        keyPrefix: "upload-avatar",
    },
    csrf: true,
});
export async function POST(request) {
    const middlewareResponse = await secureMiddleware(request);
    if (middlewareResponse.status !== 200) {
        return middlewareResponse;
    }
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            return NextResponse.json({
                success: false,
                error: "No file provided",
            }, { status: 400 });
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({
                success: false,
                error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
                allowedTypes: ALLOWED_IMAGE_TYPES,
            }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json({
                success: false,
                error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
                maxSize: MAX_IMAGE_SIZE,
            }, { status: 400 });
        }
        const originalFilename = file.name;
        if (!/^[a-zA-Z0-9._-]+$/.test(originalFilename)) {
            return NextResponse.json({
                success: false,
                error: "Invalid filename. Only letters, numbers, dots, hyphens, and underscores are allowed.",
            }, { status: 400 });
        }
        const extension = path.extname(file.name).toLowerCase().slice(1) || "jpg";
        const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
        if (!allowedExtensions.includes(extension)) {
            return NextResponse.json({
                success: false,
                error: "Invalid file extension. Only jpg, jpeg, png, and webp are allowed.",
            }, { status: 400 });
        }
        const filename = `${uuidv4()}.${extension}`;
        const filepath = join(UPLOAD_DIR, filename);
        try {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }
        catch (_a) {
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        const publicUrl = `/avatars/${filename}`;
        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({
            success: false,
            error: "Upload failed",
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
