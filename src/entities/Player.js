import Phaser from '../phaser-global.js';
import { SPRITES, getFootMoveLimits } from '../config/sprites.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, SPRITES.foot.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(SPRITES.foot.displayWidth, SPRITES.foot.displayHeight);
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setDepth(10);
    this.body.setSize(SPRITES.foot.bodyWidth, SPRITES.foot.bodyHeight);
    this.body.setOffset(SPRITES.foot.bodyOffsetX, SPRITES.foot.bodyOffsetY);

    this.moveSpeed = 520;
    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.keys = scene.input.keyboard?.addKeys('A,D') || {};

    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerdown', this.onPointerMove, this);
  }

  onPointerMove(pointer) {
    if (this.scene.gamePaused) return;

    const half = this.scene.scale.height * 0.45;
    if (pointer.y >= half) {
      const limits = getFootMoveLimits(this.scene.scale.width);
      this.targetX = Phaser.Math.Clamp(pointer.x, limits.min, limits.max);
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.scene.gamePaused) {
      this.setVelocityX(0);
      return;
    }

    let vx = 0;
    if (this.cursors?.left.isDown || this.keys.A?.isDown) {
      vx = -this.moveSpeed;
    } else if (this.cursors?.right.isDown || this.keys.D?.isDown) {
      vx = this.moveSpeed;
    }

    if (this.targetX !== undefined) {
      const dx = this.targetX - this.x;
      if (Math.abs(dx) > 2) {
        vx = Phaser.Math.Clamp(dx * 8, -this.moveSpeed, this.moveSpeed);
      } else {
        this.x = this.targetX;
        vx = 0;
      }
    }

    this.setVelocityX(vx);

    const limits = getFootMoveLimits(this.scene.scale.width);
    this.x = Phaser.Math.Clamp(this.x, limits.min, limits.max);
  }

  destroy(fromScene) {
    if (this.scene?.input) {
      this.scene.input.off('pointermove', this.onPointerMove, this);
      this.scene.input.off('pointerdown', this.onPointerMove, this);
    }
    super.destroy(fromScene);
  }
}
