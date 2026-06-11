import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.replyLike.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const [alex, maria, sam] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex@example.com",
        passwordHash: hashPassword("Password123"),
        avatarUrl: "/assets/images/Avatar.png"
      }
    }),
    prisma.user.create({
      data: {
        firstName: "Maria",
        lastName: "Chen",
        email: "maria@example.com",
        passwordHash: hashPassword("Password123"),
        avatarUrl: "/assets/images/people2.png"
      }
    }),
    prisma.user.create({
      data: {
        firstName: "Sam",
        lastName: "Taylor",
        email: "sam@example.com",
        passwordHash: hashPassword("Password123"),
        avatarUrl: "/assets/images/people3.png"
      }
    })
  ]);

  const publicPost = await prisma.post.create({
    data: {
      authorId: alex.id,
      body: "-Healthy Tracking App",
      imageUrl: "/assets/images/timeline_img.png",
      visibility: "PUBLIC"
    }
  });

  const secondPost = await prisma.post.create({
    data: {
      authorId: maria.id,
      body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
      imageUrl: "/assets/images/post_img.png",
      visibility: "PUBLIC"
    }
  });

  const privatePost = await prisma.post.create({
    data: {
      authorId: sam.id,
      body: "Private note: this post is visible only to the author.",
      imageUrl: "/assets/images/photos3.png",
      visibility: "PRIVATE"
    }
  });

  const comment = await prisma.comment.create({
    data: {
      postId: publicPost.id,
      authorId: maria.id,
      body: "Nice progress. The visibility split is easy to test with the seeded accounts."
    }
  });

  const reply = await prisma.reply.create({
    data: {
      commentId: comment.id,
      authorId: sam.id,
      body: "Agreed. The newest post should always appear at the top."
    }
  });

  await prisma.postLike.createMany({
    data: [
      { postId: publicPost.id, userId: maria.id },
      { postId: publicPost.id, userId: sam.id },
      { postId: secondPost.id, userId: alex.id, reaction: "LOVE" },
      { postId: secondPost.id, userId: sam.id, reaction: "HAHA" },
      { postId: privatePost.id, userId: maria.id }
    ]
  });

  await prisma.commentLike.create({
    data: { commentId: comment.id, userId: alex.id }
  });

  await prisma.replyLike.create({
    data: { replyId: reply.id, userId: alex.id }
  });

  console.log("Seed complete.");
  console.log("Demo users: alex@example.com, maria@example.com, sam@example.com");
  console.log("Password for all demo users: Password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
