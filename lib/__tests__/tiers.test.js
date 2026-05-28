import {
  computeLevelFromXP,
  computeTierLabelFromXP,
  getNextTierProgress,
} from "@/lib/tiers";

describe("tiers helper", () => {
  test("low XP maps to A1 / Perunggu", () => {
    expect(computeLevelFromXP(0)).toBe("A1");
    expect(computeTierLabelFromXP(0)).toBe("Perunggu");
  });

  test("mid XP maps to A1 / Perak", () => {
    expect(computeLevelFromXP(150)).toBe("A1");
    expect(computeTierLabelFromXP(150)).toBe("Perak");
  });

  test("higher XP maps to B1 and C1 tiers", () => {
    expect(computeLevelFromXP(300)).toBe("B1");
    expect(computeTierLabelFromXP(300)).toBe("Emas");
    expect(computeLevelFromXP(700)).toBe("B1");
    expect(computeTierLabelFromXP(700)).toBe("Platinum");
    expect(computeLevelFromXP(1200)).toBe("C1");
    expect(computeTierLabelFromXP(1200)).toBe("Diamond");
  });

  test("progress to next tier is exposed", () => {
    const progress = getNextTierProgress(150);
    expect(progress.nextXP).toBe(250);
    expect(progress.remainingXP).toBe(100);
    expect(progress.progress).toBeGreaterThan(0);
  });
});
