import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let reaction = "LIKE";
  try {
    const body = await _.json();
    reaction = typeof body.reaction === "string" ? body.reaction.slice(0, 20).toUpperCase() : "LIKE";
  } catch {
    reaction = "LIKE";
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: params.postId, userId: user.id } }
  });

  if (existing) {
    if (existing.reaction !== reaction) {
      await prisma.postLike.update({ where: { id: existing.id }, data: { reaction } });
      return NextResponse.json({ liked: true, reaction });
    }

    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({ data: { postId: params.postId, userId: user.id, reaction } });
  return NextResponse.json({ liked: true, reaction });
}
