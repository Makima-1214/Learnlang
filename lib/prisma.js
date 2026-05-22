import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

let prismaInstance;
try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
} catch (err) {
  console.error(
    "@prisma/client did not initialize. Run `npx prisma generate` then restart the dev server.",
  );
  throw err;
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
