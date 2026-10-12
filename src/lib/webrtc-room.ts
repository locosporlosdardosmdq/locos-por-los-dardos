'use client';

import { MatchConfig, ParticipantPlayer } from './types';
import { OnlineRoom, normalizeRoomCode } from './online-rooms';

export type PeerMessage =
  | { type: 'JOIN_REQUEST'; player: ParticipantPlayer; guestPeerId?: string }
  | { type: 'JOIN_ACCEPTED'; room: OnlineRoom; hostPeerId?: string }
  | { type: 'THROW'; score: number; darts?: string[]; isCheckout?: boolean; playerIndex: 0 | 1 }
  | { type: 'VOICE_PING'; isTalking: boolean }
  | { type: 'CAMERA_TOGGLE'; enabled: boolean }
  | { type: 'LEAVE' };

export interface WebRtcRoomHandler {
  sendThrow: (score: number, darts?: string[], isCheckout?: boolean) => void;
  sendVoiceState: (isTalking: boolean) => void;
  sendMediaStream: (stream: MediaStream) => void;
  getRemoteStream: () => MediaStream | null;
  destroy: () => void;
}

// Listeners globales para desacoplar componentes y reaccionar en caliente
let currentThrowListener: ((score: number, darts?: string[], isCheckout?: boolean) => void) | null = null;
let currentRemoteStreamListener: ((stream: MediaStream | null) => void) | null = null;
let activeRemoteStream: MediaStream | null = null;

export function setWebRtcThrowListener(
  listener: ((score: number, darts?: string[], isCheckout?: boolean) => void) | null
) {
  currentThrowListener = listener;
}

export function setWebRtcRemoteStreamListener(
  listener: ((stream: MediaStream | null) => void) | null
) {
  currentRemoteStreamListener = listener;
  // Si ya disponemos de un stream remoto activo, disparar de inmediato
  if (listener && activeRemoteStream) {
    listener(activeRemoteStream);
  }
}

export function getActiveRemoteStream(): MediaStream | null {
  return activeRemoteStream;
}

// Genera un ID de Peer seguro y consistente a partir del código de sala
export function getPeerIdFromRoomCode(code: string): string {
  const normalized = normalizeRoomCode(code);
  const clean = normalized.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `lpld-sala-${clean}`;
}

// Configuración STUN + TURN (OpenRelay TCP 443) para atravesar CGNAT móvil (4G/LTE)
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.relay.metered.ca:80' },
      {
        urls: 'turn:relay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:relay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  }
};

