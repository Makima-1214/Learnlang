import { sortQuizzesForPath } from "@/lib/quiz-order";

describe("sortQuizzesForPath", () => {
  it("sorts quizzes by minXp first, then order, then createdAt", () => {
    const quizzes = [
      {
        id: "c",
        title: "Advanced",
        minXp: 100,
        order: 0,
        createdAt: "2026-01-03T00:00:00.000Z",
      },
      {
        id: "a",
        title: "Starter B",
        minXp: 0,
        order: 2,
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "b",
        title: "Starter A",
        minXp: 0,
        order: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "d",
        title: "Advanced Early",
        minXp: 100,
        order: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const sorted = sortQuizzesForPath(quizzes).map((quiz) => quiz.id);

    expect(sorted).toEqual(["b", "a", "d", "c"]);
  });

  it("falls back safely when values are missing", () => {
    const quizzes = [
      { id: "x", title: "No XP" },
      { id: "y", title: "Zero XP", minXp: 0, order: 0 },
    ];

    const sorted = sortQuizzesForPath(quizzes).map((quiz) => quiz.id);

    expect(sorted).toEqual(["x", "y"]);
  });
});
