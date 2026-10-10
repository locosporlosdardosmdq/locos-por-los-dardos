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

  play180: () => {
    SoundEngine.playBullseye();
  }
};

export const VoiceCaller = {
  speak: (text: string, lang = 'es-ES') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05; // ritmo enérgico de árbitro de dardos
      utterance.pitch = 1.0;

      // Buscar voz en español si está disponible
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('AR') || v.lang.includes('ES'));
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
    VoiceCaller.speak('¡Game Shot! ¡Juego y pierna!', 'es-ES');
  },

  announceScore: (score: number, remaining: number) => {
    if (score === 180) {
      // El icónico llamado de 180
      VoiceCaller.speak('¡ONE HUNDRED AND EIGHTY! ¡Ciento ochenta!', 'en-US');
      SoundEngine.playBullseye();
    } else if (remaining === 0) {
      VoiceCaller.speak('¡Game Shot! ¡Cierre de pierna!', 'es-ES');
      SoundEngine.playGameShot();
    } else if (score === 0) {
      VoiceCaller.speak('Sin puntuación', 'es-ES');
    } else {
      VoiceCaller.speak(`${score}`, 'es-ES');
    }
  },

  announceBust: () => {
    SoundEngine.playBust();
    VoiceCaller.speak('¡Bust! Te has pasado', 'es-ES');
  },

  announceCheckoutOpportunity: (remaining: number) => {
    if (remaining <= 170 && remaining > 1) {
      VoiceCaller.speak(`Requiere ${remaining}`, 'es-ES');
    }
  }
};
