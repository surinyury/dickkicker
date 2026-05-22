export const PIXEL_SCALE = 3;
export const FOOT_DISPLAY_SCALE = 0.5;

export const SOURCE_TARGETS = {
  foot: 34,
  dick: 26,
};

/** @type {{ foot: SpriteConfig, dick: SpriteConfig }} */
export let SPRITES = buildDefaultSprites();

function buildSpriteConfig(key, pixelWidth, pixelHeight) {
  let displayWidth = pixelWidth * PIXEL_SCALE;
  let displayHeight = pixelHeight * PIXEL_SCALE;

  if (key === 'foot') {
    displayWidth = Math.round(displayWidth * FOOT_DISPLAY_SCALE);
    displayHeight = Math.round(displayHeight * FOOT_DISPLAY_SCALE);
  }

  const bodyWidth = key === 'foot' ? displayWidth : Math.round(displayWidth * 0.84);
  const bodyHeight = key === 'foot' ? displayHeight : Math.round(displayHeight * 0.86);
  const bodyOffsetX = key === 'foot' ? 0 : Math.round((displayWidth - bodyWidth) / 2);
  const bodyOffsetY = key === 'foot' ? 0 : Math.round((displayHeight - bodyHeight) / 2);

  return {
    key,
    pixelWidth,
    pixelHeight,
    displayWidth,
    displayHeight,
    bodyWidth,
    bodyHeight,
    bodyOffsetX,
    bodyOffsetY,
  };
}

function buildDefaultSprites() {
  return {
    foot: buildSpriteConfig('foot', 34, 60),
    dick: buildSpriteConfig('dick', 26, 22),
  };
}

export function applySpriteMetrics(metrics) {
  SPRITES = {
    foot: buildSpriteConfig('foot', metrics.foot.pixelWidth, metrics.foot.pixelHeight),
    dick: buildSpriteConfig('dick', metrics.dick.pixelWidth, metrics.dick.pixelHeight),
  };
  return SPRITES;
}

/** Playfield bounds aligned strictly to the inner border outline. */
export function getBounceBounds(width, height, border = 12) {
  return {
    x: border,
    y: border,
    width: width - border * 2,
    height: height - border * 2,
    insetX: border,
  };
}

/** Horizontal movement limits for the foot (strictly its outline width). */
export function getFootMoveLimits(screenWidth) {
  const half = SPRITES.foot.displayWidth / 2;
  return { min: half, max: screenWidth - half };
}
