'use client';

import { MatchConfig, ParticipantPlayer } from './types';
import { OnlineRoom, normalizeRoomCode } from './online-rooms';

export type PeerMessage =
  | { type: 'JOIN_REQUEST'; player: ParticipantPlayer; guestPeerId?: string }
  | { type: 'JOIN_ACCEPTED'; room: OnlineRoom; hostPeerId?: string }
  | { type: 'THROW'; score: number; darts?: string[]; isCheckout?: boolean; playerIndex: 0 | 1 }
  | { type: 'VOICE_PING'; isTalking: boolean }
  | { type: 'CAMERA_TOGGLE'; enabled: boolean }
  | { type: 'STREAM_READY' }
  | { type: 'REQUEST_STREAM' }
  | { type: 'LEAVE' };

export interface WebRtcRoomHandler {
  sendThrow: (score: number, darts?: string[], isCheckout?: boolean) => void;
  sendVoiceState: (isTalking: boolean) => void;
  sendMediaStream: (stream: MediaStream) => void;
  sendLeave?: () => void;
  getRemoteStream: () => MediaStream | null;
  getPeerId?: () => string;
  connectToPeer?: (targetId: string) => void;
  reconnectCall?: () => void;
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

// Configuración STUN + TURN (OpenRelay TCP 443 + Google STUN) para atravesar CGNAT móvil (4G/LTE)
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
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
    ],
    iceCandidatePoolSize: 10
  }
};

