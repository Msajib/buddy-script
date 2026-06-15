"use client";

import { useEffect, useMemo, useState } from "react";
import { ComposeCard } from "@/components/feed/ComposeCard";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { LeftSidebar } from "@/components/feed/LeftSidebar";
import { PostCard } from "@/components/feed/PostCard";
import { RightSidebar } from "@/components/feed/RightSidebar";
import { Stories } from "@/components/feed/Stories";
import { Person, Post, Reply } from "@/components/feed/types";

export function FeedClient({
  initialPosts,
  initialNextCursor,
  initialHasMore,
  user
}: {
  initialPosts: Post[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  user: Person;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [composeResetKey, setComposeResetKey] = useState(0);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("buddy-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.dataset.buddyTheme = theme;

    return () => {
      delete document.body.dataset.buddyTheme;
    };
  }, [theme]);

  function toggleTheme() {
    setTheme((value) => {
      const next = value === "light" ? "dark" : "light";
      window.localStorage.setItem("buddy-theme", next);
      return next;
    });
  }

  async function refreshFeed() {
    const response = await fetch("/api/posts?limit=10", { cache: "no-store" });

    if (response.ok) {
      const data = await response.json();
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    }
  }

  async function loadMorePosts() {
    if (!hasMore || !nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    const response = await fetch(`/api/posts?limit=10&cursor=${encodeURIComponent(nextCursor)}`, { cache: "no-store" });
    setLoadingMore(false);

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setPosts((currentPosts) => {
      const existingIds = new Set(currentPosts.map((post) => post.id));
      const newPosts = (data.posts as Post[]).filter((post) => !existingIds.has(post.id));
      return [...currentPosts, ...newPosts];
    });
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
  }

  function handleMainScroll(event: React.UIEvent<HTMLElement>) {
    const target = event.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceFromBottom < 320) {
      void loadMorePosts();
    }
  }

  async function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPosting(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/posts", { method: "POST", body: formData });
    setPosting(false);

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? "Could not create post.");
      return;
    }

    form.reset();
    await refreshFeed();
    setComposeResetKey((key) => key + 1);
  }

  async function postReaction(postId: string, reaction = "LIKE") {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const existing = post.likes.find((like) => like.user.id === user.id);
        const otherLikes = post.likes.filter((like) => like.user.id !== user.id);

        if (existing?.reaction === reaction) {
          return { ...post, likes: otherLikes };
        }

        return {
          ...post,
          likes: [...otherLikes, { reaction, user }]
        };
      })
    );

    await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction })
    });
    void refreshFeed();
  }

  async function commentReaction(commentId: string) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const liked = comment.likes.some((like) => like.user.id === user.id);
          return {
            ...comment,
            likes: liked ? comment.likes.filter((like) => like.user.id !== user.id) : [...comment.likes, { reaction: "LIKE", user }]
          };
        })
      }))
    );

    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    void refreshFeed();
  }

  async function replyReaction(replyId: string) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          replies: updateReplyTree(comment.replies, replyId, (reply) => {
            const liked = reply.likes.some((like) => like.user.id === user.id);
            return {
              ...reply,
              likes: liked ? reply.likes.filter((like) => like.user.id !== user.id) : [...reply.likes, { reaction: "LIKE", user }]
            };
          })
        }))
      }))
    );

    await fetch(`/api/replies/${replyId}/like`, { method: "POST" });
    void refreshFeed();
  }

  async function addReplyToReply(replyId: string) {
    const body = replyDrafts[replyId] ?? "";
    await addText(`/api/replies/${replyId}/replies`, body, () => setReplyDrafts((drafts) => ({ ...drafts, [replyId]: "" })));
  }

  async function deleteComment(commentId: string) {
    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) {
      return;
    }

    const previousPosts = posts;
    setPosts((currentPosts) =>
      currentPosts.map((post) => ({
        ...post,
        comments: post.comments.filter((comment) => comment.id !== commentId)
      }))
    );

    const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });

    if (!response.ok) {
      setPosts(previousPosts);
      window.alert("Could not delete this comment.");
      return;
    }

    void refreshFeed();
  }

  async function deleteReply(replyId: string) {
    const confirmed = window.confirm("Delete this reply?");

    if (!confirmed) {
      return;
    }

    const previousPosts = posts;
    setPosts((currentPosts) =>
      currentPosts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          replies: removeReplyFromTree(comment.replies, replyId)
        }))
      }))
    );

    const response = await fetch(`/api/replies/${replyId}`, { method: "DELETE" });

    if (!response.ok) {
      setPosts(previousPosts);
      window.alert("Could not delete this reply.");
      return;
    }

    void refreshFeed();
  }

  async function addText(url: string, body: string, clear: () => void) {
    if (!body.trim()) {
      return;
    }

    clear();
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });
    void refreshFeed();
  }

  async function changePostVisibility(postId: string, visibility: "PUBLIC" | "PRIVATE") {
    setPosts((currentPosts) => currentPosts.map((post) => (post.id === postId ? { ...post, visibility } : post)));

    const response = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility })
    });

    if (!response.ok) {
      void refreshFeed();
      return;
    }

    const data = await response.json();
    setPosts((currentPosts) => currentPosts.map((post) => (post.id === postId ? data.post : post)));
  }

  async function deletePost(postId: string) {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) {
      return;
    }

    const previousPosts = posts;
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));

    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

    if (!response.ok) {
      setPosts(previousPosts);
      window.alert("Could not delete this post.");
    }
  }

  const people = useMemo(() => {
    const map = new Map<string, Person>();
    const addReplyAuthors = (replies: Reply[]) => {
      replies.forEach((reply) => {
        if (reply.author.id !== user.id) {
          map.set(reply.author.id, reply.author);
        }
        addReplyAuthors(reply.replies);
      });
    };

    posts.forEach((post) => {
      if (post.author.id !== user.id) {
        map.set(post.author.id, post.author);
      }
      post.comments.forEach((comment) => {
        if (comment.author.id !== user.id) {
          map.set(comment.author.id, comment.author);
        }
        addReplyAuthors(comment.replies);
      });
    });

    return Array.from(map.values());
  }, [posts, user]);

  return (
    <div className={`feed-page ${theme === "dark" ? "is-dark" : ""}`} id="top">
      <FeedHeader user={user} />
      <div className="feed-layout">
        <LeftSidebar people={people} />
        <main className="feed-main-column" onScroll={handleMainScroll}>
          <Stories />
          <ComposeCard user={user} posting={posting} message={message} resetKey={composeResetKey} onCreatePost={createPost} />
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              userId={user.id}
              mentionPeople={people}
              commentDraft={commentDrafts[post.id] ?? ""}
              replyDrafts={replyDrafts}
              onPostLike={postReaction}
              onVisibilityChange={changePostVisibility}
              onDeletePost={deletePost}
              onCommentLike={commentReaction}
              onReplyLike={replyReaction}
              onDeleteComment={deleteComment}
              onDeleteReply={deleteReply}
              onCommentDraft={(postId, value) => setCommentDrafts((drafts) => ({ ...drafts, [postId]: value }))}
              onReplyDraft={(commentId, value) => setReplyDrafts((drafts) => ({ ...drafts, [commentId]: value }))}
              onAddComment={(postId) =>
                addText(`/api/posts/${postId}/comments`, commentDrafts[postId] ?? "", () =>
                  setCommentDrafts((drafts) => ({ ...drafts, [postId]: "" }))
                )
              }
              onAddReply={(commentId) =>
                addText(`/api/comments/${commentId}/replies`, replyDrafts[commentId] ?? "", () =>
                  setReplyDrafts((drafts) => ({ ...drafts, [commentId]: "" }))
                )
              }
              onAddNestedReply={addReplyToReply}
            />
          ))}
          {hasMore ? (
            <button className="feed-load-more" type="button" onClick={loadMorePosts} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          ) : posts.length > 0 ? (
            <p className="feed-end-message">All posts shown. You are fully caught up.</p>
          ) : null}
        </main>
        <RightSidebar people={people} />
      </div>
      <button
        className={`feed-theme-switch ${theme === "dark" ? "is-dark-active" : "is-light-active"}`}
        type="button"
        aria-label="Theme toggle"
        onClick={toggleTheme}
      >
        <span />
        <small className="feed-theme-sun">☀</small>
        <small className="feed-theme-moon">☾</small>
      </button>
    </div>
  );
}

function updateReplyTree(replies: Reply[], replyId: string, update: (reply: Reply) => Reply): Reply[] {
  return replies.map((reply) => {
    if (reply.id === replyId) {
      return update(reply);
    }

    return {
      ...reply,
      replies: updateReplyTree(reply.replies, replyId, update)
    };
  });
}

function removeReplyFromTree(replies: Reply[], replyId: string): Reply[] {
  return replies
    .filter((reply) => reply.id !== replyId)
    .map((reply) => ({
      ...reply,
      replies: removeReplyFromTree(reply.replies, replyId)
    }));
}
