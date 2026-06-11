import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { replyId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existing = await prisma.replyLike.findUnique({
    where: { replyId_userId: { replyId: params.replyId, userId: user.id } }
  });

  if (existing) {
    await prisma.replyLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.replyLike.create({ data: { replyId: params.replyId, userId: user.id } });
  return NextResponse.json({ liked: true });
}
