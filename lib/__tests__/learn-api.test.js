import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  vocabularyQuestion: {
    findMany: jest.fn(),
  },
  listeningQuestion: {
    findMany: jest.fn(),
  },
  grammarQuestion: {
    findMany: jest.fn(),
  },
  learningSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  sessionQuestion: {
    createMany: jest.fn(),
    update: jest.fn(),
  },
  history: {
    create: jest.fn(),
  },
}));

jest.mock("@/lib/auth");

describe("Learn Session APIs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/learn/session - Create Session", () => {
    it("should create a session and return questions for vocabulary", async () => {
      const mockQuestions = [
        {
          id: "q1",
          question: "What is the color of the sky?",
          options: { A: "Blue", B: "Red", C: "Green", D: "Yellow" },
          answer: "A",
        },
        {
          id: "q2",
          question: "How many fingers do you have?",
          options: { A: "5", B: "10", C: "20", D: "15" },
          answer: "B",
        },
      ];

      prisma.vocabularyQuestion.findMany.mockResolvedValue(mockQuestions);
      prisma.learningSession.create.mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        method: "vocabulary",
        level: "A1",
        total: 2,
        score: 0,
        status: "IN_PROGRESS",
        createdAt: new Date(),
      });

      prisma.sessionQuestion.createMany.mockResolvedValue({
        count: 2,
      });

      const req = new Request("http://localhost/api/learn/session", {
        method: "POST",
        body: JSON.stringify({
          method: "vocabulary",
          level: "A1",
          limit: 2,
        }),
      });

      const res = await postSession(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session.method).toBe("vocabulary");
      expect(data.data.session.total).toBe(2);
      expect(data.data.questions).toHaveLength(2);
    });

    it("should return 400 for invalid method", async () => {
      const req = new Request("http://localhost/api/learn/session", {
        method: "POST",
        body: JSON.stringify({
          method: "invalid",
          level: "A1",
          limit: 5,
        }),
      });

      const res = await postSession(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should handle missing questions gracefully", async () => {
      prisma.vocabularyQuestion.findMany.mockResolvedValue([]);

      const req = new Request("http://localhost/api/learn/session", {
        method: "POST",
        body: JSON.stringify({
          method: "vocabulary",
          level: "A1",
          limit: 5,
        }),
      });

      const res = await postSession(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.questions).toHaveLength(0);
    });
  });

  describe("GET /api/learn/session - Fetch Session", () => {
    it("should retrieve an existing session with questions", async () => {
      prisma.learningSession.findUnique.mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        method: "vocabulary",
        level: "A1",
        total: 2,
        score: 0,
        status: "IN_PROGRESS",
        sessionQuestions: [
          {
            id: "sq1",
            sessionId: "session-1",
            questionId: "q1",
            snapshot: {
              question: "What is the color?",
              options: { A: "Blue", B: "Red" },
            },
            userAnswer: null,
            isCorrect: null,
          },
        ],
      });

      const req = new Request(
        "http://localhost/api/learn/session?sessionId=session-1",
      );

      const res = await getSession(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.session.id).toBe("session-1");
      expect(data.data.questions).toHaveLength(1);
    });

    it("should return 404 when session not found", async () => {
      prisma.learningSession.findUnique.mockResolvedValue(null);

      const req = new Request(
        "http://localhost/api/learn/session?sessionId=invalid",
      );

      const res = await getSession(req);
      const data = await res.json();

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/learn/session/[id] - Submit Session", () => {
    it("should score answers and save to History", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        method: "vocabulary",
        level: "A1",
        total: 2,
        score: 0,
        status: "IN_PROGRESS",
        sessionQuestions: [
          {
            id: "sq1",
            questionId: "q1",
            snapshot: { answer: "A" },
            userAnswer: null,
          },
          {
            id: "sq2",
            questionId: "q2",
            snapshot: { answer: "B" },
            userAnswer: null,
          },
        ],
      };

      const mockAnswers = {
        sq1: "A",
        sq2: "B",
      };

      prisma.learningSession.findUnique.mockResolvedValue(mockSession);
      prisma.sessionQuestion.update
        .mockResolvedValueOnce({
          ...mockSession.sessionQuestions[0],
          userAnswer: "A",
          isCorrect: true,
        })
        .mockResolvedValueOnce({
          ...mockSession.sessionQuestions[1],
          userAnswer: "B",
          isCorrect: true,
        });

      prisma.learningSession.update.mockResolvedValue({
        ...mockSession,
        score: 2,
        status: "COMPLETED",
      });

      prisma.history.create.mockResolvedValue({
        id: "h1",
        userId: "user-1",
        mode: "vocabulary",
        status: "pass",
        difficulty: "A1",
      });

      const req = new Request("http://localhost/api/learn/session/session-1", {
        method: "POST",
        body: JSON.stringify({
          answers: mockAnswers,
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "session-1" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.results.totalCorrect).toBe(2);
      expect(data.data.results.percentage).toBe(100);
    });

    it("should calculate partial credit correctly", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        total: 2,
        sessionQuestions: [
          {
            id: "sq1",
            snapshot: { answer: "A" },
          },
          {
            id: "sq2",
            snapshot: { answer: "B" },
          },
        ],
      };

      const mockAnswers = {
        sq1: "A",
        sq2: "C",
      };

      prisma.learningSession.findUnique.mockResolvedValue(mockSession);
      prisma.sessionQuestion.update
        .mockResolvedValueOnce({
          ...mockSession.sessionQuestions[0],
          userAnswer: "A",
          isCorrect: true,
        })
        .mockResolvedValueOnce({
          ...mockSession.sessionQuestions[1],
          userAnswer: "C",
          isCorrect: false,
        });

      prisma.learningSession.update.mockResolvedValue({
        ...mockSession,
        score: 1,
        status: "COMPLETED",
      });

      const req = new Request("http://localhost/api/learn/session/session-1", {
        method: "POST",
        body: JSON.stringify({
          answers: mockAnswers,
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "session-1" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.results.totalCorrect).toBe(1);
      expect(data.data.results.percentage).toBe(50);
    });

    it("should return 404 when session not found", async () => {
      prisma.learningSession.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/learn/session/invalid", {
        method: "POST",
        body: JSON.stringify({
          answers: {},
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "invalid" } });
      const data = await res.json();

      expect(res.status).toBe(404);
    });

    it("should not allow resubmission of completed session", async () => {
      prisma.learningSession.findUnique.mockResolvedValue({
        id: "session-1",
        status: "COMPLETED",
      });

      const req = new Request("http://localhost/api/learn/session/session-1", {
        method: "POST",
        body: JSON.stringify({
          answers: {},
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "session-1" } });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/learn/session/[id] - Get Session Details", () => {
    it("should return session with all questions and answers", async () => {
      prisma.learningSession.findUnique.mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        method: "vocabulary",
        level: "A1",
        total: 2,
        score: 2,
        status: "COMPLETED",
        sessionQuestions: [
          {
            id: "sq1",
            snapshot: { question: "Q1" },
            userAnswer: "A",
            isCorrect: true,
          },
          {
            id: "sq2",
            snapshot: { question: "Q2" },
            userAnswer: "B",
            isCorrect: true,
          },
        ],
      });

      const req = new Request("http://localhost/api/learn/session/session-1");

      const res = await getSessionDetails(req, { params: { id: "session-1" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.session.status).toBe("COMPLETED");
      expect(data.data.questions).toHaveLength(2);
    });

    it("should return 404 for non-existent session", async () => {
      prisma.learningSession.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/learn/session/invalid");

      const res = await getSessionDetails(req, { params: { id: "invalid" } });
      const data = await res.json();

      expect(res.status).toBe(404);
    });
  });

  describe("Edge Cases", () => {
    it("should handle sessions with no questions", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        total: 0,
        sessionQuestions: [],
      };

      prisma.learningSession.findUnique.mockResolvedValue(mockSession);

      const req = new Request("http://localhost/api/learn/session/session-1", {
        method: "POST",
        body: JSON.stringify({
          answers: {},
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "session-1" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.results.percentage).toBe(0);
    });

    it("should sanitize answers with extra session questions", async () => {
      const mockSession = {
        id: "session-1",
        total: 1,
        sessionQuestions: [
          {
            id: "sq1",
            snapshot: { answer: "A" },
          },
        ],
      };

      const mockAnswers = {
        sq1: "A",
        sq2: "B",
        sq3: "C",
      };

      prisma.learningSession.findUnique.mockResolvedValue(mockSession);
      prisma.sessionQuestion.update.mockResolvedValueOnce({
        userAnswer: "A",
        isCorrect: true,
      });

      prisma.learningSession.update.mockResolvedValue({
        ...mockSession,
        score: 1,
        status: "COMPLETED",
      });

      const req = new Request("http://localhost/api/learn/session/session-1", {
        method: "POST",
        body: JSON.stringify({
          answers: mockAnswers,
        }),
      });

      const res = await postSessionSubmit(req, { params: { id: "session-1" } });

      expect(res.status).toBe(200);
      expect(prisma.sessionQuestion.update).toHaveBeenCalledTimes(1);
    });
  });
});
