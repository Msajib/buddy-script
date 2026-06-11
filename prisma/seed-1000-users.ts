import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const TOTAL_USERS = 1000;
const PASSWORD = "Password123";

const avatars = [
  "/assets/images/Avatar.png",
  "/assets/images/people1.png",
  "/assets/images/people2.png",
  "/assets/images/people3.png",
  "/assets/images/mini_pic.png"
];

function userCode(index: number) {
  return String(index + 1).padStart(4, "0");
}

async function main() {
  const passwordHash = hashPassword(PASSWORD);
  const users = Array.from({ length: TOTAL_USERS }, (_, index) => {
    const code = userCode(index);

    return {
      firstName: "Seed",
      lastName: `User ${code}`,
      email: `user${code}@example.com`,
      avatarUrl: avatars[index % avatars.length],
      passwordHash
    };
  });

  const chunkSize = 100;
  let seededCount = 0;

  for (let start = 0; start < users.length; start += chunkSize) {
    const chunk = users.slice(start, start + chunkSize);

    await Promise.all(
      chunk.map((user) =>
        prisma.user.upsert({
          where: { email: user.email },
          update: {
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            passwordHash: user.passwordHash
          },
          create: user
        })
      )
    );

    seededCount += chunk.length;
  }

  console.log(`Seeded ${seededCount} users.`);
  console.log(`Password for seeded users: ${PASSWORD}`);
  console.log("Example seeded user: user0001@example.com");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
