import Phaser from '../phaser-global.js';
import { applySpriteMetrics, SOURCE_TARGETS } from '../config/sprites.js';
import { makePixelTexture } from '../utils/makePixelTexture.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.on('loaderror', (file) => {
      console.error('Asset failed:', file.src);
    });
    this.load.image('foot-src', 'assets/foot.png');
    this.load.image('dick-src', 'assets/dick.jpg');
  }

  create() {
    try {
      const foot = makePixelTexture(this, 'foot-src', 'foot', SOURCE_TARGETS.foot);
      const dick = makePixelTexture(this, 'dick-src', 'dick', SOURCE_TARGETS.dick);

      applySpriteMetrics({ foot, dick });

      this.textures.remove('foot-src');
      this.textures.remove('dick-src');

      this.scene.start('MenuScene');
    } catch (err) {
      console.error(err);
      this.showBootError(err);
    }
  }

  showBootError(err) {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'LOAD ERROR\n' + (err.message || err), {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
  }
}
