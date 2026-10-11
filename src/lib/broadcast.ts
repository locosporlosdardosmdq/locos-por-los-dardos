/**
 * Real-Time Match Broadcast para Locos por los Dardos
 * Permite que un anotador en la Diana (línea de tiro) transmita el estado del partido
 * dardo por dardo a pantallas de televisión, proyectores o jueces de torneo en tiempo real.
 */

export interface BroadcastMatchPayload {
  matchId: string;
  gameType: string;
  tournamentTitle?: string;
  distanceMode?: 'LEGS' | 'SETS';
  bestOfLegs?: number;
  bestOfSets?: number;
  player1Name: string;
  player1Score: number;
  player1Avg: number;
  player1Legs: number;
  player1Sets?: number;
  player1Avatar?: string;
  player1Nationality?: string;
  player1CountryCode?: string;
  player2Name: string;
  player2Score: number;
  player2Avg: number;
  player2Legs: number;
  player2Sets?: number;
  player2Avatar?: string;
  player2Nationality?: string;
  player2CountryCode?: string;
  currentTurnIndex: number;
  lastScore: number;
  lastDarts: string[];
  status: 'IN_PROGRESS' | 'FINISHED';
  winner?: string;
  checkoutSuggestion?: string;
  timestamp: number;
}

const CHANNEL_NAME = 'lpld_live_match_channel_v1';

class MatchBroadcastService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((data: BroadcastMatchPayload) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('[Broadcast] BroadcastChannel no soportado, usando fallback.', e);
      }
    }
  }

  public publish(payload: Omit<BroadcastMatchPayload, 'timestamp'>): void {
    const fullPayload: BroadcastMatchPayload = {
      ...payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(fullPayload);
    }

    // Fallback con localStorage para pestañas de distintos orígenes o iframes
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CHANNEL_NAME, JSON.stringify(fullPayload));
      } catch {
        // Ignorar quota exceeded
      }
    }

    // Notificar también localmente a la ventana activa
    this.notifyListeners(fullPayload);
  }

  public subscribe(callback: (data: BroadcastMatchPayload) => void): () => void {
    this.listeners.push(callback);

    // Escuchar también storage events para navegadores antiguos
    const storageHandler = (e: StorageEvent) => {
      if (e.key === CHANNEL_NAME && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch {
          // Ignorar parse error
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', storageHandler);
    }

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', storageHandler);
      }
    };
  }

  private notifyListeners(data: BroadcastMatchPayload): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('[Broadcast] Error en callback listener:', err);
      }
    });
  }
}

export const matchBroadcast = new MatchBroadcastService();
