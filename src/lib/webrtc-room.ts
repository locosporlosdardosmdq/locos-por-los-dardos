'use client';

import { MatchConfig, ParticipantPlayer } from './types';
import { OnlineRoom, normalizeRoomCode } from './online-rooms';

export type PeerMessage =
  | { type: 'JOIN_REQUEST'; player: ParticipantPlayer }
  | { type: 'JOIN_ACCEPTED'; room: OnlineRoom }
  | { type: 'THROW'; score: number; darts?: string[]; isCheckout?: boolean; playerIndex: 0 | 1 }
  | { type: 'VOICE_PING'; isTalking: boolean }
  | { type: 'LEAVE' };

export interface WebRtcRoomHandler {
  sendThrow: (score: number, darts?: string[], isCheckout?: boolean) => void;
  sendVoiceState: (isTalking: boolean) => void;
  destroy: () => void;
}

// Listener mutable que conecta la llegada de tiros directamente con el tablero activo
let currentThrowListener: ((score: number, darts?: string[], isCheckout?: boolean) => void) | null = null;

export function setWebRtcThrowListener(listener: ((score: number, darts?: string[], isCheckout?: boolean) => void) | null) {
  currentThrowListener = listener;
}

// Genera un ID de Peer seguro y consistente a partir del código de sala
export function getPeerIdFromRoomCode(code: string): string {
  const normalized = normalizeRoomCode(code);
  const clean = normalized.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `lpld-sala-${clean}`;
}

const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

/**
 * HOST: Crea la sala P2P y queda a la espera del rival
 */
