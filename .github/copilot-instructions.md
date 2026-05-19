# Copilot / AI Agent Instructions for Learnlang

Brief focused guidance to help coding agents be productive in this repository.

## 1. Big picture

- Next.js 16 app using the App Router located under `app/` (pages, layout, providers). The runtime is started via a custom Node server (`server.js`) so WebSocket (`socket.io`) can be attached to the same HTTP server.
- API routes live under `app/api/` and follow Next.js route handlers (e.g., `app/api/evaluate/route.js`).
- Prisma (MySQL) is the canonical data layer (`prisma/` + `lib/prisma.js`).
- Real-time features use Socket.IO; server initializes `global.io` in `server.js` and helpers live in `lib/socket.js`.

## 2. How to run & common commands

- Install: `npm install`
- Local dev: `npm run dev` (this runs `node server.js`, not `next dev`).
- Build: `npm run build` and production start: `npm start` (both use `server.js`).
- Prisma: `npx prisma generate`, `npx prisma migrate dev`, `npm run db:seed` (seed script: `prisma/seed.js`).
- DB UI: `npm run db:studio`.
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`.

## 3. Important environment variables

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — next-auth config (see `lib/auth.js`).
- `DATABASE_URL` — Prisma MySQL connection (see `prisma/schema.prisma`).
- `OLLAMA_API_URL` — optional, points to local Ollama server for AI evaluation (README uses `http://localhost:11434`).
- `LOG_LEVEL` — control logging verbosity: `DEBUG`, `INFO` (default), `WARN`, `ERROR`.

## 4. Project-specific conventions & patterns

- Server bootstrap: `server.js` starts Next + attaches Socket.IO. Don't replace it with plain `next dev` unless you also mount sockets separately.
- Socket rooms naming: use `blog:{slug}` and `room:{roomId}` (see `server.js` and `lib/socket.js`). Use the helpers in `lib/socket.js` (e.g., `emitNewComment`, `emitNewMessage`) to broadcast events.
- Prisma client: import `prisma` from `lib/prisma.js` which implements a single global client to avoid multiple instances in dev.
- Auth: NextAuth credentials provider is configured in `lib/auth.js`. Sessions use `jwt` strategy and user fields (id, role, username, avatar) are added to the token/session.
- AI evaluation: server-side route `app/api/evaluate/route.js` (and `app/api/generate-sentence/route.js`) call the AI service; prefer using `OLLAMA_API_URL` when available.
- API responses: All routes should use `ApiResponse` helper from `lib/api-response.js` for consistent JSON structure (success, error, validation errors, rate limits).
- Validation: Use schemas from `lib/validation.js` to validate all request bodies before processing.
- Rate limiting: Use preset limiters from `lib/ratelimit.js` (evaluate: 10/15min, create: 30/15min, read: 50/15min, general: 100/15min).
- Logging: Use namespaced loggers from `lib/logger.js` (apiLogger, dbLogger, socketLogger, authLogger) instead of console.log.

## 5. Code locations to reference for common tasks

- Root layout & providers: `app/layout.js`, `app/providers.js` — theme, fonts, global UI.
- Pages by feature:
  - Learning: `app/learn/page.js`, `app/history/page.js`
  - Quiz: `app/quiz/[id]/page.js`, `app/admin/quizzes/`
  - Blog: `app/blogs/[slug]/page.js`
  - Chat: `app/chats/page.js` (direct messaging with real-time WebSocket)
  - Community: `app/diskusi/[roomId]/page.js` (discussion rooms), `app/friends/page.js` (follow/friend management)
- API handlers: `app/api/*/route.js` (search here for request/response patterns).
  - Messages: `app/api/messages/*` (send, list, attachments)
  - Chat queries: `app/api/messages/conversation/[userId]`, `app/api/messages/list`
- Validation & schemas: `lib/validation.js` — all request body validators.
- Rate limiting: `lib/ratelimit.js` — preset limiters and middleware.
- Logging: `lib/logger.js` — centralized logging with namespaces.
- Error handling: `lib/api-response.js` — standardized API responses + `withErrorHandler` wrapper.
- Error boundaries: `components/ErrorBoundary.jsx` — React error UI.
- Notifications: `lib/notifications.js` — universal notification system with `createNotification()`, `createBulkNotifications()`, helper functions for all features.
- Realtime helpers: `lib/socket.js` (emit helpers: `emitNewComment`, `emitNewMessage`, `emitNewPrivateMessage`), `lib/friends-utils.js` (follow state sync) and server bootstrap `server.js`.
- Database models & intent: `prisma/schema.prisma` (History scoring, Role enum, Quiz models, Message/Conversation schemas, NotificationType enum).
- Auth flow: `lib/auth.js` and NextAuth config via `app/api/auth/[...nextauth]/route.js`.
- UI components: `components/` (examples: `BlogComments.jsx`, `BlogReactions.jsx`, `ChatWindow.jsx`).

