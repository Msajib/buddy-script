import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { replyId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const reply = await prisma.reply.findUnique({
    where: { id: params.replyId },
    select: { authorId: true }
  });

  if (!reply) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  if (reply.authorId !== user.id) {
    return NextResponse.json({ error: "Only the reply author can delete this reply." }, { status: 403 });
  }

  await prisma.reply.delete({ where: { id: params.replyId } });
  return NextResponse.json({ ok: true });
}
