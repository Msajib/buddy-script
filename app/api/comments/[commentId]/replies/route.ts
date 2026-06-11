import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { textSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { commentId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { body } = await request.json();
  const parsed = textSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Reply text is required." }, { status: 422 });
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: params.commentId,
      post: {
        OR: [{ visibility: "PUBLIC" }, { authorId: user.id }]
      }
    }
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const reply = await prisma.reply.create({
    data: { commentId: params.commentId, authorId: user.id, body: parsed.data },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
    }
  });

  return NextResponse.json({ reply }, { status: 201 });
}