## 6. Testing infrastructure & guidelines

### Test setup

- Jest configured for Node tests + Babel for ES modules/JSX support (`jest.config.js`, `babel.config.js`)
- Prisma mocked in `jest.setup.js` — all `prisma.*` calls return mock functions
- Test files location:
  - Unit tests: `lib/__tests__/*.test.js` (validation, ratelimit, logger)
  - Integration tests: `app/api/__tests__/*.integration.test.js` (auth, evaluate, quiz)

### Running tests

```bash
npm test              # Run all tests (65 tests, all passing ✅)
npm run test:watch   # Watch mode (re-run on file change)
npm run test:coverage # Coverage report (aim for >85%)
```

### Test structure

**Unit tests** (`lib/__tests__/`): Test utilities in isolation

- `validation.test.js` — schema validators, email/password helpers (14 tests)
- `ratelimit.test.js` — rate limiter logic, preset limits, window expiration (15 tests)
- `logger.test.js` — logging methods and output format (14 tests)

**Integration tests** (`app/api/__tests__/`): Test API route patterns with mocked DB

- `auth.integration.test.js` — registration, login flow, validation errors (3 tests)
- `evaluate.integration.test.js` — AI evaluation, score calculation, rate limiting (10 tests)
- `quiz.integration.test.js` — quiz creation, submission scoring, retrieval (8 tests)

### Writing new tests

1. **Import test utilities:**

   ```javascript
   import { describe, it, expect, beforeEach, jest } from "@jest/globals";
   import { schemas } from "@/lib/validation";
   import { prisma } from "@/lib/prisma";
   ```

2. **Mock Prisma** (auto-imported from `jest.setup.js`):

   ```javascript
   prisma.user.findUnique.mockResolvedValue({
     id: "1",
     email: "test@example.com",
   });
   const user = await prisma.user.findUnique({
     where: { email: "test@example.com" },
   });
   expect(user.id).toBe("1");
   ```

3. **Test validation:**

   ```javascript
   const result = schemas.registerSchema({ email: "bad", password: "short" });
   expect(result.valid).toBe(false);
   expect(result.errors).toEqual(expect.arrayContaining(["Invalid email"]));
   ```

4. **Assert behavior:**
   ```javascript
   expect(consoleLogSpy).toHaveBeenCalled();
   expect(limiter.isAllowed("user-1")).toBe(false);
   expect(entry.count).toBe(1);
   ```

### Testing patterns for this project

- **Validation tests:** Test both valid data and edge cases (empty string, too short, invalid format, missing fields)
- **Rate limiting tests:** Test `isAllowed()`, `increment()`, window expiration, different preset limits
- **Logger tests:** Test that correct log level is called (info, warn, error) with properly formatted output
- **API route tests:** Mock Prisma queries, test response structure, status codes (200, 400, 401, 429, 500)
- **Mocking async calls:** Use `mockResolvedValue()` for successful responses, `mockRejectedValue()` for errors

### Coverage expectations

- Unit tests (`lib/`): Aim for >85% coverage on new utilities
- Integration tests (`app/api/`): Test happy path + error cases (validation fail, unauthorized, rate limit)
- Current coverage: `validation.js` 40%, `ratelimit.js` 90%, `logger.js` 93%

### Common test patterns

```javascript
// Mocking Prisma with resolved value
prisma.user.findUnique.mockResolvedValue({
  id: "user-1",
  email: "test@example.com",
});
const user = await prisma.user.findUnique({
  where: { email: "test@example.com" },
});
expect(user.id).toBe("user-1");
expect(prisma.user.findUnique).toHaveBeenCalledWith({
  where: { email: "test@example.com" },
});

// Testing validation schemas
const result = schemas.registerSchema({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
expect(result.valid).toBe(true);

// Testing rate limit blocking
const limiter = new RateLimiter(1000, 5); // 1sec window, 5 requests max
for (let i = 0; i < 5; i++) limiter.increment("user-1");
expect(limiter.isAllowed("user-1")).toBe(false); // 6th request blocked

// Testing logger spies
const spy = jest.spyOn(console, "log");
appLogger.info("Test message", { userId: 123 });
if (spy.mock.calls.length > 0) {
  expect(spy.mock.calls[0][0]).toContain("Test message");
  expect(spy.mock.calls[0][0]).toContain("userId");
}
spy.mockRestore();
```

