import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { textSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { body } = await request.json();
  const parsed = textSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Comment text is required." }, { status: 422 });
  }

  const post = await prisma.post.findFirst({
    where: {
      id: params.postId,
      OR: [{ visibility: "PUBLIC" }, { authorId: user.id }]
    }
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId: params.postId, authorId: user.id, body: parsed.data },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      replies: {
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
        }
      }
    }
  });

  return NextResponse.json({ comment: { ...comment, replies: [] } }, { status: 201 });
}
