import { prisma } from "./prisma.js";
import { apiLogger } from "./logger.js";

export const ENERGY_MAX = 5;
export const ENERGY_REFILL_MINUTES = 15;
export const ENERGY_REFILL_MS = ENERGY_REFILL_MINUTES * 60 * 1000;

function clampEnergy(value) {
  const numericValue = Number(value) || 0;
  return Math.max(0, Math.min(ENERGY_MAX, numericValue));
}

function getNextRefillDate(currentDate) {
  return new Date(currentDate.getTime() + ENERGY_REFILL_MS);
}

function normalizeEnergyState(user, now = new Date()) {
  const currentEnergy = clampEnergy(user?.energy);
  let nextRefillAt = user?.energyNextRefillAt
    ? new Date(user.energyNextRefillAt)
    : null;

  if (currentEnergy >= ENERGY_MAX) {
    return {
      energy: ENERGY_MAX,
      nextRefillAt: null,
      refilled: 0,
    };
  }

  if (!nextRefillAt) {
    nextRefillAt = getNextRefillDate(now);
  }

  let energy = currentEnergy;
  let refilled = 0;
  while (energy < ENERGY_MAX && nextRefillAt && now >= nextRefillAt) {
    energy += 1;
    refilled += 1;

    if (energy >= ENERGY_MAX) {
      nextRefillAt = null;
      break;
    }

    nextRefillAt = getNextRefillDate(nextRefillAt);
  }

  return {
    energy,
    nextRefillAt,
    refilled,
  };
}

function emitEnergyUpdate(userId, payload) {
  try {
    const io = global.io;
    io?.to(`user:${userId}`).emit("energy-update", payload);
  } catch (error) {
    apiLogger.warn("Failed to emit energy update", {
      userId,
      error: error.message,
    });
  }
}

export async function getUserEnergy(
  userId,
  { persist = true, emit = false } = {},
) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      energy: true,
      energyNextRefillAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const normalized = normalizeEnergyState(user, now);
  const shouldPersist =
    persist &&
    (normalized.refilled > 0 ||
      normalized.energy !== user.energy ||
      String(normalized.nextRefillAt || null) !==
        String(user.energyNextRefillAt || null));

  if (shouldPersist) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        energy: normalized.energy,
        energyNextRefillAt: normalized.nextRefillAt,
      },
    });
  }

  const payload = {
    current: normalized.energy,
    max: ENERGY_MAX,
    nextRefillAt: normalized.nextRefillAt,
    refilled: normalized.refilled,
  };

  if (emit && shouldPersist) {
    emitEnergyUpdate(userId, payload);
  }

  return payload;
}

export async function refillAllUserEnergy({ io = global.io } = {}) {
  const now = new Date();
  const candidates = await prisma.user.findMany({
    where: {
      energy: {
        lt: ENERGY_MAX,
      },
    },
    select: {
      id: true,
      energy: true,
      energyNextRefillAt: true,
    },
  });

  const results = [];

  for (const user of candidates) {
    const normalized = normalizeEnergyState(user, now);
    if (normalized.refilled <= 0 && normalized.energy === user.energy) {
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        energy: normalized.energy,
        energyNextRefillAt: normalized.nextRefillAt,
      },
    });

    const payload = {
      current: normalized.energy,
      max: ENERGY_MAX,
      nextRefillAt: normalized.nextRefillAt,
      refilled: normalized.refilled,
    };

    io?.to(`user:${user.id}`).emit("energy-update", payload);
    results.push({ userId: user.id, ...payload });
  }

  return results;
}

export async function consumeUserEnergy(
  userId,
  amount = 1,
  { emit = true, xpPenalty = 0 } = {},
) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const energyAmount = Math.max(1, Number(amount) || 1);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      energy: true,
      energyNextRefillAt: true,
      xp: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const normalized = normalizeEnergyState(user, now);
  const spent = Math.min(energyAmount, normalized.energy);
  const nextEnergy = clampEnergy(normalized.energy - spent);
  let nextRefillAt = normalized.nextRefillAt;
  const nextXP = Math.max(
    0,
    (user.xp || 0) - Math.max(0, Number(xpPenalty) || 0),
  );

  if (spent > 0 && normalized.energy >= ENERGY_MAX && nextEnergy < ENERGY_MAX) {
    nextRefillAt = getNextRefillDate(now);
  }

  if (nextEnergy < ENERGY_MAX && !nextRefillAt) {
    nextRefillAt = getNextRefillDate(now);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      energy: nextEnergy,
      energyNextRefillAt: nextRefillAt,
      xp: nextXP,
    },
  });

  const payload = {
    current: updated.energy,
    max: ENERGY_MAX,
    nextRefillAt,
    spent,
    xp: updated.xp,
    xpPenalty: Math.max(0, Number(xpPenalty) || 0),
    refilled: 0,
  };

  if (emit) {
    emitEnergyUpdate(userId, payload);
  }

  return payload;
}
