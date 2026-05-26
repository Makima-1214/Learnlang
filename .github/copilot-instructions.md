# Copilot / AI Agent Instructions for Learnlang

Learnlang is a Next.js 16 App Router app that runs through a custom Node server. `npm run dev` and `npm start` both launch `node server.js`, which boots Next and Socket.IO on the same HTTP server.

## Architecture

- App routes live under `app/`; API handlers live in `app/api/*/route.js`.
- Prisma/MySQL is the source of truth via `lib/prisma.js` and `prisma/schema.prisma`.
- Auth uses NextAuth credentials in `lib/auth.js`; JWT sessions carry `id`, `role`, `username`, and `avatar`.
- `app/providers.js` wraps the app with `SessionProvider`, `SocketProvider`, `SessionGuard`, and an automatic `DashboardLayout` for signed-in users.

## Core Domains

- Learning is session-based: `/api/learn/session` creates a `learningSession` plus `sessionQuestion` snapshots, and `/api/learn/session/[id]` fetches/submits/deletes progress.
- Direct chat uses `PrivateMessage` plus realtime receipts; discussion rooms use `Room` + `Message`.
- Social features fan out across Prisma, notifications, and Socket.IO: follows, friend requests, blog comments, reactions, and presence updates.
- The main Prisma models to inspect are `Blog`, `Comment`, `Reaction`, `Quiz*`, `Room`, `Message`, `Follow`, `FriendRequest`, `BlockedUser`, `PrivateMessage`, `Activity`, `Notification`, `LearningSession`, and `SessionQuestion`.

## API Conventions

- Prefer `ApiResponse` + `jsonResponse()` from `lib/api-response.js` for newer routes; legacy routes may still use `NextResponse.json()`.
- Wrap route handlers with `withErrorHandler()` when you want consistent timing/logging and a fallback 500 response.
- Validate request bodies with schemas from `lib/validation.js` before touching Prisma.
- Use `limiters.*` and `getRateLimitKey()` from `lib/ratelimit.js`; common presets are `create`, `read`, `general`, and `evaluate`.
- Common route patterns include `app/api/friends/request/route.js`, `app/api/messages/send/route.js`, `app/api/chats/[friendId]/messages/route.js`, and `app/api/learn/[method]/route.js`.

## Realtime Patterns

- Socket room names are intentional: `blog:{slug}`, `room:{roomId}`, `dm:{sortedUserIds}`, and `user:{userId}`.
- Use helpers from `lib/socket.js` such as `emitNewComment()`, `emitNewMessage()`, `emitNewPrivateMessage()`, `emitNewNotification()`, and `emitNewFriendRequest()`.
- `server.js` owns connection handling, user presence, typing events, and message-read receipts; `global.io` is the shared emit channel.

## Notifications and Social Flow

- Use `createNotification()` / `createBulkNotifications()` from `lib/notifications.js` for follow, friend request, blog, quiz, chat, room, and learning events.
- `NotificationType` is the canonical enum for persisted notifications, and the helper emits to `user:{userId}` unless `skipEmit` is set.
- Friend request and message flows intentionally combine Prisma writes, activity records, notifications, and realtime emits; follow the patterns in `app/api/friends/request/route.js` and `app/api/messages/send/route.js`.

## UI and Components

- `app/layout.js` sets fonts and global providers; `components/ErrorBoundary.jsx` is the app-level error UI.
- `components/MethodPracticeClient.jsx` drives the learning session UI, persistence, and submit flow.
- `components/ChatWindow.jsx` handles private chat, attachment upload, typing indicators, and read receipts.
- Reusable UI primitives live in `components/ui/` and are Shadcn-style wrappers.

## Developer Workflow

- Install with `npm install`.
- Build with `npm run build`; verify production with `npm start`.
- Prisma commands: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:studio`, `npm run db:seed`, `npm run db:reset`.
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`; Jest is configured for Node + React, and Prisma is mocked in `jest.setup.js`.
- After schema changes, run Prisma generate/migrate before assuming routes are healthy.

## Gotchas

- Do not replace the custom server with plain `next dev`; Socket.IO would be lost.
- Keep using the shared Prisma client in `lib/prisma.js` to avoid duplicate connections during dev.
- `app/api/learn/session/route.js` currently allows anonymous session creation for speed; preserve that behavior unless you are intentionally changing the learning flow.
- Logging should go through the namespaced loggers in `lib/logger.js`, not ad hoc `console.log`.

If you add guidance, keep it tied to an existing file or route in this repo.
