import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { textSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { replyId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { body } = await request.json();
  const parsed = textSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Reply text is required." }, { status: 422 });
  }

  const parentReply = await prisma.reply.findFirst({
    where: {
      id: params.replyId,
      comment: {
        post: {
          OR: [{ visibility: "PUBLIC" }, { authorId: user.id }]
        }
      }
    },
    select: { id: true, commentId: true, parentId: true }
  });

  if (!parentReply) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  if (parentReply.parentId) {
    return NextResponse.json({ error: "Reply threads are limited to 3 levels. Add a new comment instead." }, { status: 422 });
  }

  const reply = await prisma.reply.create({
    data: {
      commentId: parentReply.commentId,
      parentId: parentReply.id,
      authorId: user.id,
      body: parsed.data
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
    }
  });

  return NextResponse.json({ reply: { ...reply, replies: [] } }, { status: 201 });
}
