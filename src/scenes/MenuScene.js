import Phaser from '../phaser-global.js';
import { loadProgress, resetProgress } from '../config/levels.js';
import { unlockAudio } from '../audio/AudioEngine.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const { level, highScore } = loadProgress();

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    this.add.text(width / 2, height * 0.22, 'DICKKICKER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, '80s arcade edition', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height * 0.52, 'TAP TO START', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(width / 2, height * 0.62, `LEVEL ${level}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5);

    if (highScore > 0) {
      this.add.text(width / 2, height * 0.68, `HI ${highScore}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#888888',
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, height * 0.82, 'drag sneaker to kick', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.9, 'hold 1.2s to reset', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#444444',
    }).setOrigin(0.5);

    this.pointerDownAt = 0;
    this.input.on('pointerdown', () => {
      this.pointerDownAt = this.time.now;
      unlockAudio(this);
    });
    this.input.on('pointerup', () => {
      const held = this.time.now - this.pointerDownAt;
      if (held >= 1200) {
        resetProgress();
        this.scene.restart();
      } else {
        this.scene.start('GameScene', { level });
      }
    });
  }
}