### When to skip or mock testing

- React component UI tests — use `IMPLEMENTATION_EXAMPLE.md` for render patterns, focus on critical paths
- External service calls (Ollama, email) — mock with `jest.mock()` or `mockResolvedValue()`
- DB migrations — test with `npm run db:migrate dev` locally, not in Jest
- Socket.IO real-time behavior — test with actual server running, inspect console logs

## 7. Debugging tips for agents

- To reproduce real-time behavior: run `npm run dev` and open the app; inspect server console output for Socket.IO logs (connect/disconnect, join/leave).
- If working with DB schema changes: run `npx prisma generate` and `npx prisma migrate dev` locally; migrations exist under `prisma/migrations/`.
- For AI-related work: either run an Ollama server locally (README instructions) or mock calls to the evaluate/generate sentence endpoints.
- For test failures: run `npm test -- --verbose` to see full error messages and stack traces.
- For coverage gaps: run `npm run test:coverage` and review the report to identify untested code paths.

## 8. Helpful examples for code edits

- **Send a notification to any user:** use `createNotification()` from `lib/notifications.js` for any feature event:

  ```javascript
  import { createNotification, NotificationType } from "@/lib/notifications";

  await createNotification({
    userId: recipientId,
    type: NotificationType.BLOG_COMMENT,
    title: "Komentar Baru",
    description: `${userName} berkomentar pada artikel Anda`,
    icon: "💬", // Optional, defaults to type's icon
    link: `/blogs/${blogSlug}`,
    metadata: { commentId, blogId }, // Optional, passed as object
  });
  ```

  - Types available: `FOLLOW`, `FRIEND_REQUEST`, `FRIEND_REQUEST_ACCEPTED`, `BLOG_COMMENT`, `BLOG_REACTION`, `QUIZ_CREATED`, `MESSAGE_RECEIVED`, `ROOM_MESSAGE`, etc.
  - Automatically emits real-time notification via Socket.IO to recipient's `user:{userId}` room
  - Use `createBulkNotifications()` for broadcasting to multiple users (e.g., all followers)

- **Emitting a new comment from server code:** call `emitNewComment(blogSlug, comment)` from `lib/socket.js` — this uses `blog:{slug}` room.
- **Emitting a new private message:** call `emitNewPrivateMessage(receiverId, message)` from `lib/socket.js` — this broadcasts to recipient's real-time chat.
- **Access Prisma:** `import { prisma } from '@/lib/prisma'` and follow existing patterns (use `.findUnique`, `.create`, etc.).
- **Update session fields:** follow `authOptions.callbacks.jwt` and `.session` in `lib/auth.js` to keep token/session in sync.
- **Validate API request:** import `schemas` from `lib/validation`, check `schemas.registerSchema(body)` before processing.
- **Rate limit a route:** import `limiters, getRateLimitKey` from `lib/ratelimit`, check `limiters.evaluate.middleware()` early in handler.
- **Log API activity:** use `apiLogger.logApiRequest(method, path, statusCode, duration)` instead of console.log.
- **Return standardized response:** use `jsonResponse(ApiResponse.success(data), 200)` or `ApiResponse.validationError(errors)`.
- **Follow state sync in UI:** import functions from `lib/friends-utils.js` (`buildFollowingIdSet`, `applyFollowStateToList`, `syncFollowStateAcrossCollections`) to keep friend lists in sync after follow/unfollow actions.

## 9. Non-obvious gotchas

- Dev server uses `node server.js`. Replacing the start command with `next dev` will remove the Socket.IO integration.
- Chat page (`app/chats/page.js`) is a server component that reads `searchParams.userId` and passes `initialUserId` prop to client component (`ChatsClient`). This avoids prerender bailout for dynamic routes in Next.js 16.

- Prisma client uses a global variable to avoid 'too many connections' during HMR in dev — keep that pattern.
- Global sockets are stored on `global.io`; accessing before server boot will throw (see `getIO()` in `lib/socket.js`).
- Validation helpers return truthy/falsy values, not always strict booleans — use `.toBeFalsy()` in tests, not `.toBe(false)`.
- Logger respects `LOG_LEVEL` environment variable — if no logs appear, check env and `jest.setup.js`.
- Rate limiter uses in-memory Map (not Redis yet) — will reset on server restart, use for dev only.
- **Notification system is universal:** Use `createNotification()` from `lib/notifications.js` for ANY feature that needs to notify users. Don't create inline `prisma.notification.create()` calls — the utility handles both DB persistence and real-time emission in one call. See `lib/notifications.js` for all available notification types and helper functions.

If anything here is incomplete or you want more examples, tell me which area to expand.
