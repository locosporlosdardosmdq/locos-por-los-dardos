import { NextRequest, NextResponse } from 'next/server';
import { 
  createOnlineRoom, 
  getOnlineRoom, 
  joinOnlineRoom, 
  submitRoomThrow,
  registerRoomHeartbeat
} from '@/lib/online-rooms';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('codigo') || searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Parámetro de código faltante.' }, { status: 400 });
  }

  const room = getOnlineRoom(code);
  if (!room) {
    return NextResponse.json({ error: 'Sala no encontrada o inactiva.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'CREATE') {
      const { hostPlayer, config } = body;
      if (!hostPlayer || !config) {
        return NextResponse.json({ error: 'Datos de jugador o configuración incompletos.' }, { status: 400 });
      }

      const room = createOnlineRoom(hostPlayer, config);
      return NextResponse.json({ success: true, room });
    }

    if (action === 'JOIN') {
      const { code, guestPlayer } = body;
      if (!code || !guestPlayer) {
        return NextResponse.json({ error: 'Código de sala o datos de rival incompletos.' }, { status: 400 });
      }

      const res = joinOnlineRoom(code, guestPlayer);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, room: res.room });
    }

    if (action === 'THROW') {
      const { code, playerIndex, score, isCheckout } = body;
      if (!code || playerIndex === undefined || score === undefined) {
        return NextResponse.json({ error: 'Parámetros de tiro insuficientes.' }, { status: 400 });
      }

      const res = submitRoomThrow(code, playerIndex, score, !!isCheckout);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, room: res.room });
    }

    if (action === 'HEARTBEAT') {
      const { code, playerIndex, peerId } = body;
      if (!code || playerIndex === undefined) {
        return NextResponse.json({ error: 'Parámetros insuficientes.' }, { status: 400 });
      }

      const res = registerRoomHeartbeat(code, playerIndex, peerId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, room: res.room });
    }

    return NextResponse.json({ error: 'Acción no soportada.' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/salas Error]:', err);
    return NextResponse.json({ error: 'Error procesando solicitud de sala.' }, { status: 500 });
  }
}
