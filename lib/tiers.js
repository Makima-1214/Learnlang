const TIER_RULES = [
  { minXP: 0, maxXP: 99, level: "A1", tier: "Perunggu", nextXP: 100 },
  { minXP: 100, maxXP: 249, level: "A1", tier: "Perak", nextXP: 250 },
  { minXP: 250, maxXP: 499, level: "B1", tier: "Emas", nextXP: 500 },
  { minXP: 500, maxXP: 999, level: "B1", tier: "Platinum", nextXP: 1000 },
  { minXP: 1000, maxXP: Infinity, level: "C1", tier: "Diamond", nextXP: null },
];

function computeTierFromXP(xp = 0) {
  const normalizedXP = Number.isFinite(Number(xp))
    ? Math.max(0, Number(xp))
    : 0;
  return (
    TIER_RULES.find(
      (rule) => normalizedXP >= rule.minXP && normalizedXP <= rule.maxXP,
    ) || TIER_RULES[0]
  );
}

function computeTierLabelFromXP(xp = 0) {
  return computeTierFromXP(xp).tier;
}

function computeLevelFromXP(xp = 0) {
  return computeTierFromXP(xp).level;
}

function getNextTierProgress(xp = 0) {
  const currentRule = computeTierFromXP(xp);
  if (!currentRule.nextXP) {
    return { progress: 1, remainingXP: 0, nextXP: null };
  }

  const normalizedXP = Number.isFinite(Number(xp))
    ? Math.max(0, Number(xp))
    : 0;
  const rangeSize = currentRule.nextXP - currentRule.minXP;
  const progress = Math.min(
    1,
    Math.max(0, (normalizedXP - currentRule.minXP) / Math.max(rangeSize, 1)),
  );

  return {
    progress,
    remainingXP: Math.max(0, currentRule.nextXP - normalizedXP),
    nextXP: currentRule.nextXP,
  };
}

export {
  TIER_RULES,
  computeTierFromXP,
  computeTierLabelFromXP,
  computeLevelFromXP,
  getNextTierProgress,
};
