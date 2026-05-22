import Phaser from '../phaser-global.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    this.add.text(width / 2, height * 0.3, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `SCORE ${this.finalScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.52, `LEVEL ${this.finalLevel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5);

    const retry = this.add.text(width / 2, height * 0.68, 'TAP TO RETRY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: retry,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(width / 2, height * 0.82, 'TAP MENU FOR TITLE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#444444',
    }).setOrigin(0.5);

    this.input.once('pointerup', (pointer) => {
      if (pointer.y > height * 0.75) {
        this.scene.start('MenuScene');
      } else {
        this.scene.start('GameScene', { level: this.finalLevel });
      }
    });
  }
}
