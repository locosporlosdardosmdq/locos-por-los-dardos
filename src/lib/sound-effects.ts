// Web Audio API Synthesizer and Web Speech API Caller for Live Dart Scorer

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let isAudioMuted: boolean = false;

export function setAppAudioMuted(muted: boolean) {
  isAudioMuted = muted;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function isAppAudioMuted(): boolean {
  return isAudioMuted;
}

export const SoundEngine = {
  // Simula el golpe del dardo penetrando el sisal de la diana
  playDartHit: () => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext not allowed before user gesture
    }
  },

  // Sonido especial para Diana / Bullseye
  playBullseye: () => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.31);
    } catch {}
  },

  // Sonido de Bust (se pasó de puntos o quedó en 1)
  playBust: () => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  },

  // Fanfarria / Acorde de Victoria
  playGameShot: () => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C (triunfal)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch {}
  },

  // Reproducir clip temático de victoria Sabotage
  playSabotageCelebration: () => {
    if (isAudioMuted) return;
    try {
      const audio = new Audio('/logos/sabotage.mp3');
      audio.volume = 0.6;
      audio.currentTime = 8.5; // Comienzo del riff épico
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
      }, 7000);
    } catch {}
  },

  // Reproducir el grito original de Clemens Kuntze ("ONE HUNDRED AND EIGHTY!")
  playClemens180: () => {
    if (isAudioMuted) return;
    try {
      const audio = new Audio('/sounds/clemens-kuntze.mp3');
      audio.volume = 1.0;
      audio.play().catch((err) => {
        console.warn('[Audio] Error al reproducir audio original de Clemens Kuntze:', err);
      });
    } catch {}
  },

  play180: () => {
    SoundEngine.playClemens180();
  }
};

export const VoiceCaller = {
  // Desactivada completamente cualquier síntesis de voz femenina (speechSynthesis)
  speak: (_text: string, _options: { pitch?: number; rate?: number; lang?: string } = {}) => {
    // Sin voz femenina sintética
  },

  speakScore: (score: number) => {
    VoiceCaller.announceScore(score, 0);
  },

  speakBust: () => {
    VoiceCaller.announceBust();
  },

  // Reproduce el audio oficial de Russ Bray: "Game shot and the leg/match"
  speakGameShot: () => {
    if (isAudioMuted) return;
    try {
      const audio = new Audio('/sounds/russ_bray/gameshot.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch {}
  },

  /**
   * Canto de puntuación oficial:
   * - 180: Audio original de Clemens Kuntze ("ONE HUNDRED AND EIGHTY!")
   * - 1 al 179: Archivos MP3 oficiales de estudio de Russ Bray (/sounds/russ_bray/{score}.mp3)
   * - Eliminada toda voz femenina sintética del sistema
   */
  announceScore: (score: number, _remaining?: number) => {
    if (isAudioMuted) return;

    if (score === 180) {
      SoundEngine.playClemens180();
      SoundEngine.playBullseye();
      return;
    }

    if (score <= 0) {
      return;
    }

    // Reproducir audio auténtico de Russ Bray desde /sounds/russ_bray/{score}.mp3
    try {
      const audio = new Audio(`/sounds/russ_bray/${score}.mp3`);
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`[VoiceCaller] No se pudo reproducir audio Russ Bray para score ${score}:`, err);
        });
      }
    } catch {}
  },

  announceBust: () => {
    if (isAudioMuted) return;
    SoundEngine.playBust();
  },

  announceCheckoutOpportunity: (_remaining: number) => {
    // Sin voz sintética
  }
};

