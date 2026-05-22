import Phaser from '../phaser-global.js';
import Player from '../entities/Player.js';
import { createFallObject, kickObject, bounceOffFoot, releaseFallObject, isMissed, isCleared, shouldBounceOnFoot, canFootContact } from '../entities/FallObject.js';
import { getLevelConfig, saveProgress, MAX_LEVEL } from '../config/levels.js';
import { getAudio, unlockAudio } from '../audio/AudioEngine.js';
import { getBounceBounds, SPRITES } from '../config/sprites.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.currentLevel = data.level || 1;
    this.startLives = data.lives ?? 3;
    this.startScore = data.score ?? 0;
    this.levelConfig = getLevelConfig(this.currentLevel);
  }

  create() {
    const { width, height } = this.scale;

    unlockAudio(this);
    getAudio().ensureMusic(this);

    this.score = this.startScore;
    this.lives = this.startLives;
    this.spawned = 0;
    this.cleared = 0;
    this.levelComplete = false;
    this.gameOver = false;
    this.gamePaused = false;

    this.bounceBounds = getBounceBounds(width, height);
    this.physics.world.setBounds(
      this.bounceBounds.x,
      this.bounceBounds.y,
      this.bounceBounds.width,
      this.bounceBounds.height
    );

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    this.drawBorder(width, height);
    this.createHud(width, height);

    this.fallObjects = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 512,
      runChildUpdate: false,
    });

    this.player = new Player(this, width / 2, height - SPRITES.foot.displayHeight / 2 - 20);

    this.physics.add.overlap(
      this.player,
      this.fallObjects,
      this.handleFootContact,
      canFootContact,
      this
    );

    this.physics.world.on('worldbounds', this.onWallBounce, this);

    this.spawnTimer = this.time.addEvent({
      delay: this.levelConfig.spawnIntervalMs,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true,
    });

    this.spawnObject();
  }

  handleFootContact(player, obj) {
    if (obj.getData('kicked') || this.levelComplete || this.gameOver || this.gamePaused) return;

    if (shouldBounceOnFoot(obj)) {
      if (bounceOffFoot(obj, player)) {
        getAudio().playBounce();
        this.cameras.main.shake(40, 0.002);
      }
      return;
    }

    if (obj.body.velocity.y <= 0) return;

    kickObject(obj, player.x);
    getAudio().playKick();
    this.score += 10 * this.currentLevel;
    this.cameras.main.shake(60, 0.004);
    this.updateHud();
  }

  onWallBounce(body, _up, _down, left, right) {
    const obj = body.gameObject;
    if (!obj || !obj.getData('wallBounce') || obj.getData('kicked')) return;
    if (left || right) {
      getAudio().playBounce();
    }
  }

  shutdown() {
    this.physics.world.off('worldbounds', this.onWallBounce, this);
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }
    if (this.player) {
      this.player.destroy(true);
      this.player = null;
    }
  }

  drawBorder(width, height) {
    const g = this.add.graphics();
    g.lineStyle(3, 0xffffff, 1);
    g.strokeRect(6, 6, width - 12, height - 12);
    g.lineStyle(1, 0x888888, 1);
    g.strokeRect(12, 12, width - 24, height - 24);
  }

  createHud(width, height) {
    this.levelText = this.add.text(16, 16, `LV ${this.currentLevel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });

    this.scoreText = this.add.text(width / 2, 16, '0000', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.livesText = this.add.text(width - 16, 16, '♥♥♥', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.remainingText = this.add.text(width / 2, 36, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5, 0);

    this.pauseBtn = this.add.text(width / 2, 54, '|| PAUSE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#222222',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerup', () => {
      this.togglePause();
    });

    this.pauseOverlay = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.updateHud();
  }

  togglePause() {
    if (this.levelComplete || this.gameOver) return;

    this.gamePaused = !this.gamePaused;

    if (this.gamePaused) {
      this.physics.pause();
      this.time.paused = true;
      getAudio().pauseMusic();
      this.pauseBtn.setText('> RESUME');
      this.pauseOverlay.setVisible(true);
    } else {
      this.physics.resume();
      this.time.paused = false;
      getAudio().resumeMusic();
      this.pauseBtn.setText('|| PAUSE');
      this.pauseOverlay.setVisible(false);
    }
  }

  updateHud() {
    this.scoreText.setText(String(this.score).padStart(4, '0'));
    this.livesText.setText('♥'.repeat(this.lives));
    const left = this.levelConfig.totalObjects - this.cleared;
    this.remainingText.setText(`${left} left`);
  }

  spawnObject() {
    if (this.levelComplete || this.gameOver || this.gamePaused) return;
    if (this.spawned >= this.levelConfig.totalObjects) {
      this.spawnTimer.remove(false);
      return;
    }

    const { width } = this.scale;
    const margin = this.bounceBounds.insetX + SPRITES.dick.displayWidth / 2;
    const x = Phaser.Math.Between(margin, width - margin);

    const spawnConfig = { ...this.levelConfig };
    if (Math.random() > this.levelConfig.fastRatio) {
      spawnConfig.speedMax = Math.min(spawnConfig.speedMax, spawnConfig.speedMin + 30);
    }

    const obj = createFallObject(this.fallObjects, x, 20, spawnConfig);
    if (obj) {
      this.spawned += 1;
    } else if (this.spawned < this.levelConfig.totalObjects) {
      this.time.delayedCall(80, this.spawnObject, [], this);
    }
  }

  update() {
    if (this.levelComplete || this.gameOver || this.gamePaused) return;
    if (!this.player?.active) return;

    try {
      this.tickObjects();
    } catch (err) {
      console.error('Game tick error:', err);
    }
  }

  tickObjects() {
    const toRemove = [];
    const children = this.fallObjects.getChildren();

    for (let i = 0; i < children.length; i += 1) {
      const obj = children[i];
      if (!obj.active) continue;

      if (isMissed(obj, this.player)) {
        if (!obj.getData('missed')) {
          obj.setData('missed', true);
          this.loseLife();
        }
        toRemove.push(obj);
      } else if (isCleared(obj)) {
        this.cleared += 1;
        this.score += 25;
        toRemove.push(obj);
        this.updateHud();
        this.checkLevelComplete();
      }
    }

    toRemove.forEach((obj) => releaseFallObject(obj));

    this.checkWaveEnd();
  }

  loseLife() {
    if (this.gameOver || this.levelComplete) return;

    this.lives -= 1;
    this.score = Math.max(0, this.score - 25 * this.currentLevel);
    getAudio().playAw();
    this.updateHud();
    this.cameras.main.flash(200, 255, 255, 255);

    if (this.lives <= 0) {
      this.endGame(false);
    }
  }

  checkWaveEnd() {
    if (this.levelComplete || this.gameOver) return;
    if (this.spawned < this.levelConfig.totalObjects) return;

    const active = this.fallObjects.countActive(true);
    if (active > 0) return;

    if (this.cleared >= this.levelConfig.totalObjects) {
      this.completeLevel();
    } else if (this.lives > 0) {
      this.retryLevel();
    } else {
      this.endGame(false);
    }
  }

  retryLevel() {
    this.gameOver = true;
    const { width } = this.scale;
    const banner = this.add.text(width / 2, this.scale.height * 0.55, 'MISSED TOO MANY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const payload = {
      level: this.currentLevel,
      lives: this.lives,
      score: this.score,
    };

    this.time.delayedCall(1500, () => {
      banner.destroy();
      this.scene.restart(payload);
    });
  }

  checkLevelComplete() {
    if (this.cleared < this.levelConfig.totalObjects) return;
    this.checkWaveEnd();
  }

  completeLevel() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.gameOver = true;

    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }

    const nextLevel = Math.min(MAX_LEVEL, this.currentLevel + 1);
    saveProgress(nextLevel, this.score);

    const { width, height } = this.scale;
    const bannerText = this.currentLevel >= MAX_LEVEL ? 'YOU WIN!' : 'LEVEL CLEAR';
    const banner = this.add.text(width / 2, height / 2, bannerText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({ targets: banner, alpha: 0.3, duration: 400, yoyo: true, repeat: 2 });

    this.time.delayedCall(1800, () => {
      if (this.currentLevel >= MAX_LEVEL) {
        saveProgress(MAX_LEVEL, this.score);
        this.scene.start('MenuScene');
      } else {
        this.scene.restart({
          level: this.currentLevel + 1,
          lives: this.lives,
          score: this.score,
        });
      }
    });
  }

  showVictory() {
    // kept for compatibility; level 80 handled in completeLevel
    this.scene.start('MenuScene');
  }

  endGame(won) {
    if (this.gameOver) return;
    this.gameOver = true;
    saveProgress(this.currentLevel, this.score);
    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.currentLevel,
      won,
    });
  }
}
