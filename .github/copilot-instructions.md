# Copilot / AI Agent Instructions for Learnlang

Brief focused guidance to help coding agents be productive in this repository.

1. Big picture

- Next.js 16 app using the App Router located under `app/` (pages, layout, providers). The runtime is started via a custom Node server (`server.js`) so WebSocket (`socket.io`) can be attached to the same HTTP server.
- API routes live under `app/api/` and follow Next.js route handlers (e.g., `app/api/evaluate/route.js`).
- Prisma (MySQL) is the canonical data layer (`prisma/` + `lib/prisma.js`).
- Real-time features use Socket.IO; server initializes `global.io` in `server.js` and helpers live in `lib/socket.js`.

2. How to run & common commands

- Install: `npm install`
- Local dev: `npm run dev` (this runs `node server.js`, not `next dev`).
- Build: `npm run build` and production start: `npm start` (both use `server.js`).
- Prisma: `npx prisma generate`, `npx prisma migrate dev`, `npm run db:seed` (seed script: `prisma/seed.js`).
- DB UI: `npm run db:studio`.

3. Important environment variables

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — next-auth config (see `lib/auth.js`).
- `DATABASE_URL` — Prisma MySQL connection (see `prisma/schema.prisma`).
- `OLLAMA_API_URL` — optional, points to local Ollama server for AI evaluation (README uses `http://localhost:11434`).

4. Project-specific conventions & patterns

- Server bootstrap: `server.js` starts Next + attaches Socket.IO. Don't replace it with plain `next dev` unless you also mount sockets separately.
- Socket rooms naming: use `blog:{slug}` and `room:{roomId}` (see `server.js` and `lib/socket.js`). Use the helpers in `lib/socket.js` (e.g., `emitNewComment`, `emitNewMessage`) to broadcast events.
- Prisma client: import `prisma` from `lib/prisma.js` which implements a single global client to avoid multiple instances in dev.
- Auth: NextAuth credentials provider is configured in `lib/auth.js`. Sessions use `jwt` strategy and user fields (id, role, username, avatar) are added to the token/session.
- AI evaluation: server-side route `app/api/evaluate/route.js` (and `app/api/generate-sentence/route.js`) call the AI service; prefer using `OLLAMA_API_URL` when available.

5. Code locations to reference for common tasks

- Root layout & providers: `app/layout.js`, `app/providers.js` — theme, fonts, global UI.
- API handlers: `app/api/*/route.js` (search here for request/response patterns).
- Realtime helpers: `lib/socket.js` and server bootstrap `server.js`.
- Database models & intent: `prisma/schema.prisma` (History scoring, Role enum, Quiz models).
- Auth flow: `lib/auth.js` and NextAuth config via `app/api/auth/[...nextauth]/route.js`.
- UI components: `components/` (examples: `BlogComments.jsx`, `BlogReactions.jsx`).

6. Testing / debugging tips for agents

- To reproduce real-time behavior, run `npm run dev` and open the app; inspect server console output for Socket.IO logs (connect/disconnect, join/leave).
- If working with DB schema changes, run `npx prisma generate` and `npx prisma migrate dev` locally; migrations exist under `prisma/migrations/`.
- For AI-related work, either run an Ollama server locally (README instructions) or mock calls to the evaluate/generate sentence endpoints.

7. Helpful examples for code edits

- Emitting a new comment from server code: call `emitNewComment(blogSlug, comment)` from `lib/socket.js` — this uses `blog:{slug}` room.
- Access Prisma: `import { prisma } from '@/lib/prisma'` and follow existing patterns (use `.findUnique`, `.create`, etc.).
- Update session fields: follow `authOptions.callbacks.jwt` and `.session` in `lib/auth.js` to keep token/session in sync.

8. Non-obvious gotchas

- Dev server uses `node server.js`. Replacing the start command with `next dev` will remove the Socket.IO integration.
- Prisma client uses a global variable to avoid 'too many connections' during HMR in dev — keep that pattern.
- Global sockets are stored on `global.io`; accessing before server boot will throw (see `getIO()` in `lib/socket.js`).

If anything here is incomplete or you want more examples (tests, PR checklist, or CI-specific rules), tell me which area to expand.
