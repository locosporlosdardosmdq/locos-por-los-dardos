import { MatchConfig, ParticipantPlayer } from './types';

export interface OnlineRoom {
  code: string; // ej: "DART-482"
  createdAt: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  config: MatchConfig;
  player1: ParticipantPlayer; // Creador / Host (Local P1)
  player2?: ParticipantPlayer; // Rival conectado (Local P2)
  currentTurn: 0 | 1;
  scores: [number, number];
  legsWon: [number, number];
  setsWon: [number, number];
  starterTurn: 0 | 1;
  turnHistory: Array<{
    playerIndex: 0 | 1;
    score: number;
    remainingAfter: number;
    timestamp: number;
  }>;
  lastThrow?: {
    playerIndex: 0 | 1;
    score: number;
    darts?: string[];
    isCheckout?: boolean;
    timestamp: number;
  };
  winnerIndex?: 0 | 1;
  lastUpdate: number;
}

// Almacén en memoria global para Next.js runtime
const getRoomsStore = (): Map<string, OnlineRoom> => {
  const globalAny = globalThis as any;
  if (!globalAny.__LPLD_ONLINE_ROOMS__) {
    globalAny.__LPLD_ONLINE_ROOMS__ = new Map<string, OnlineRoom>();
  }
  return globalAny.__LPLD_ONLINE_ROOMS__;
};

// Generador de código amigable estilo DART-XXX
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DART-${randomStr}`;
}

export function createOnlineRoom(
  hostPlayer: ParticipantPlayer,
  config: MatchConfig
): OnlineRoom {
  const store = getRoomsStore();
  const code = generateRoomCode();
  const startScore = config.startingScore || 501;

  const newRoom: OnlineRoom = {
    code,
    createdAt: Date.now(),
    status: 'WAITING',
    config: {
      ...config,
      isOnlineRoom: true,
      onlineRoomCode: code,
      player1: hostPlayer
    },
    player1: hostPlayer,
    currentTurn: 0,
    scores: [startScore, startScore],
    legsWon: [0, 0],
    setsWon: [0, 0],
    starterTurn: 0,
    turnHistory: [],
    lastUpdate: Date.now()
  };

  store.set(code.toUpperCase(), newRoom);

  // Limpieza de salas con más de 4 horas
  const now = Date.now();
  for (const [k, r] of store.entries()) {
    if (now - r.createdAt > 4 * 60 * 60 * 1000) {
      store.delete(k);
    }
  }

  return newRoom;
}

export function getOnlineRoom(code: string): OnlineRoom | null {
  if (!code) return null;
  const store = getRoomsStore();
  return store.get(code.toUpperCase().trim()) || null;
}

export function joinOnlineRoom(
  code: string,
  guestPlayer: ParticipantPlayer
): { success: boolean; room?: OnlineRoom; error?: string } {
  const store = getRoomsStore();
  const normalizedCode = code.toUpperCase().trim();
  const room = store.get(normalizedCode);

  if (!room) {
    return { success: false, error: 'La sala especificada no existe o ya caducó.' };
  }

  // Si ya es el mismo jugador
  if (room.player1.id === guestPlayer.id) {
    return { success: true, room };
  }

  // Si ya hay otro jugador conectado
  if (room.player2 && room.player2.id !== guestPlayer.id && room.status === 'PLAYING') {
    return { success: false, error: 'La sala ya cuenta con dos jugadores conectados.' };
  }

  // Conectar a Jugador 2
  room.player2 = guestPlayer;
  room.config.player2 = guestPlayer;
  room.config.player2Name = guestPlayer.name;
  room.status = 'PLAYING';
  room.lastUpdate = Date.now();

  store.set(normalizedCode, room);

  return { success: true, room };
}

export function submitRoomThrow(
  code: string,
  playerIndex: 0 | 1,
  score: number,
  isCheckout: boolean = false
): { success: boolean; room?: OnlineRoom; error?: string } {
  const store = getRoomsStore();
  const normalizedCode = code.toUpperCase().trim();
  const room = store.get(normalizedCode);

  if (!room) {
    return { success: false, error: 'Sala no encontrada.' };
  }

  if (room.status !== 'PLAYING') {
    return { success: false, error: 'La partida no se encuentra en curso.' };
  }

  if (room.currentTurn !== playerIndex) {
    return { success: false, error: 'No es tu turno de lanzar.' };
  }

  const currentScore = room.scores[playerIndex];
  const newScore = Math.max(0, currentScore - score);
  room.scores[playerIndex] = newScore;

  room.lastThrow = {
    playerIndex,
    score,
    isCheckout,
    timestamp: Date.now()
  };

  room.turnHistory.push({
    playerIndex,
    score,
    remainingAfter: newScore,
    timestamp: Date.now()
  });

  const bestOfLegs = room.config.bestOfLegs || 3;
  const targetLegsToWin = Math.ceil(bestOfLegs / 2);

  // Verificamos si ganó el leg
  if (newScore === 0 || isCheckout) {
    room.legsWon[playerIndex] += 1;
    
    // Verificamos si ganó el partido
    if (room.legsWon[playerIndex] >= targetLegsToWin) {
      room.status = 'FINISHED';
      room.winnerIndex = playerIndex;
    } else {
      // Reiniciamos puntuación para el siguiente leg
      const starting = room.config.startingScore || 501;
      room.scores = [starting, starting];
      // Alternamos quién empieza el leg
      const nextStarter = room.starterTurn === 0 ? 1 : 0;
      room.starterTurn = nextStarter;
      room.currentTurn = nextStarter;
    }
  } else {
    // Turno para el siguiente jugador
    room.currentTurn = playerIndex === 0 ? 1 : 0;
  }

  room.lastUpdate = Date.now();
  store.set(normalizedCode, room);

  return { success: true, room };
}
