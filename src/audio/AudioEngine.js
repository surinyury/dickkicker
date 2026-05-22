let engine = null;

class AudioEngine {
  constructor() {
    this.ready = false;
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicStep = 0;
    this.musicEvent = null;
    this.musicScene = null;
    this.musicMuted = false;
  }

  unlock(scene) {
    if (this.ready) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.ensureMusic(scene);
      return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.4;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.28;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.55;
    this.sfxGain.connect(this.master);

    this.ready = true;
    this.ensureMusic(scene);
  }

  ensureMusic(scene) {
    if (!this.ready || !scene) return;
    if (this.musicScene === scene && this.musicEvent) return;

    if (this.musicEvent) {
      this.musicEvent.remove(false);
      this.musicEvent = null;
    }

    this.musicScene = scene;
    this.tickMusic();
    this.musicEvent = scene.time.addEvent({
      delay: 180,
      loop: true,
      callback: () => this.tickMusic(),
    });
  }

  tone(freq, duration, type = 'square', volume = 0.18, dest = this.sfxGain, when = null) {
    if (!this.ready || this.musicMuted && dest === this.musicGain) return;

    const t0 = when ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  playKick() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.tone(160, 0.07, 'square', 0.28, this.sfxGain, t);
    this.tone(520, 0.09, 'sawtooth', 0.14, this.sfxGain, t + 0.02);
    this.tone(90, 0.05, 'triangle', 0.2, this.sfxGain, t);
  }

  playBounce() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.tone(240, 0.05, 'triangle', 0.2, this.sfxGain, t);
    this.tone(320, 0.08, 'square', 0.12, this.sfxGain, t + 0.03);
  }

  playAw() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.32);
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.34);
    this.tone(280, 0.12, 'triangle', 0.1, this.sfxGain, t + 0.08);
    this.tone(180, 0.2, 'square', 0.08, this.sfxGain, t + 0.12);
  }

  tickMusic() {
    if (!this.ready || this.musicMuted) return;

    const melody = [262, 262, 330, 294, 262, 294, 330, 349, 392, 349, 330, 294, 262, 220, 247, 262];
    const bass = [131, 131, 165, 147, 131, 147, 165, 175, 196, 175, 165, 147, 131, 110, 123, 131];
    const arp = [523, 659, 784, 659, 523, 659, 784, 988];
    const i = this.musicStep % melody.length;

    this.tone(melody[i], 0.16, 'square', 0.1, this.musicGain);
    this.tone(bass[i], 0.18, 'triangle', 0.14, this.musicGain);
    this.tone(arp[i % arp.length], 0.08, 'square', 0.05, this.musicGain);

    if (i % 4 === 0) {
      this.tone(65, 0.22, 'sawtooth', 0.08, this.musicGain);
    }

    this.musicStep += 1;
  }

  pauseMusic() {
    this.musicMuted = true;
    if (this.musicEvent) this.musicEvent.paused = true;
  }

  resumeMusic() {
    this.musicMuted = false;
    if (this.musicEvent) this.musicEvent.paused = false;
  }

  stopMusic() {
    if (this.musicEvent) {
      this.musicEvent.remove(false);
      this.musicEvent = null;
    }
    this.musicScene = null;
  }
}

export function getAudio() {
  if (!engine) engine = new AudioEngine();
  return engine;
}

export function unlockAudio(scene) {
  getAudio().unlock(scene);
}
