/**
 * Jest setup file for test environment
 */

// Mock Prisma Client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    history: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    blog: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    quiz: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    reaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    quizResult: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Set test environment variables
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test";
// Note: DO NOT set LOG_LEVEL here - it's needed for logger tests