/**
 * HOST: Crea la sala P2P y queda a la espera del rival (DataChannel + Video Stream)
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
  let activeCall: any = null;
  let localMediaStream: MediaStream | null = null;
  let connectedGuestPeerId: string | null = null;

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
    console.log('[WebRTC Host] Sala P2P abierta con Peer ID:', id);
  });

  peer.on('error', (err: any) => {
    console.warn('[WebRTC Host Error]:', err);
    if (err.type === 'unavailable-id') {
      onError('Ya existe una sala activa con este código. Intenta generar un nuevo código.');
    } else {
      onError(`Error de conexión WebRTC: ${err.message || err.type}`);
    }
  });

  // Escuchar llamadas entrantes de video del rival
  peer.on('call', (incomingCall) => {
    console.log('[WebRTC Host] Recibida videollamada de cámara del rival');
    activeCall = incomingCall;

    if (localMediaStream) {
      incomingCall.answer(localMediaStream);
    } else {
      incomingCall.answer();
    }

    incomingCall.on('stream', (remoteStream: MediaStream) => {
      console.log('[WebRTC Host] Recibido stream de video de la diana rival');
      activeRemoteStream = remoteStream;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(remoteStream);
      }
    });

    incomingCall.on('close', () => {
      console.log('[WebRTC Host] Stream de cámara del rival cerrado');
      activeRemoteStream = null;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(null);
      }
    });
  });

  // Escuchar canal de datos (tiros, turnos, chat)
  peer.on('connection', (conn) => {
    activeConnection = conn;

    conn.on('open', () => {
      console.log('[WebRTC Host] Conexión de datos P2P establecida con rival');
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (!msg) return;

      if (msg.type === 'JOIN_REQUEST') {
        connectedGuestPeerId = msg.guestPeerId || null;
        roomState.player2 = msg.player;
        roomState.config.player2 = msg.player;
        roomState.config.player2Name = msg.player.name;
        roomState.status = 'PLAYING';
        roomState.lastUpdate = Date.now();

        // Responder con aceptación y estado completo
        conn.send({
          type: 'JOIN_ACCEPTED',
          room: roomState,
          hostPeerId: peerId
        } as PeerMessage);

        onGuestJoined(roomState);

        // Si ya tenemos stream local disponible, llamar al rival
        if (localMediaStream && connectedGuestPeerId) {
          try {
            const call = peer.call(connectedGuestPeerId, localMediaStream);
            activeCall = call;
            call.on('stream', (remoteStream) => {
              activeRemoteStream = remoteStream;
              if (currentRemoteStreamListener) currentRemoteStreamListener(remoteStream);
            });
          } catch (e) {
            console.warn('[WebRTC Host Call Error]:', e);
          }
        }
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
    sendMediaStream: (stream: MediaStream) => {
      localMediaStream = stream;
      if (activeCall) {
        // Si ya hay una llamada activa, reemplazar tracks o agregarlos si no existían
        try {
          const pc = activeCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          let foundVideoSender = false;
          let foundAudioSender = false;

          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
              foundVideoSender = true;
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
              foundAudioSender = true;
            }
          });

          // Si la llamada previa se respondió sin stream inicial, añadir tracks
          if (!foundAudioSender && audioTrack && pc) {
            try {
              pc.addTrack(audioTrack, stream);
            } catch (err) {}
          }
          if (!foundVideoSender && videoTrack && pc) {
            try {
              pc.addTrack(videoTrack, stream);
            } catch (err) {}
          }
        } catch (e) {
          console.warn('[WebRTC Host Track Replace Notice]:', e);
        }
      } else if (connectedGuestPeerId) {
        // Llamar al rival con el stream de cámara
        try {
          const call = peer.call(connectedGuestPeerId, stream);
          activeCall = call;
          call.on('stream', (remoteStream: MediaStream) => {
            activeRemoteStream = remoteStream;
            if (currentRemoteStreamListener) currentRemoteStreamListener(remoteStream);
          });
        } catch (e) {
          console.warn('[WebRTC Host Call Error]:', e);
        }
      }
    },
    getRemoteStream: () => activeRemoteStream,
    destroy: () => {
      try {
        if (activeCall) activeCall.close();
        if (activeConnection) activeConnection.close();
        activeRemoteStream = null;
        peer.destroy();
      } catch (e) {}
    }
  };
}

/**
 * GUEST: Se conecta a la sala P2P del host (DataChannel + Video Stream)
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
  let activeCall: any = null;
  let localMediaStream: MediaStream | null = null;

  // Guest usa un ID aleatorio único con prefijo
  const guestPeerId = `lpld-guest-${Math.random().toString(36).substring(2, 9)}`;
  const peer = new Peer(guestPeerId, PEER_CONFIG);

  let connectionTimeout = setTimeout(() => {
    onError('No se pudo encontrar la sala del contrincante. Verifica el código o la conexión.');
  }, 12000);

  peer.on('open', () => {
    console.log('[WebRTC Guest] Conectando a Host:', targetPeerId, 'con Guest ID:', guestPeerId);
    const conn = peer.connect(targetPeerId, {
      reliable: true
    });
    activeConnection = conn;

    conn.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('[WebRTC Guest] Conexión P2P de datos abierta con Host');
      // Enviar solicitud de ingreso informando nuestro guestPeerId
      conn.send({
        type: 'JOIN_REQUEST',
        player: guestPlayer,
        guestPeerId
      } as PeerMessage);
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (!msg) return;

      if (msg.type === 'JOIN_ACCEPTED') {
        onConnected(msg.room);

        // Si ya teníamos stream local listo, llamar al host
        if (localMediaStream) {
          try {
            const call = peer.call(targetPeerId, localMediaStream);
            activeCall = call;
            call.on('stream', (remoteStream) => {
              activeRemoteStream = remoteStream;
              if (currentRemoteStreamListener) currentRemoteStreamListener(remoteStream);
            });
          } catch (e) {
            console.warn('[WebRTC Guest Call Error]:', e);
          }
        }
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

  // Escuchar si el Host nos llama con su cámara
  peer.on('call', (incomingCall) => {
    console.log('[WebRTC Guest] Recibida llamada de cámara del Host');
    activeCall = incomingCall;

    if (localMediaStream) {
      incomingCall.answer(localMediaStream);
    } else {
      incomingCall.answer();
    }

    incomingCall.on('stream', (remoteStream: MediaStream) => {
      console.log('[WebRTC Guest] Recibido stream de video de la diana del Host');
      activeRemoteStream = remoteStream;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(remoteStream);
      }
    });

    incomingCall.on('close', () => {
      console.log('[WebRTC Guest] Stream de cámara del host cerrado');
      activeRemoteStream = null;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(null);
      }
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
    sendMediaStream: (stream: MediaStream) => {
      localMediaStream = stream;
      if (activeCall) {
        try {
          const pc = activeCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          let foundVideoSender = false;
          let foundAudioSender = false;

          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
              foundVideoSender = true;
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
              foundAudioSender = true;
            }
          });

          // Si no existía sender previo, agregar los tracks
          if (!foundAudioSender && audioTrack && pc) {
            try {
              pc.addTrack(audioTrack, stream);
            } catch (err) {}
          }
          if (!foundVideoSender && videoTrack && pc) {
            try {
              pc.addTrack(videoTrack, stream);
            } catch (err) {}
          }
        } catch (e) {
          console.warn('[WebRTC Guest Track Replace Notice]:', e);
        }
      } else {
        // Llamar al host
        try {
          const call = peer.call(targetPeerId, stream);
          activeCall = call;
          call.on('stream', (remoteStream: MediaStream) => {
            activeRemoteStream = remoteStream;
            if (currentRemoteStreamListener) currentRemoteStreamListener(remoteStream);
          });
        } catch (e) {
          console.warn('[WebRTC Guest Call Error]:', e);
        }
      }
    },
    getRemoteStream: () => activeRemoteStream,
    destroy: () => {
      clearTimeout(connectionTimeout);
      try {
        if (activeCall) activeCall.close();
        if (activeConnection) activeConnection.close();
        activeRemoteStream = null;
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