export async function hostPeerRoom(
  roomCode: string,
  hostPlayer: ParticipantPlayer,
  initialConfig: MatchConfig,
  onGuestJoined: (room: OnlineRoom) => void,
  onThrowReceived: (score: number, darts?: string[], isCheckout?: boolean) => void,
  onError: (err: string) => void
): Promise<WebRtcRoomHandler> {
  const { Peer } = await import('peerjs');
  const peerId = getPeerIdFromRoomCode(roomCode);

  let activeConnection: any = null;
  const peer = new Peer(peerId, PEER_CONFIG);

  const startScore = initialConfig.startingScore || 501;
  const roomState: OnlineRoom = {
    code: normalizeRoomCode(roomCode),
    createdAt: Date.now(),
    status: 'WAITING',
    config: {
      ...initialConfig,
      isOnlineRoom: true,
      onlineRoomCode: normalizeRoomCode(roomCode),
      player1: hostPlayer,
      player1Name: hostPlayer.name
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

  peer.on('open', (id) => {
    console.log('[WebRTC Host] Sala abierta con Peer ID:', id);
  });

  peer.on('error', (err: any) => {
    console.warn('[WebRTC Host Error]:', err);
    if (err.type === 'unavailable-id') {
      onError('Ya existe una sala activa con este código. Intenta generar un nuevo código.');
    } else {
      onError(`Error de conexión WebRTC: ${err.message || err.type}`);
    }
  });

  peer.on('connection', (conn) => {
    activeConnection = conn;

    conn.on('open', () => {
      console.log('[WebRTC Host] Conexión P2P establecida con rival');
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (!msg) return;

      if (msg.type === 'JOIN_REQUEST') {
        roomState.player2 = msg.player;
        roomState.config.player2 = msg.player;
        roomState.config.player2Name = msg.player.name;
        roomState.status = 'PLAYING';
        roomState.lastUpdate = Date.now();

        // Responder con aceptación y estado completo
        conn.send({
          type: 'JOIN_ACCEPTED',
          room: roomState
        } as PeerMessage);

        onGuestJoined(roomState);
      } else if (msg.type === 'THROW') {
        if (currentThrowListener) {
          currentThrowListener(msg.score, msg.darts, msg.isCheckout);
        }
        if (onThrowReceived) {
          onThrowReceived(msg.score, msg.darts, msg.isCheckout);
        }
      }
    });

    conn.on('close', () => {
      console.log('[WebRTC Host] Rival desconectado');
    });
  });

  return {
    sendThrow: (score: number, darts?: string[], isCheckout?: boolean) => {
      if (activeConnection && activeConnection.open) {
        activeConnection.send({
          type: 'THROW',
          score,
          darts,
          isCheckout,
          playerIndex: 0
        } as PeerMessage);
      }
    },
    sendVoiceState: (isTalking: boolean) => {
      if (activeConnection && activeConnection.open) {
        activeConnection.send({
          type: 'VOICE_PING',
          isTalking
        } as PeerMessage);
      }
    },
    destroy: () => {
      try {
        if (activeConnection) activeConnection.close();
        peer.destroy();
      } catch (e) {}
    }
  };
}

/**
 * GUEST: Se conecta a la sala P2P del host
 */
export async function joinPeerRoom(
  roomCode: string,
  guestPlayer: ParticipantPlayer,
  onConnected: (room: OnlineRoom) => void,
  onThrowReceived: (score: number, darts?: string[], isCheckout?: boolean) => void,
  onError: (err: string) => void
): Promise<WebRtcRoomHandler> {
  const { Peer } = await import('peerjs');
  const targetPeerId = getPeerIdFromRoomCode(roomCode);

  let activeConnection: any = null;
  // Guest usa un ID aleatorio único
  const guestPeerId = `lpld-guest-${Math.random().toString(36).substring(2, 9)}`;
  const peer = new Peer(guestPeerId, PEER_CONFIG);

  let connectionTimeout = setTimeout(() => {
    onError('No se pudo encontrar la sala del contrincante. Verifica el código o la conexión.');
  }, 10000);

  peer.on('open', () => {
    console.log('[WebRTC Guest] Conectando a Host:', targetPeerId);
    const conn = peer.connect(targetPeerId, {
      reliable: true
    });
    activeConnection = conn;

    conn.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('[WebRTC Guest] Conexión P2P abierta con Host');
      // Enviar solicitud de ingreso
      conn.send({
        type: 'JOIN_REQUEST',
        player: guestPlayer
      } as PeerMessage);
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (!msg) return;

      if (msg.type === 'JOIN_ACCEPTED') {
        onConnected(msg.room);
      } else if (msg.type === 'THROW') {
        if (currentThrowListener) {
          currentThrowListener(msg.score, msg.darts, msg.isCheckout);
        }
        if (onThrowReceived) {
          onThrowReceived(msg.score, msg.darts, msg.isCheckout);
        }
      }
    });

    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      onError('Error en la conexión con la sala: ' + String(err));
    });

    conn.on('close', () => {
      console.log('[WebRTC Guest] Conexión con sala cerrada');
    });
  });

  peer.on('error', (err: any) => {
    clearTimeout(connectionTimeout);
    console.warn('[WebRTC Guest Error]:', err);
    onError('La sala especificada no está disponible o el contrincante no está en línea.');
  });

  return {
    sendThrow: (score: number, darts?: string[], isCheckout?: boolean) => {
      if (activeConnection && activeConnection.open) {
        activeConnection.send({
          type: 'THROW',
          score,
          darts,
          isCheckout,
          playerIndex: 1
        } as PeerMessage);
      }
    },
    sendVoiceState: (isTalking: boolean) => {
      if (activeConnection && activeConnection.open) {
        activeConnection.send({
          type: 'VOICE_PING',
          isTalking
        } as PeerMessage);
      }
    },
    destroy: () => {
      clearTimeout(connectionTimeout);
      try {
        if (activeConnection) activeConnection.close();
        peer.destroy();
      } catch (e) {}
    }
  };
}

let activeWebRtcHandler: WebRtcRoomHandler | null = null;

export function setActiveWebRtcHandler(handler: WebRtcRoomHandler | null) {
  if (activeWebRtcHandler && activeWebRtcHandler !== handler) {
    activeWebRtcHandler.destroy();
  }
  activeWebRtcHandler = handler;
}

export function getActiveWebRtcHandler(): WebRtcRoomHandler | null {
  return activeWebRtcHandler;
}

