/**
 * Procedural level config for levels 1–80.
 * L1: 50 slow straight drops. L2: ~100 with mixed speed. L80: ~400, fast, varied trajectories.
 */
export function getLevelConfig(level) {
  const clampedLevel = Math.max(1, Math.min(80, level));
  const t = (clampedLevel - 1) / 79;

  let totalObjects;
  if (clampedLevel === 1) {
    totalObjects = 50;
  } else if (clampedLevel === 2) {
    totalObjects = 100;
  } else {
    totalObjects = Math.round(100 + ((clampedLevel - 2) / 78) * 300);
  }

  let spawnIntervalMs;
  if (clampedLevel === 1) {
    spawnIntervalMs = 1200;
  } else if (clampedLevel === 2) {
    spawnIntervalMs = 800;
  } else {
    spawnIntervalMs = Math.round(800 - ((clampedLevel - 2) / 78) * 550);
  }

  const speedMin = clampedLevel === 1 ? 80 : clampedLevel === 2 ? 80 : Math.round(80 + t * 40);
  const speedMax = clampedLevel === 1 ? 100 : clampedLevel === 2 ? 180 : Math.round(120 + t * 280);

  return {
    level: clampedLevel,
    totalObjects,
    spawnIntervalMs: Math.max(200, spawnIntervalMs),
    speedMin,
    speedMax,
    fastRatio: clampedLevel === 1 ? 0 : clampedLevel === 2 ? 0.35 : Math.min(0.85, 0.35 + t * 0.5),
    diagonalChance: clampedLevel < 10 ? 0 : Math.min(0.7, (clampedLevel - 10) * 0.015),
    bounceChance: clampedLevel < 25 ? 0 : Math.min(0.5, (clampedLevel - 25) * 0.012),
  };
}

export const MAX_LEVEL = 80;

export function saveProgress(level, score) {
  try {
    localStorage.setItem('dickkicker_level', String(level));
    const prev = Number(localStorage.getItem('dickkicker_highscore') || 0);
    if (score > prev) {
      localStorage.setItem('dickkicker_highscore', String(score));
    }
  } catch {
    // ignore storage errors
  }
}

export function loadProgress() {
  try {
    return {
      level: Math.max(1, Math.min(MAX_LEVEL, Number(localStorage.getItem('dickkicker_level') || 1))),
      highScore: Number(localStorage.getItem('dickkicker_highscore') || 0),
    };
  } catch {
    return { level: 1, highScore: 0 };
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem('dickkicker_level');
    localStorage.removeItem('dickkicker_highscore');
  } catch {
    // ignore
  }
}
