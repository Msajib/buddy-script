import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const feedInclude = {
  author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  likes: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      replies: {
        orderBy: { createdAt: "asc" as const },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          likes: { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
        }
      }
    }
  }
} satisfies Prisma.PostInclude;

const DEFAULT_FEED_LIMIT = 10;
const MAX_FEED_LIMIT = 20;

export function normalizeFeedLimit(value?: number) {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_FEED_LIMIT;
  }

  return Math.min(Math.max(value, 1), MAX_FEED_LIMIT);
}

export async function getFeedPosts(userId: string, options: { cursor?: string | null; limit?: number } = {}) {
  const limit = normalizeFeedLimit(options.limit);
  const posts = await prisma.post.findMany({
    where: {
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }]
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    include: feedInclude
  });

  const hasMore = posts.length > limit;
  const pagePosts = hasMore ? posts.slice(0, limit) : posts;

  return {
    posts: pagePosts,
    nextCursor: hasMore ? pagePosts[pagePosts.length - 1]?.id ?? null : null,
    hasMore
  };
}
