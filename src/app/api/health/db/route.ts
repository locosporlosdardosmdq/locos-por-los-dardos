import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT 1 as ping, NOW() as server_time;');
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      status: 'HEALTHY',
      latencyMs,
      serverTime: result.rows[0]?.server_time,
      database: 'Supabase PostgreSQL (Transaction Pooler)',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error('[Health Check DB Failure]:', err.message);

    return NextResponse.json({
      ok: false,
      status: 'UNHEALTHY',
      latencyMs,
      error: 'Servicio de base de datos no disponible temporalmente',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
