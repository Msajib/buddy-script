"use client";

import { useState } from "react";

import { fullName, isLiked, Person, Post } from "@/components/feed/types";

export function PostCard({
  post,
  user,
  userId,
  commentDraft,
  replyDrafts,
  onPostLike,
  onVisibilityChange,
  onDeletePost,
  onCommentLike,
  onReplyLike,
  onCommentDraft,
  onReplyDraft,
  onAddComment,
  onAddReply
}: {
  post: Post;
  user: Person;
  userId: string;
  commentDraft: string;
  replyDrafts: Record<string, string>;
  onPostLike: (postId: string, reaction?: string) => void;
  onVisibilityChange: (postId: string, visibility: "PUBLIC" | "PRIVATE") => void;
  onDeletePost: (postId: string) => void;
  onCommentLike: (commentId: string) => void;
  onReplyLike: (replyId: string) => void;
  onCommentDraft: (postId: string, value: string) => void;
  onReplyDraft: (commentId: string, value: string) => void;
  onAddComment: (postId: string) => void;
  onAddReply: (commentId: string) => void;
}) {
  const [burst, setBurst] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthor = post.author.id === userId;
  const reactionOptions = [
    { key: "LIKE", icon: "👍", label: "Like" },
    { key: "LOVE", icon: "❤️", label: "Love" },
    { key: "HAHA", icon: "😄", label: "Haha" },
    { key: "SAD", icon: "😢", label: "Sad" },
    { key: "CRY", icon: "😭", label: "Crying" }
  ];
  const myReaction = post.likes.find((like) => like.user.id === userId)?.reaction ?? "";
  const reactionIconByKey: Record<string, string> = {
    LIKE: "👍",
    LOVE: "❤️",
    HAHA: "😄",
    SAD: "😢",
    CRY: "😭"
  };
  const sortedComments = [...post.comments].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  const visibleComments = sortedComments.slice(0, 1);
  const previousCommentCount = Math.max(0, sortedComments.length - visibleComments.length);

  function react(reaction = "LIKE") {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 420);
    onPostLike(post.id, reaction);
  }

  function timeAgo(value: string) {
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    const units = [
      { label: "year", value: 31536000 },
      { label: "month", value: 2592000 },
      { label: "week", value: 604800 },
      { label: "day", value: 86400 },
      { label: "hour", value: 3600 },
      { label: "minute", value: 60 }
    ];
    const unit = units.find((item) => seconds >= item.value);

    if (!unit) {
      return "just now";
    }

    const amount = Math.floor(seconds / unit.value);
    return `${amount} ${unit.label}${amount > 1 ? "s" : ""} ago`;
  }

  const visibilityText = post.visibility === "PRIVATE" ? "Private" : "Public";

  function handleVisibilityClick() {
    if (!isAuthor) {
      return;
    }

    onVisibilityChange(post.id, post.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC");
  }

  function reactionBadge(likes: Post["likes"]) {
    if (likes.length === 0) {
      return null;
    }

    const icons = Array.from(new Set(likes.map((like) => reactionIconByKey[like.reaction ?? "LIKE"] ?? reactionIconByKey.LIKE))).slice(0, 3);

    return (
      <span className="feed-comment-reactions" title={`${likes.length} reactions`}>
        <span>{icons.join("")}</span>
        {likes.length}
      </span>
    );
  }

  return (
    <article className="feed-panel feed-post-card">
      <header className="feed-post-head">
        <img src={post.author.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
        <div>
          <h3>{fullName(post.author)}</h3>
          <p>
            {timeAgo(post.createdAt)} ·{" "}
            {isAuthor ? (
              <button className="feed-post-visibility is-editable" type="button" onClick={handleVisibilityClick}>
                {visibilityText}
              </button>
            ) : (
              <span className="feed-post-visibility">{visibilityText}</span>
            )}
          </p>
        </div>
        {isAuthor ? (
          <div className="feed-post-menu-wrap">
            <button className="feed-post-menu-btn" type="button" aria-label="Post menu" onClick={() => setMenuOpen((value) => !value)}>
              <span />
              <span />
              <span />
            </button>
            {menuOpen ? (
              <div className="feed-post-menu">
                <button className="is-danger" type="button" onClick={() => onDeletePost(post.id)}>
                  Delete post
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <span className="feed-post-menu-spacer" aria-hidden="true" />
        )}
      </header>
      <p className="feed-post-body">{post.body}</p>
      {post.imageUrl ? <img className="feed-post-image" src={post.imageUrl} alt="Post upload" /> : null}
      <div className="feed-post-stats">
        <div className="feed-reaction-summary">
          <div className="feed-reaction-faces">
            {post.likes.slice(0, 10).map((like, index) => (
              <img key={`${like.user.id}-${index}`} src={like.user.avatarUrl ?? `/assets/images/react_img${index + 1}.png`} alt="" />
            ))}
            {post.likes.length > 10 ? <span className="feed-reaction-more">+{post.likes.length - 10}</span> : null}
          </div>
        </div>
        <span>{post.comments.length} Comments · 0 Shares</span>
      </div>
      <div className="feed-post-actions">
        <div className="feed-reaction-action">
          <button className={`${isLiked(post.likes, userId) ? "is-liked" : ""} ${burst ? "is-bursting" : ""}`} type="button" onClick={() => react(myReaction || "LIKE")}>
            <span>{reactionOptions.find((item) => item.key === myReaction)?.icon ?? "♡"}</span>
            {myReaction ? reactionOptions.find((item) => item.key === myReaction)?.label : "Like"} ({post.likes.length})
          </button>
          <div className="feed-reaction-picker">
            {reactionOptions.map((item) => (
              <button key={item.key} type="button" onClick={() => react(item.key)} title={item.label}>
                {item.icon}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}>💬 Comment</button>
        <button type="button" onClick={() => window.alert("Share is under construction.")}>↗ Share</button>
      </div>
      <form
        className="feed-inline-form"
        onSubmit={(event) => {
          event.preventDefault();
          onAddComment(post.id);
        }}
      >
        <img src={user.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
        <div className="feed-comment-input-wrap">
          <input id={`comment-${post.id}`} value={commentDraft} onChange={(event) => onCommentDraft(post.id, event.target.value)} placeholder="Write a comment" />
          <button type="button" aria-label="Voice comment" onClick={() => window.alert("Voice comment is under construction.")}>♩</button>
          <button type="button" aria-label="Image comment" onClick={() => window.alert("Image comment is under construction.")}>▧</button>
        </div>
        <button className="feed-comment-submit" type="submit">Comment</button>
      </form>
      <div className="feed-comment-list">
        {previousCommentCount > 0 ? (
          <button className="feed-previous-comments" type="button">
            view {previousCommentCount} previous comment{previousCommentCount > 1 ? "s" : ""}
          </button>
        ) : null}
        {visibleComments.map((comment) => (
          <div key={comment.id}>
            <div className="feed-comment">
              <img src={comment.author.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
              <div>
                <div className="feed-comment-bubble">
                  <strong>{fullName(comment.author)}</strong>
                  <p>{comment.body}</p>
                  {reactionBadge(comment.likes)}
                </div>
                <div className="feed-comment-actions">
                  <button className={isLiked(comment.likes, userId) ? "is-liked" : ""} type="button" onClick={() => onCommentLike(comment.id)}>
                    {isLiked(comment.likes, userId) ? "Unlike" : "Like"}
                  </button>
                  <span>Reply</span>
                  <span>Share</span>
                </div>
                <form
                  className="feed-inline-form feed-reply-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onAddReply(comment.id);
                  }}
                >
                  <input value={replyDrafts[comment.id] ?? ""} onChange={(event) => onReplyDraft(comment.id, event.target.value)} placeholder="Write a reply" />
                  <button type="submit">Reply</button>
                </form>
              </div>
            </div>
            {comment.replies.map((reply) => (
              <div className="feed-comment feed-reply" key={reply.id}>
                <img src={reply.author.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
                <div>
                  <div className="feed-comment-bubble">
                    <strong>{fullName(reply.author)}</strong>
                    <p>{reply.body}</p>
                    {reactionBadge(reply.likes)}
                  </div>
                  <div className="feed-comment-actions">
                    <button className={isLiked(reply.likes, userId) ? "is-liked" : ""} type="button" onClick={() => onReplyLike(reply.id)}>
                      {isLiked(reply.likes, userId) ? "Unlike" : "Like"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
