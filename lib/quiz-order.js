const DEFAULT_NAME = "";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function sortQuizzesForPath(quizzes = []) {
  return [...quizzes].sort((left, right) => {
    const leftMinXp = toNumber(left?.minXp, 0);
    const rightMinXp = toNumber(right?.minXp, 0);
    if (leftMinXp !== rightMinXp) {
      return leftMinXp - rightMinXp;
    }

    const leftOrder = toNumber(left?.order, 0);
    const rightOrder = toNumber(right?.order, 0);
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const leftCreatedAt = left?.createdAt
      ? new Date(left.createdAt).getTime()
      : 0;
    const rightCreatedAt = right?.createdAt
      ? new Date(right.createdAt).getTime()
      : 0;
    if (leftCreatedAt !== rightCreatedAt) {
      return leftCreatedAt - rightCreatedAt;
    }

    return String(left?.title || DEFAULT_NAME).localeCompare(
      String(right?.title || DEFAULT_NAME),
    );
  });
}