/**
 * HOST: Crea la sala P2P y queda a la espera del rival (DataChannel + Bidirectional Video/Audio Stream)
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
  let incomingCall: any = null;
  let outgoingCall: any = null;
  let localMediaStream: MediaStream | null = null;
  let connectedGuestPeerId: string | null = null;

  let activePeerInstance: any = null;
  let activePeerId: string = peerId;

  const bindPeerEvents = (p: any) => {
    p.on('open', (id: string) => {
      console.log('[WebRTC Host] Sala P2P abierta con Peer ID:', id);
      activePeerId = id;
      if (typeof fetch !== 'undefined') {
        fetch('/api/salas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'HEARTBEAT', code: normalizeRoomCode(roomCode), playerIndex: 0, peerId: id })
        }).catch(() => {});
      }
    });

    p.on('error', (err: any) => {
      console.warn('[WebRTC Host Error]:', err);
      if (err.type === 'unavailable-id') {
        console.log('[WebRTC Host] ID base ocupado por refresh previo. Creando instancia con ID alternativo...');
        try { p.destroy(); } catch (e) {}
        const fallbackId = `${peerId}-${Math.random().toString(36).substring(2, 7)}`;
        activePeerInstance = new Peer(fallbackId, PEER_CONFIG);
        bindPeerEvents(activePeerInstance);
      } else {
        onError(`Error de conexión WebRTC: ${err.message || err.type}`);
      }
    });

    // Escuchar llamadas entrantes de video del rival
    p.on('call', (call: any) => {
      console.log('[WebRTC Host] Recibida llamada entrante de cámara/audio del rival');
      incomingCall = call;

      if (!connectedGuestPeerId && (call as any).peer) {
        connectedGuestPeerId = (call as any).peer;
      }

      if (localMediaStream) {
        call.answer(localMediaStream);
      } else {
        call.answer();
      }

      call.on('stream', (remoteStream: MediaStream) => {
        console.log('[WebRTC Host] ¡Stream de video y audio del rival recibido!', remoteStream.id);
        activeRemoteStream = remoteStream;
        if (currentRemoteStreamListener) {
          currentRemoteStreamListener(remoteStream);
        }
      });

      call.on('close', () => {
        console.log('[WebRTC Host] Stream entrante del rival cerrado');
        if (incomingCall === call) {
          incomingCall = null;
        }
        activeRemoteStream = null;
        if (currentRemoteStreamListener) {
          currentRemoteStreamListener(null);
        }
      });
    });

    // Escuchar canal de datos (tiros, turnos, pings)
    p.on('connection', (conn: any) => {
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
            hostPeerId: activePeerId
          } as PeerMessage);

          onGuestJoined(roomState);

          // Si ya tenemos stream local disponible, llamar al rival inmediatamente
          if (localMediaStream && connectedGuestPeerId) {
            initiateOutgoingCall(connectedGuestPeerId, localMediaStream);
          }
        } else if (msg.type === 'STREAM_READY') {
          console.log('[WebRTC Host] El rival notificó STREAM_READY');
          if (localMediaStream && connectedGuestPeerId) {
            initiateOutgoingCall(connectedGuestPeerId, localMediaStream);
          }
        } else if (msg.type === 'REQUEST_STREAM') {
          if (localMediaStream && connectedGuestPeerId) {
            initiateOutgoingCall(connectedGuestPeerId, localMediaStream);
          }
        } else if (msg.type === 'LEAVE') {
          console.log('[WebRTC Host] El rival salió de la partida (LEAVE)');
          activeRemoteStream = null;
          if (currentRemoteStreamListener) {
            currentRemoteStreamListener(null);
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
        console.log('[WebRTC Host] Rival desconectado del canal de datos');
        activeRemoteStream = null;
        if (currentRemoteStreamListener) {
          currentRemoteStreamListener(null);
        }
      });
    });
  };

  // Función para realizar llamada saliente hacia el rival
  const initiateOutgoingCall = (targetGuestId: string, stream: MediaStream) => {
    if (!targetGuestId || !stream) return;
    console.log('[WebRTC Host] Realizando llamada saliente con cámara hacia:', targetGuestId);
    try {
      if (outgoingCall) {
        try { outgoingCall.close(); } catch (e) {}
      }
      const call = activePeerInstance?.call(targetGuestId, stream);
      outgoingCall = call;

      call?.on('stream', (remoteStream: MediaStream) => {
        console.log('[WebRTC Host] Stream recibido en respuesta de llamada saliente:', remoteStream.id);
        if (remoteStream && remoteStream.getTracks().length > 0) {
          activeRemoteStream = remoteStream;
          if (currentRemoteStreamListener) {
            currentRemoteStreamListener(remoteStream);
          }
        }
      });

      call?.on('error', (callErr: any) => {
        console.warn('[WebRTC Host Outgoing Call Error]:', callErr);
      });
    } catch (err) {
      console.warn('[WebRTC Host Call Exception]:', err);
    }
  };

  activePeerInstance = new Peer(peerId, PEER_CONFIG);

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

  const handleBeforeUnload = () => {
    try { activePeerInstance?.destroy(); } catch (e) {}
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  bindPeerEvents(activePeerInstance);

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
      console.log('[WebRTC Host] sendMediaStream ejecutado. Tracks:', stream.getTracks().length);
      localMediaStream = stream;

      // 1. Notificar al rival por DataChannel que tenemos la cámara lista
      if (activeConnection && activeConnection.open) {
        activeConnection.send({ type: 'STREAM_READY' } as PeerMessage);
      }

      // 2. Si ya hay una llamada saliente activa, reemplazar tracks
      if (outgoingCall && outgoingCall.peerConnection) {
        try {
          const pc = outgoingCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          let replacedVideo = false;
          let replacedAudio = false;

          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
              replacedVideo = true;
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
              replacedAudio = true;
            }
          });

          // Si no existía video sender previo, reiniciar llamada saliente con el nuevo stream
          if (!replacedVideo && videoTrack && connectedGuestPeerId) {
            initiateOutgoingCall(connectedGuestPeerId, stream);
          }
        } catch (e) {
          console.warn('[WebRTC Host Track Replace Notice]:', e);
        }
      } else if (connectedGuestPeerId) {
        initiateOutgoingCall(connectedGuestPeerId, stream);
      }

      // 3. Si teníamos una llamada entrante abierta, actualizar sus senders también
      if (incomingCall && incomingCall.peerConnection) {
        try {
          const pc = incomingCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
            }
          });
        } catch (err) {}
      }
    },
    sendLeave: () => {
      try {
        if (activeConnection && activeConnection.open) {
          activeConnection.send({ type: 'LEAVE' } as PeerMessage);
        }
      } catch (e) {}
      activeRemoteStream = null;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(null);
      }
    },
    getRemoteStream: () => activeRemoteStream,
    getPeerId: () => activePeerId || peerId,
    connectToPeer: (guestId: string) => {
      connectedGuestPeerId = guestId;
      if (localMediaStream) {
        initiateOutgoingCall(guestId, localMediaStream);
      }
    },
    reconnectCall: () => {
      if (connectedGuestPeerId && localMediaStream) {
        initiateOutgoingCall(connectedGuestPeerId, localMediaStream);
      }
    },
    destroy: () => {
      try {
        if (typeof window !== 'undefined') {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }
        if (incomingCall) incomingCall.close();
        if (outgoingCall) outgoingCall.close();
        if (activeConnection) activeConnection.close();
        activeRemoteStream = null;
        activePeerInstance?.destroy();
      } catch (e) {}
    }
  };
}

/**
 * GUEST: Se conecta a la sala P2P del host (DataChannel + Bidirectional Video/Audio Stream)
 */
