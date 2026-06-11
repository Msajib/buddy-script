# Buddy Script Next.js App

Converted Buddy Script social feed built with Next.js, Prisma, PostgreSQL, and the supplied reference assets.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and confirm `DATABASE_URL` points to PostgreSQL:

```bash
copy .env.example .env
```

3. Start the local PostgreSQL service:

```bash
docker compose up -d
```

4. Create database tables and seed demo data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

For a larger feed dataset, seed 2000 posts:

```bash
npm run prisma:seed:2000
```

To add 1000 extra users without deleting existing posts:

```bash
npm run prisma:seed:1000-users
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

Password for all demo users: `Password123`

- `alex@example.com`
- `maria@example.com`
- `sam@example.com`

## Feed Loading

The feed is cursor-paginated for large databases. The first render loads 10 posts max. When the center feed column scrolls near the bottom, the client calls `/api/posts?limit=10&cursor=...` for the next chunk. It does not load all posts at once.

Sidebar people lists are derived from loaded feed authors/commenters/repliers and exclude the logged-in user.

## Useful Commands

```bash
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:seed:2000
npm run prisma:seed:1000-users
```
