# Copilot / AI Agent Instructions for Learnlang

Learnlang is a Next.js 16 App Router app with a custom Node server. `npm run dev` and `npm start` run `node server.js`, which boots Next and attaches Socket.IO on the same HTTP server.

## Architecture

- App routes live under `app/`; API handlers are in `app/api/*/route.js`.
- Prisma/MySQL is the source of truth via `lib/prisma.js` and `prisma/schema.prisma`.
- Real-time features use Socket.IO rooms from `server.js` and helpers in `lib/socket.js`.
- Auth uses NextAuth credentials in `lib/auth.js`; sessions use JWT and carry `id`, `role`, `username`, and `avatar`.

## Developer workflow

- Install with `npm install`.
- Build with `npm run build`; verify production with `npm start`.
- Prisma commands: `npm run db:generate`, `npm run db:migrate`, `npm run db:studio`, `npm run db:seed`.
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`.
- If schema changes are made, run Prisma generate/migrate before assuming routes are healthy.

## API conventions

- Prefer `ApiResponse` + `jsonResponse()` from `lib/api-response.js` for all route responses.
- Wrap route handlers with `withErrorHandler()` when you want automatic timing/logging and a consistent 500 fallback.
- Validate request bodies with schemas from `lib/validation.js` before touching Prisma.
- Use `limiters.*` and `getRateLimitKey()` from `lib/ratelimit.js`; common presets are `evaluate`, `create`, `read`, and `general`.
- Common route patterns: `app/api/evaluate/route.js`, `app/api/learn/[method]/route.js`, `app/api/messages/send/route.js`, `app/api/friends/*`.

## Realtime patterns

- Socket room names are stable and intentional: `blog:{slug}`, `room:{roomId}`, `dm:{sortedUserIds}`, and `user:{userId}`.
- Use helpers like `emitNewComment()`, `emitNewMessage()`, `emitNewPrivateMessage()`, and `emitNewNotification()` instead of emitting directly.
- `app/chats/page.js` passes `searchParams.userId` to `ChatsClient`; `app/diskusi/[roomId]/page.js` joins the discussion room on mount.

## Notifications and social flows

- Use `createNotification()` / `createBulkNotifications()` from `lib/notifications.js` for follow, friend request, blog, quiz, chat, and room events.
- Notification types are centralized in `NotificationType`; the utility both persists to Prisma and emits to `user:{userId}`.
- Social actions often fan out across Prisma + realtime + notifications; follow the patterns in `app/api/friends/request/route.js` and `app/api/friends/follow/route.js`.

## Data model signals

- `prisma/schema.prisma` defines the main domains: `History`, `Blog`, `Comment`, `Reaction`, `Quiz*`, `Room`, `Message`, `Follow`, `FriendRequest`, `BlockedUser`, `PrivateMessage`, `Activity`, and `Notification`.
- Learning history stores `Mode`, `Status`, and `Difficulty`; blog reactions are constrained by a unique `(blogId, userId, emoji)` index.
- Private chat and discussion features are separate: `Message` belongs to `Room`, while `PrivateMessage` is used for direct messaging.

## UI and component cues

- Root layout/providers live in `app/layout.js` and `app/providers.js`.
- Reusable UI lives in `components/`, with notable feature components such as `ChatWindow.jsx`, `BlogComments.jsx`, `BlogReactions.jsx`, and `FriendsList.jsx`.
- `components/ErrorBoundary.jsx` is the app-level error UI.

## Testing and debugging

- Jest is configured for Node + React via `jest.config.js` and `babel.config.js`.
- Prisma is mocked in `jest.setup.js`; tests should assert calls on mocked Prisma methods rather than hitting the DB.
- For realtime issues, run the app and watch server logs from `server.js`; Socket.IO state is kept on `global.io`.
- AI evaluation routes depend on `OLLAMA_API_URL`; if it is unset, the app should still behave gracefully.

## Gotchas

- Do not replace the custom server with plain `next dev`; Socket.IO would be lost.
- Keep using the shared Prisma client to avoid duplicate connections during dev.
- Logging should go through the namespaced loggers in `lib/logger.js`, not ad hoc `console.log`.

If you add new guidance, keep it tied to a file or route that already exists in this repo.
