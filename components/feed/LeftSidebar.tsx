"use client";

import { useEffect, useRef } from "react";
import { MenuIcon } from "@/components/feed/icons";
import { Person, fullName } from "@/components/feed/types";

const menuItems = ["Learning", "Insights", "Find friends", "Bookmarks", "Group", "Gaming", "Settings", "Save post"];

export function LeftSidebar({ people }: { people: Person[] }) {
  const columnRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (columnRef.current) {
      columnRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <aside className="feed-left-column" ref={columnRef}>
      <section className="feed-panel feed-explore-panel">
        <h2>Explore</h2>
        <ul className="feed-menu-list">
          {menuItems.map((item) => (
            <li key={item}>
              <span className="feed-menu-icon">
                <MenuIcon label={item} />
              </span>
              <span>{item}</span>
              {(item === "Learning" || item === "Gaming") && <strong>New</strong>}
            </li>
          ))}
        </ul>
      </section>
      <section className="feed-panel feed-suggest-panel">
        <div className="feed-panel-title-row">
          <h2>Suggested People</h2>
          <a href="#top">See All</a>
        </div>
        {people.slice(0, 3).map((person) => (
          <div className="feed-suggest-person" key={person.id}>
            <img src={person.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
            <div>
              <strong>{fullName(person)}</strong>
              <span>CEO of {person.firstName === "Maria" ? "Linkedin" : "Apple"}</span>
            </div>
            <button type="button">Connect</button>
          </div>
        ))}
      </section>
      <section className="feed-panel feed-events-panel">
        <div className="feed-panel-title-row">
          <h2>Events</h2>
          <a href="#top">See all</a>
        </div>
        {[1, 2].map((item) => (
          <article className="feed-event-card" key={item}>
            <img src="/assets/images/feed_event1.png" alt="" />
            <div className="feed-event-content">
              <div className="feed-event-date">
                <strong>10</strong>
                <span>Jul</span>
              </div>
              <h3>No more terrorism no more cry</h3>
            </div>
            <div className="feed-event-bottom">
              <span>17 People Going</span>
              <button type="button">Going</button>
            </div>
          </article>
        ))}
      </section>
    </aside>
  );
}
