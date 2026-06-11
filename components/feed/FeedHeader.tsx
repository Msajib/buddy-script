"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, ChatIcon, HomeIcon, SearchIcon, UsersIcon } from "@/components/feed/icons";
import { fullName, Person } from "@/components/feed/types";

export function FeedHeader({ user }: { user: Person }) {
  const router = useRouter();
  const [open, setOpen] = useState<"profile" | "notifications" | "chat" | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="feed-header">
      <div className="feed-header-logo">
        <img src="/assets/images/logo.svg" alt="Buddy Script" />
      </div>
      <label className="feed-header-search">
        <SearchIcon />
        <input placeholder="input search text" />
      </label>
      <nav className="feed-header-nav" aria-label="Feed navigation">
        <button className="feed-nav-item is-active" type="button" aria-label="Home">
          <HomeIcon />
        </button>
        <button className="feed-nav-item" type="button" aria-label="Friends">
          <UsersIcon />
        </button>
        <button className="feed-nav-item has-badge" type="button" aria-label="Notifications" onClick={() => setOpen((value) => (value === "notifications" ? null : "notifications"))}>
          <BellIcon />
          <span>6</span>
        </button>
        <button className="feed-nav-item has-badge" type="button" aria-label="Messages" onClick={() => setOpen((value) => (value === "chat" ? null : "chat"))}>
          <ChatIcon />
          <span>2</span>
        </button>
      </nav>
      {open === "notifications" ? (
        <div className="feed-top-popover feed-notification-popover">
          <div className="feed-top-popover-head">
            <strong>Notifications</strong>
            <button type="button" onClick={() => window.alert("Notification settings are under construction.")}>•••</button>
          </div>
          {["Steve Jobs posted a link in your timeline.", "Ryan Roslansky liked your post.", "Dylan Field replied to your comment."].map((item) => (
            <button key={item} type="button" onClick={() => window.alert("This notification view is under construction.")}>
              <img src="/assets/images/friend-req.png" alt="" />
              <span>{item}<small>42 minutes ago</small></span>
            </button>
          ))}
        </div>
      ) : null}
      {open === "chat" ? (
        <div className="feed-top-popover feed-chat-popover">
          <div className="feed-top-popover-head">
            <strong>Messages</strong>
            <button type="button" onClick={() => window.alert("Message settings are under construction.")}>•••</button>
          </div>
          {["Alex Morgan", "Maria Chen", "Dylan Field"].map((item, index) => (
            <button key={item} type="button" onClick={() => window.alert("Chat is under construction.")}>
              <img src={`/assets/images/people${Math.min(index + 1, 3)}.png`} alt="" />
              <span>{item}<small>Tap to open chat</small></span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="feed-header-user">
        <button className="feed-profile-trigger" type="button" onClick={() => setOpen((value) => (value === "profile" ? null : "profile"))}>
          <img src={user.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
          <strong>{fullName(user)}</strong>
          <span>⌄</span>
        </button>
        {open === "profile" ? (
          <div className="feed-profile-menu">
            <div className="feed-profile-menu-head">
              <img src={user.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
              <div>
                <strong>{fullName(user)}</strong>
                <a href="#top">View Profile</a>
              </div>
            </div>
            <hr />
            <button type="button">
              <span>⚙</span>
              Settings
              <i>›</i>
            </button>
            <button type="button">
              <span>?</span>
              Help & Support
              <i>›</i>
            </button>
            <button type="button" onClick={logout}>
              <span>↪</span>
              Log Out
              <i>›</i>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
