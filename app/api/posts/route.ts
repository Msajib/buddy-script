import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { feedInclude, getFeedPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { textSchema } from "@/lib/validators";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxUploadBytes = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? "10");
  const feed = await getFeedPosts(user.id, { cursor, limit });

  return NextResponse.json(feed);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const body = textSchema.safeParse(formData.get("body"));
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  if (!body.success) {
    return NextResponse.json({ error: "Post text is required." }, { status: 422 });
  }

  let imageUrl: string | undefined;
  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    if (!allowedImageTypes.has(image.type) || image.size > maxUploadBytes) {
      return NextResponse.json({ error: "Please upload a JPG, PNG, WebP, or GIF image under 5MB." }, { status: 422 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await image.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), bytes);
    imageUrl = `/uploads/${fileName}`;
  }

  const post = await prisma.post.create({
    data: {
      body: body.data,
      imageUrl,
      visibility,
      authorId: user.id
    },
    include: feedInclude
  });

  return NextResponse.json({ post }, { status: 201 });
}
