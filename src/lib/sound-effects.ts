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

export const SoundEngine = {
  // Simula el golpe del dardo penetrando el sisal de la diana
  playDartHit: () => {
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
  speak: (text: string, options: { pitch?: number; rate?: number; lang?: string } = {}) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'es-ES';
      utterance.pitch = options.pitch ?? 1.0;
      utterance.rate = options.rate ?? 1.05;

      // Buscar voz en español
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(
        (v) => v.lang.startsWith('es') || v.lang.includes('AR') || v.lang.includes('ES')
      );
      if (esVoice) utterance.voice = esVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  },

  speakScore: (score: number) => {
    VoiceCaller.announceScore(score, 0);
  },

  speakBust: () => {
    VoiceCaller.announceBust();
  },

  speakGameShot: () => {
    VoiceCaller.speak('¡Game Shot! ¡Juego y pierna!', { pitch: 1.25, rate: 1.15, lang: 'es-ES' });
  },

  /**
   * Canto de puntuación con las 5 bandas emocionales:
   * - < 20: Muy pesimista (pitch bajo 0.65, rate 0.82)
   * - 21 a 59: Normal (pitch 1.0, rate 1.0)
   * - 60 a 89: Con énfasis (pitch 1.15, rate 1.1)
   * - 90 a 119: Con más énfasis (pitch 1.25, rate 1.18)
   * - 120 a 169: Con mucho énfasis (pitch 1.35, rate 1.25)
   * - 170 a 180: Audio original de Clemens Kuntze (ONE HUNDRED AND EIGHTY!)
   */
  announceScore: (score: number, remaining = 0) => {
    if (score >= 170) {
      // 170 al 180: Audio original de Clemens Kuntze
      SoundEngine.playClemens180();
      if (score === 180) {
        SoundEngine.playBullseye();
      } else {
        // Para 170-179 cantar con clímax antes del sonido original
        VoiceCaller.speak(`¡${score}!`, { pitch: 1.4, rate: 1.25 });
      }
      return;
    }

    if (remaining === 0 && score > 0) {
      VoiceCaller.speak('¡Game Shot! ¡Cierre de pierna!', { pitch: 1.3, rate: 1.2 });
      SoundEngine.playGameShot();
      return;
    }

    // Banda 1: Menores a 20 (Muy pesimista)
    if (score < 20) {
      const pesimisticText = score === 0 ? 'Sin puntuación...' : `${score}...`;
      VoiceCaller.speak(pesimisticText, { pitch: 0.65, rate: 0.82 });
      return;
    }

    // Banda 2: 20 al 59 (Normal)
    if (score >= 20 && score <= 59) {
      VoiceCaller.speak(`${score}`, { pitch: 1.0, rate: 1.0 });
      return;
    }

    // Banda 3: 60 al 89 (Con énfasis)
    if (score >= 60 && score <= 89) {
      VoiceCaller.speak(`¡${score}!`, { pitch: 1.15, rate: 1.1 });
      return;
    }

    // Banda 4: 90 al 119 (Con más énfasis)
    if (score >= 90 && score <= 119) {
      VoiceCaller.speak(`¡${score}!`, { pitch: 1.25, rate: 1.18 });
      return;
    }

    // Banda 5: 120 al 169 (Con mucho énfasis)
    if (score >= 120 && score <= 169) {
      VoiceCaller.speak(`¡${score}!`, { pitch: 1.35, rate: 1.25 });
      return;
    }
  },

  announceBust: () => {
    SoundEngine.playBust();
    VoiceCaller.speak('¡Bust! Te has pasado', { pitch: 0.7, rate: 0.85 });
  },

  announceCheckoutOpportunity: (remaining: number) => {
    if (remaining <= 170 && remaining > 1) {
      VoiceCaller.speak(`Requiere ${remaining}`, { pitch: 1.1, rate: 1.05 });
    }
  }
};
