const stories = [
  { name: "Your Story", image: "/assets/images/card_ppl1.png", self: true },
  { name: "Ryan Roslansky", image: "/assets/images/card_ppl2.png" },
  { name: "Ryan Roslansky", image: "/assets/images/card_ppl3.png" },
  { name: "Ryan Roslansky", image: "/assets/images/card_ppl4.png" }
];

export function Stories() {
  return (
    <section className="feed-story-row" aria-label="Stories">
      {stories.map((story) => (
        <article className="feed-story-card" key={`${story.name}-${story.image}`}>
          <img src={story.image} alt="" />
          <div className="feed-story-overlay" />
          {story.self ? <button type="button" aria-label="Add story">+</button> : <img className="feed-story-avatar" src="/assets/images/mini_pic.png" alt="" />}
          <strong>{story.name}</strong>
        </article>
      ))}
      <button className="feed-story-next" type="button" aria-label="Next stories">
        →
      </button>
    </section>
  );
}
