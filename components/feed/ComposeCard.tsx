"use client";

import { useRef, useState } from "react";
import { PhotoIcon, SendIcon, VideoIcon } from "@/components/feed/icons";
import { Person } from "@/components/feed/types";

export function ComposeCard({
  user,
  posting,
  message,
  onCreatePost
}: {
  user: Person;
  posting: boolean;
  message: string;
  onCreatePost: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  function notReady(label: string) {
    window.alert(`${label} is under construction.`);
  }

  return (
    <section className="feed-panel feed-compose-panel">
      <form onSubmit={onCreatePost}>
        {message ? <div className="app-alert error">{message}</div> : null}
        <div className={`feed-compose-input-row ${expanded ? "is-expanded" : ""}`}>
          <img src={user.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
          <div className="feed-compose-editor">
            {!expanded ? (
              <button className="feed-compose-placeholder" type="button" onClick={() => setExpanded(true)}>
                <span>Write something ...</span>
                <i>✎</i>
              </button>
            ) : (
              <>
                <div className="feed-compose-privacy-row">
                  <button className={visibility === "PUBLIC" ? "is-selected" : ""} type="button" onClick={() => setVisibility("PUBLIC")} title="Public">
                    🌐
                  </button>
                  <button className={visibility === "PRIVATE" ? "is-selected" : ""} type="button" onClick={() => setVisibility("PRIVATE")} title="Private">
                    🔒
                  </button>
                </div>
                <textarea name="body" placeholder="Share what you are thinking..." required autoFocus />
              </>
            )}
          </div>
        </div>
        {preview ? (
          <div className="feed-compose-preview">
            <img src={preview} alt="Selected upload preview" />
            <button type="button" onClick={() => setPreview(null)} aria-label="Remove selected image">×</button>
          </div>
        ) : null}
        <div className="feed-compose-toolbar">
          <input type="hidden" name="visibility" value={visibility} />
          <input
            ref={fileInputRef}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <PhotoIcon />
            Photo
          </button>
          <button type="button" onClick={() => notReady("Video")}>
            <VideoIcon />
            Video
          </button>
          <button type="button" onClick={() => notReady("Event")}>▦ Event</button>
          <button type="button" onClick={() => notReady("Article")}>▤ Article</button>
          {/* <div className="feed-visibility-toggle" role="group" aria-label="Post visibility">
            <button className={visibility === "PUBLIC" ? "is-selected" : ""} type="button" onClick={() => setVisibility("PUBLIC")} title="Public">
              🌐
            </button>
            <button className={visibility === "PRIVATE" ? "is-selected" : ""} type="button" onClick={() => setVisibility("PRIVATE")} title="Private">
              🔒
            </button>
          </div> */}
          <button
            disabled={posting}
            className="feed-post-button"
            type={expanded ? "submit" : "button"}
            onClick={() => {
              if (!expanded) {
                setExpanded(true);
              }
            }}
          >
            <SendIcon />
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </section>
  );
}
