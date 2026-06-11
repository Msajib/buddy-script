import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { feedInclude } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const visibility = body.visibility === "PRIVATE" ? "PRIVATE" : body.visibility === "PUBLIC" ? "PUBLIC" : null;

  if (!visibility) {
    return NextResponse.json({ error: "Invalid visibility value." }, { status: 422 });
  }

  const post = await prisma.post.findUnique({ where: { id: params.postId }, select: { authorId: true } });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Only the post author can change visibility." }, { status: 403 });
  }

  const updatedPost = await prisma.post.update({
    where: { id: params.postId },
    data: { visibility },
    include: feedInclude
  });

  return NextResponse.json({ post: updatedPost });
}

export async function DELETE(_: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: params.postId }, select: { authorId: true } });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Only the post author can delete this post." }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.postId } });
  return NextResponse.json({ ok: true });
}
