import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const images = [
  "/assets/images/timeline_img.png",
  "/assets/images/post_img.png",
  "/assets/images/photos1.png",
  "/assets/images/photos2.png",
  "/assets/images/photos3.png",
  "/assets/images/feed_event1.png"
];

const bodies = [
  "-Healthy Tracking App",
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  "Product design review notes from today's workspace session.",
  "Sharing a quick update from the team timeline.",
  "A small public post with image, comments, replies, and reactions."
];

async function main() {
  await prisma.replyLike.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      ["Alex", "Morgan", "alex@example.com", "/assets/images/Avatar.png"],
      ["Maria", "Chen", "maria@example.com", "/assets/images/people2.png"],
      ["Sam", "Taylor", "sam@example.com", "/assets/images/people3.png"],
      ["Dylan", "Field", "dylan@example.com", "/assets/images/people1.png"],
      ["Ryan", "Roslansky", "ryan@example.com", "/assets/images/mini_pic.png"]
    ].map(([firstName, lastName, email, avatarUrl]) =>
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          avatarUrl,
          passwordHash: hashPassword("Password123")
        }
      })
    )
  );

  for (let index = 0; index < 2000; index += 1) {
    const author = users[index % users.length];
    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        body: bodies[index % bodies.length],
        imageUrl: images[index % images.length],
        visibility: index % 17 === 0 ? "PRIVATE" : "PUBLIC",
        createdAt: new Date(Date.now() - index * 1000 * 60 * 25)
      }
    });

    const commentAuthor = users[(index + 1) % users.length];
    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: commentAuthor.id,
        body: "Nice update. This looks aligned with the reference feed."
      }
    });

    await prisma.reply.create({
      data: {
        commentId: comment.id,
        authorId: users[(index + 2) % users.length].id,
        body: "Agreed, the post card should feel active and social."
      }
    });

    await prisma.postLike.createMany({
      data: [
        { postId: post.id, userId: users[(index + 1) % users.length].id, reaction: "LIKE" },
        { postId: post.id, userId: users[(index + 2) % users.length].id, reaction: index % 2 === 0 ? "LOVE" : "HAHA" }
      ],
      skipDuplicates: true
    });
  }

  console.log("Seeded 2000 posts.");
  console.log("Demo password for all users: Password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
