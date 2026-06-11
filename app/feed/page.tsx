import { redirect } from "next/navigation";
import { FeedClient } from "@/components/FeedClient";
import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/posts";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const feed = await getFeedPosts(user.id);
  return (
    <FeedClient
      initialPosts={JSON.parse(JSON.stringify(feed.posts))}
      initialNextCursor={feed.nextCursor}
      initialHasMore={feed.hasMore}
      user={user}
    />
  );
}
