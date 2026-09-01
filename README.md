# Spark ⚡️

A mini Instagram clone built for the Penn Spark web development assessment.

**Live demo:** _coming soon — deployment link will go here_

## What it does

Spark is a small photo-sharing social network. You can create an account, post photos with captions, browse a global feed, like posts (including Instagram-style double-tap-to-like), leave comments, and visit user profiles that show their photos in a classic 3-column grid.

## Features

**Frontend**

- Reusable React components (`PostCard`, `AuthForm`, `Navbar`, `NewPostForm`, …)
- Animations: fade-in on page load, a popping heart on double-tap like, hover/press micro-interactions
- Fully mobile responsive (single-column feed, responsive profile grid)

**Backend**

- User registration / login / logout with bcrypt-hashed passwords and a JWT session stored in an httpOnly cookie
- REST API routes for auth, posts, likes, and comments — all with input validation and auth guards
- Database integration through the Prisma ORM (`User`, `Post`, `Like`, `Comment` models with relations)

**Full-stack**

- Next.js App Router links the React frontend with the Node backend in one codebase: server components query the database directly, and client components call the REST API for interactions (optimistic like updates, live comment posting)
- Photos are resized and compressed client-side with the Canvas API before upload, then stored in the database — no third-party storage needed

## Tech stack

Next.js 16 (React 19, TypeScript) · Tailwind CSS 4 · Prisma 6 · SQLite (dev) / Postgres (production) · bcryptjs + jose (auth)

## Time spent

About 3–4 hours.

## Running locally

```bash
git clone <this-repo>
cd penn-spark
npm install

# create the environment file — see .env.example
# you'll need a free Postgres database (e.g. https://neon.tech)
cp .env.example .env
# ...then edit .env with your real connection strings

# create the database tables from the Prisma schema
npx prisma db push

npm run dev
```

Then open http://localhost:3000, sign up, and start posting.
