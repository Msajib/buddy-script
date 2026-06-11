"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/feed/icons";
import { Person, fullName } from "@/components/feed/types";

export function RightSidebar({ people }: { people: Person[] }) {
  const [query, setQuery] = useState("");
  const recommended = people[1] ?? people[0];
  const visibleFriends = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return people.slice(0, 8);
    }

    return people
      .filter((person) => fullName(person).toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [people, query]);

  return (
    <aside className="feed-right-column">
      {recommended ? (
        <section className="feed-panel feed-like-panel">
          <div className="feed-panel-title-row">
            <h2>You Might Like</h2>
            <a href="#top">See All</a>
          </div>
          <div className="feed-recommend-person">
            <img src={recommended.avatarUrl ?? "/assets/images/people2.png"} alt="" />
            <div>
              <strong>Radovan SkillArena</strong>
              <span>Founder & CEO at Trophy</span>
            </div>
          </div>
          <div className="feed-recommend-actions">
            <button type="button">Ignore</button>
            <button type="button">Follow</button>
          </div>
        </section>
      ) : null}
      <section className="feed-panel feed-friends-panel">
        <div className="feed-panel-title-row">
          <h2>Your Friends</h2>
          <a href="#top">See All</a>
        </div>
        <label className="feed-friend-search">
          <SearchIcon />
          <input placeholder="input search text" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        {visibleFriends.map((person, index) => (
          <div className="feed-friend-row" key={person.id}>
            <img src={person.avatarUrl ?? "/assets/images/Avatar.png"} alt="" />
            <div>
              <strong>{fullName(person)}</strong>
              <span>CEO of {index === 0 ? "Apple" : index === 1 ? "Linkedin" : "Figma"}</span>
            </div>
            {index === 0 ? <small>5 minute ago</small> : <i aria-hidden="true" />}
          </div>
        ))}
        {visibleFriends.length === 0 ? <p className="feed-empty-friends">No friends found</p> : null}
      </section>
    </aside>
  );
}
