import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const filename = params.filename;
  const extension = path.extname(filename).toLowerCase();

  if (filename !== path.basename(filename) || !contentTypes[extension]) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
  }

  try {
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
    const file = await readFile(uploadPath);

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[extension]
      }
    });
  } catch {
    return NextResponse.json({ error: "Upload not found." }, { status: 404 });
  }
}
