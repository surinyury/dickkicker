import Phaser from '../phaser-global.js';
import { SPRITES } from '../config/sprites.js';

export const TRAJECTORY = {
  STRAIGHT: 'straight',
  DIAGONAL: 'diagonal',
  BOUNCE: 'bounce',
};

function enableWallBounce(obj) {
  obj.setBounce(1, 0);
  obj.setCollideWorldBounds(true);
  obj.body.setCollideWorldBounds(true, true, true, false, false);
  obj.body.onWorldBounds = true;
  obj.setData('wallBounce', true);
}

function pickSpeed(config) {
  const min = config.speedMin;
  const max = Math.max(config.speedMin, config.speedMax);
  return Phaser.Math.Between(min, max);
}

export function createFallObject(group, x, y, config) {
  const obj = group.get(x, y, SPRITES.dick.key);
  if (!obj) return null;

  obj.setDisplaySize(SPRITES.dick.displayWidth, SPRITES.dick.displayHeight);
  obj.setActive(true);
  obj.setVisible(true);
  obj.setDepth(5);
  obj.setData('kicked', false);
  obj.setData('missed', false);
  obj.setData('hasBouncedFoot', false);
  obj.setData('lastFootBounce', 0);
  obj.setData('wallBounce', false);
  obj.body.enable = true;
  obj.body.setAllowGravity(false);
  obj.body.setImmovable(false);
  obj.body.setSize(SPRITES.dick.bodyWidth, SPRITES.dick.bodyHeight);
  obj.body.setOffset(SPRITES.dick.bodyOffsetX, SPRITES.dick.bodyOffsetY);

  const speed = pickSpeed(config);
  let trajectory = TRAJECTORY.STRAIGHT;

  const roll = Math.random();
  if (roll < config.bounceChance) {
    trajectory = TRAJECTORY.BOUNCE;
  } else if (roll < config.bounceChance + config.diagonalChance) {
    trajectory = TRAJECTORY.DIAGONAL;
  }

  obj.setData('trajectory', trajectory);

  switch (trajectory) {
    case TRAJECTORY.DIAGONAL: {
      const vx = Phaser.Math.Between(-speed * 0.6, speed * 0.6);
      obj.setVelocity(vx, speed);
      enableWallBounce(obj);
      break;
    }
    case TRAJECTORY.BOUNCE: {
      const vx = Phaser.Math.RND.sign() * Phaser.Math.Between(speed * 0.35, speed * 0.55);
      obj.setVelocity(vx, speed * 0.9);
      enableWallBounce(obj);
      break;
    }
    default:
      obj.setVelocity(0, speed);
      obj.setBounce(0, 0);
      obj.setCollideWorldBounds(false);
      break;
  }

  return obj;
}

export function releaseFallObject(obj) {
  obj.setActive(false);
  obj.setVisible(false);
  if (obj.body) {
    obj.body.stop();
    obj.body.enable = false;
  }
}

export function getFootBand(player) {
  const halfH = SPRITES.foot.displayHeight / 2;
  return {
    top: player.y - halfH,
    bottom: player.y + halfH,
  };
}

/** Foot contact only when falling into the sneaker's vertical band. */
export function canFootContact(player, obj) {
  if (!obj?.body || obj.getData('kicked')) return false;
  if (obj.body.velocity.y <= 0) return false;

  const band = getFootBand(player);
  const dickBottom = obj.y + SPRITES.dick.displayHeight / 2;
  return dickBottom >= band.top;
}

export function bounceOffFoot(obj, player) {
  const now = obj.scene.time.now;
  if (now - (obj.getData('lastFootBounce') || 0) < 180) return false;

  obj.setData('lastFootBounce', now);
  obj.setData('hasBouncedFoot', true);

  const speed = Phaser.Math.Between(200, 300);
  const halfFoot = SPRITES.foot.displayWidth / 2;
  const relX = Phaser.Math.Clamp((obj.x - player.x) / halfFoot, -1, 1);
  obj.setVelocity(relX * speed * 0.85, -speed);

  return true;
}

export function kickObject(obj, playerX) {
  if (obj.getData('kicked')) return;

  obj.setData('kicked', true);
  const speed = Phaser.Math.Between(300, 440);
  const offset = (obj.x - playerX) / 40;
  obj.setVelocity(offset * 60, -speed);
  obj.setBounce(0, 0);
  obj.setCollideWorldBounds(false);
  if (obj.body) {
    obj.body.setAllowGravity(false);
  }
}

/** Miss = fell past the sneaker while falling downward. */
export function isMissed(obj, player) {
  if (obj.getData('kicked')) return false;
  if (!obj.body || obj.body.velocity.y <= 0) return false;

  const band = getFootBand(player);
  const dickBottom = obj.y + SPRITES.dick.displayHeight / 2;
  return dickBottom > band.bottom + 2;
}

export function isCleared(obj) {
  return obj.getData('kicked') && obj.y < -30;
}

export function shouldBounceOnFoot(obj) {
  return obj.getData('trajectory') === TRAJECTORY.BOUNCE
    && !obj.getData('kicked')
    && !obj.getData('hasBouncedFoot')
    && obj.body
    && obj.body.velocity.y > 0;
}