export async function joinPeerRoom(
  roomCode: string,
  guestPlayer: ParticipantPlayer,
  onConnected: (room: OnlineRoom) => void,
  onThrowReceived: (score: number, darts?: string[], isCheckout?: boolean) => void,
  onError: (err: string) => void
): Promise<WebRtcRoomHandler> {
  const { Peer } = await import('peerjs');
  let targetPeerId = getPeerIdFromRoomCode(roomCode);

  let activeConnection: any = null;
  let incomingCall: any = null;
  let outgoingCall: any = null;
  let localMediaStream: MediaStream | null = null;

  // Guest usa un ID aleatorio único con prefijo
  const guestPeerId = `lpld-guest-${Math.random().toString(36).substring(2, 9)}`;
  const peer = new Peer(guestPeerId, PEER_CONFIG);

  let connectionTimeout = setTimeout(() => {
    onError('No se pudo encontrar la sala del contrincante. Verifica el código o la conexión.');
  }, 14000);

  // Función para realizar llamada saliente hacia el Host
  const initiateOutgoingCall = (stream: MediaStream) => {
    if (!targetPeerId || !stream) return;
    console.log('[WebRTC Guest] Realizando llamada saliente con cámara hacia Host:', targetPeerId);
    try {
      if (outgoingCall) {
        try { outgoingCall.close(); } catch (e) {}
      }
      const call = peer.call(targetPeerId, stream);
      outgoingCall = call;

      call.on('stream', (remoteStream: MediaStream) => {
        console.log('[WebRTC Guest] Stream recibido en respuesta de llamada saliente:', remoteStream.id);
        if (remoteStream && remoteStream.getTracks().length > 0) {
          activeRemoteStream = remoteStream;
          if (currentRemoteStreamListener) {
            currentRemoteStreamListener(remoteStream);
          }
        }
      });

      call.on('error', (callErr: any) => {
        console.warn('[WebRTC Guest Outgoing Call Error]:', callErr);
      });
    } catch (err) {
      console.warn('[WebRTC Guest Call Exception]:', err);
    }
  };

  const handleBeforeUnload = () => {
    try { peer.destroy(); } catch (e) {}
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  peer.on('open', (id) => {
    console.log('[WebRTC Guest] Conectando a Host:', targetPeerId, 'con Guest ID:', id);
    if (typeof fetch !== 'undefined') {
      fetch('/api/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'HEARTBEAT', code: normalizeRoomCode(roomCode), playerIndex: 1, peerId: id })
      }).catch(() => {});
    }
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

        // Si ya teníamos stream local listo, llamar al host inmediatamente
        if (localMediaStream) {
          initiateOutgoingCall(localMediaStream);
        }
      } else if (msg.type === 'STREAM_READY') {
        console.log('[WebRTC Guest] El Host notificó STREAM_READY');
        if (localMediaStream) {
          initiateOutgoingCall(localMediaStream);
        }
      } else if (msg.type === 'REQUEST_STREAM') {
        if (localMediaStream) {
          initiateOutgoingCall(localMediaStream);
        }
      } else if (msg.type === 'LEAVE') {
        console.log('[WebRTC Guest] El Host salió de la partida (LEAVE)');
        activeRemoteStream = null;
        if (currentRemoteStreamListener) {
          currentRemoteStreamListener(null);
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
      activeRemoteStream = null;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(null);
      }
    });
  });

  // Escuchar si el Host nos llama con su cámara
  peer.on('call', (call) => {
    console.log('[WebRTC Guest] Recibida llamada entrante de cámara del Host');
    incomingCall = call;

    if (localMediaStream) {
      call.answer(localMediaStream);
    } else {
      call.answer();
    }

    call.on('stream', (remoteStream: MediaStream) => {
      console.log('[WebRTC Guest] ¡Stream de video y audio del Host recibido!', remoteStream.id);
      activeRemoteStream = remoteStream;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(remoteStream);
      }
    });

    call.on('close', () => {
      console.log('[WebRTC Guest] Stream de cámara del host cerrado');
      if (incomingCall === call) {
        incomingCall = null;
      }
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
      console.log('[WebRTC Guest] sendMediaStream invocado. Tracks:', stream.getTracks().length);
      localMediaStream = stream;

      // 1. Notificar al Host por DataChannel que tenemos la cámara lista
      if (activeConnection && activeConnection.open) {
        activeConnection.send({ type: 'STREAM_READY' } as PeerMessage);
      }

      // 2. Si ya hay una llamada saliente activa, reemplazar tracks
      if (outgoingCall && outgoingCall.peerConnection) {
        try {
          const pc = outgoingCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          let replacedVideo = false;
          let replacedAudio = false;

          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
              replacedVideo = true;
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
              replacedAudio = true;
            }
          });

          // Si no existía video sender previo, iniciar llamada saliente
          if (!replacedVideo && videoTrack) {
            initiateOutgoingCall(stream);
          }
        } catch (e) {
          console.warn('[WebRTC Guest Track Replace Notice]:', e);
        }
      } else {
        initiateOutgoingCall(stream);
      }

      // 3. Si teníamos una llamada entrante abierta, actualizar tracks
      if (incomingCall && incomingCall.peerConnection) {
        try {
          const pc = incomingCall.peerConnection;
          const senders: any[] = pc?.getSenders?.() || [];
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          senders.forEach((sender: any) => {
            if (sender.track?.kind === 'video' && videoTrack) {
              sender.replaceTrack(videoTrack).catch(() => {});
            } else if (sender.track?.kind === 'audio' && audioTrack) {
              sender.replaceTrack(audioTrack).catch(() => {});
            }
          });
        } catch (err) {}
      }
    },
    sendLeave: () => {
      try {
        if (activeConnection && activeConnection.open) {
          activeConnection.send({ type: 'LEAVE' } as PeerMessage);
        }
      } catch (e) {}
      activeRemoteStream = null;
      if (currentRemoteStreamListener) {
        currentRemoteStreamListener(null);
      }
    },
    getRemoteStream: () => activeRemoteStream,
    connectToPeer: (hostId: string) => {
      targetPeerId = hostId;
      if (!activeConnection || !activeConnection.open || (activeConnection.peer && activeConnection.peer !== hostId)) {
        try {
          if (activeConnection) activeConnection.close();
        } catch (e) {}
        try {
          const conn = peer.connect(hostId, { reliable: true });
          activeConnection = conn;
          conn.on('open', () => {
            console.log('[WebRTC Guest] Reconectado a Host:', hostId);
            conn.send({
              type: 'JOIN_REQUEST',
              player: guestPlayer,
              guestPeerId: peer.id || guestPeerId
            } as PeerMessage);
          });
          conn.on('data', (data: any) => {
            const msg = data as PeerMessage;
            if (!msg) return;
            if (msg.type === 'JOIN_ACCEPTED') {
              onConnected(msg.room);
              if (localMediaStream) initiateOutgoingCall(localMediaStream);
            } else if (msg.type === 'STREAM_READY') {
              if (localMediaStream) initiateOutgoingCall(localMediaStream);
            } else if (msg.type === 'REQUEST_STREAM') {
              if (localMediaStream) initiateOutgoingCall(localMediaStream);
            } else if (msg.type === 'LEAVE') {
              activeRemoteStream = null;
              if (currentRemoteStreamListener) currentRemoteStreamListener(null);
            } else if (msg.type === 'THROW') {
              if (currentThrowListener) currentThrowListener(msg.score, msg.darts, msg.isCheckout);
              if (onThrowReceived) onThrowReceived(msg.score, msg.darts, msg.isCheckout);
            }
          });
        } catch (err) {
          console.warn('[WebRTC Guest connectToPeer error]:', err);
        }
      }
      if (localMediaStream) {
        initiateOutgoingCall(localMediaStream);
      }
    },
    reconnectCall: () => {
      if (localMediaStream) {
        initiateOutgoingCall(localMediaStream);
      }
    },
    destroy: () => {
      clearTimeout(connectionTimeout);
      try {
        if (typeof window !== 'undefined') {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }
        if (incomingCall) incomingCall.close();
        if (outgoingCall) outgoingCall.close();
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
