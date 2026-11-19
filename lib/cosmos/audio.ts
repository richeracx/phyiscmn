'use client';

/**
 * Audio Engine for Physicsmn:
 * Handles cinematic background music, sound effects, and the trailer voice.
 *
 * Integrated with fallback Web Audio API synthesis so sound works immediately,
 * and seamlessly loads user-generated MP3s placed in `/public/audio/`:
 *   - `/audio/background-music.mp3` (cinematic space ambient score)
 *   - `/audio/explosion.mp3` (supernova detonation)
 *   - `/audio/voice-trailer.mp3` ("Physicsmen" trailer roar)
 *   - `/audio/shimmer.mp3` (celestial starlight shimmer)
 *   - `/audio/charge.mp3` (singularity implosion tension)
 *   - `/audio/grav-wave.mp3` (canvas click gravitational wave ripple)
 *   - `/audio/warp.mp3` (starfield cruising whoosh)
 *   - `/audio/button-hover.mp3` & `/audio/button-click.mp3` (UI glass tactile sounds)
 *   - `/audio/glyph.mp3` (Act II derivation glyph lock)
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private muted = false; // Always on per requirements
  private bgmAudio: HTMLAudioElement | null = null;
  private explosionAudio: HTMLAudioElement | null = null;
  private chargeAudio: HTMLAudioElement | null = null;
  private gravWaveAudio: HTMLAudioElement | null = null;
  private warpAudio: HTMLAudioElement | null = null;
  private buttonHoverAudio: HTMLAudioElement | null = null;
  private buttonClickAudio: HTMLAudioElement | null = null;
  private glyphAudio: HTMLAudioElement | null = null;

  private explosionFired = false;
  private chargeFired = false;
  private lastWarpTime = 0;
  private lastGlyphTime = 0;
  private listeners: ((muted: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const load = (path: string, vol = 0.7, loop = false) => {
        try {
          const a = new Audio(path);
          a.volume = vol;
          a.loop = loop;
          return a;
        } catch {
          return null;
        }
      };

      this.bgmAudio = load('/audio/background-music.mp3?v=2', 0.35, true);
      this.explosionAudio = load('/audio/explosion.mp3?v=2', 1.0);
      this.chargeAudio = load('/audio/charge.mp3?v=2', 0.7);
      this.gravWaveAudio = load('/audio/grav-wave.mp3?v=2', 0.65);
      this.warpAudio = load('/audio/warp.mp3?v=2', 0.4);
      this.buttonHoverAudio = load('/audio/button-hover.mp3?v=2', 0.3);
      this.buttonClickAudio = load('/audio/button-click.mp3?v=2', 0.5);
      this.glyphAudio = load('/audio/glyph.mp3?v=2', 0.25);

      // Auto-start audio upon the first user interaction to bypass browser autoplay policies
      const startAudio = () => {
        this.initCtx();
        if (this.bgmAudio && this.bgmAudio.paused) {
          this.bgmAudio.play().catch(() => this.playSyntheticBgm());
        }
        window.removeEventListener('pointerdown', startAudio);
        window.removeEventListener('keydown', startAudio);
        window.removeEventListener('touchstart', startAudio);
        window.removeEventListener('scroll', startAudio);
        window.removeEventListener('wheel', startAudio);
      };

      window.addEventListener('pointerdown', startAudio, { once: true, passive: true });
      window.addEventListener('keydown', startAudio, { once: true });
      window.addEventListener('touchstart', startAudio, { once: true, passive: true });
      window.addEventListener('scroll', startAudio, { once: true, passive: true });
      window.addEventListener('wheel', startAudio, { once: true, passive: true });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public get isMuted() {
    return false;
  }

  public subscribe(fn: (muted: boolean) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) fn(false);
  }

  public toggleMute() {
    // Sound is permanently on; ensure active
    this.initCtx();
    this.muted = false;
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => this.playSyntheticBgm());
    }
    this.notify();
    return false;
  }

  public unmute() {
    this.toggleMute();
  }

  public stopAll() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    if (this.syntheticBgmGain) {
      try {
        this.syntheticBgmGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      } catch {}
    }
    this.notify();
  }

  /**
   * Supernova cosmic explosion sound
   */
  public playExplosion() {
    if (this.muted || this.explosionFired) return;
    this.explosionFired = true;
    this.initCtx();

    if (this.explosionAudio) {
      this.explosionAudio.currentTime = 0;
      this.explosionAudio.play().catch(() => this.playSyntheticExplosion());
    } else {
      this.playSyntheticExplosion();
    }
  }

  /**
   * Singularity compression vacuum implosion before the supernova
   */
  public playCharge() {
    if (this.muted || this.chargeFired) return;
    this.chargeFired = true;
    this.initCtx();

    if (this.chargeAudio) {
      this.chargeAudio.currentTime = 0;
      this.chargeAudio.play().catch(() => {});
    }
  }

  /**
   * Voice trailer audio has been removed
   */
  public playTrailerVoice() {
    // No-op: voice trailer audio removed
  }

  /**
   * Gravitational wave click ripple
   */
  public playGravWave() {
    if (this.muted) return;
    this.initCtx();
    if (this.gravWaveAudio) {
      this.gravWaveAudio.currentTime = 0;
      this.gravWaveAudio.play().catch(() => {});
    }
  }

  /**
   * Starfield warp speed cruise whoosh
   */
  public playWarp() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastWarpTime < 2400) return;
    this.lastWarpTime = now;
    this.initCtx();
    if (this.warpAudio) {
      this.warpAudio.currentTime = 0;
      this.warpAudio.play().catch(() => {});
    }
  }

  /**
   * UI Glass Button Hover
   */
  public playButtonHover() {
    if (this.muted) return;
    if (this.buttonHoverAudio) {
      this.buttonHoverAudio.currentTime = 0;
      this.buttonHoverAudio.play().catch(() => {});
    }
  }

  /**
   * UI Glass Button Click
   */
  public playButtonClick() {
    if (this.muted) return;
    if (this.buttonClickAudio) {
      this.buttonClickAudio.currentTime = 0;
      this.buttonClickAudio.play().catch(() => {});
    }
  }

  /**
   * Act II Academic derivation glyph click
   */
  public playGlyph() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastGlyphTime < 80) return;
    this.lastGlyphTime = now;
    if (this.glyphAudio) {
      this.glyphAudio.currentTime = 0;
      this.glyphAudio.play().catch(() => {});
    }
  }

  public resetFinaleTriggers() {
    this.explosionFired = false;
    this.chargeFired = false;
  }

  // =========================================================================
  // Web Audio Procedural Fallbacks (synthesizes audio in browser if MP3 missing)
  // =========================================================================
  private syntheticBgmGain: GainNode | null = null;

  private playSyntheticBgm() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 3);
    masterGain.connect(this.ctx.destination);
    this.syntheticBgmGain = masterGain;

    const freqs = [55, 82.4, 110, 164.8, 220];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.15 / freqs.length, now);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
    });
  }

  private playSyntheticExplosion() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 1.8);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 3.3);

    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 2.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.5);
  }
}

export const soundController = new SoundController();
