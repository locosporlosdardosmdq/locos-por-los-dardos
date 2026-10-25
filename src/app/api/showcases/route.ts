import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { DEFAULT_LANDING_SHOWCASES } from '@/lib/storage';
import { isAuthorizedAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Obtener configuración de vitrinas de la landing centralizada en Supabase PostgreSQL
export async function GET() {
  try {
    const pool = getDbPool();
    const result = await pool.query(
      "SELECT data FROM platform_settings WHERE key = 'landing_showcases' LIMIT 1;"
    );

    if (result.rows.length > 0 && result.rows[0].data) {
      return NextResponse.json({
        success: true,
        showcases: result.rows[0].data
      });
    }

    return NextResponse.json({
      success: true,
      showcases: DEFAULT_LANDING_SHOWCASES
    });
  } catch (error: any) {
    console.error('[API /api/showcases GET Error]:', error.message);
    // Fallback silencioso a las vitrinas por defecto para resiliencia
    return NextResponse.json({
      success: true,
      showcases: DEFAULT_LANDING_SHOWCASES,
      warning: 'Fallback to defaults'
    });
  }
}

// POST: Actualizar configuración de vitrinas de la landing (exclusivo Administradores)
export async function POST(request: NextRequest) {
  try {
    const authorized = isAuthorizedAdmin(request);
    if (!authorized) {
      return NextResponse.json(
        { error: 'No autorizado. Permisos de administrador requeridos.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const showcases = body.showcases || body;

    if (!showcases || typeof showcases !== 'object') {
      return NextResponse.json(
        { error: 'Datos de vitrinas inválidos.' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    await pool.query(
      `
      INSERT INTO platform_settings (key, data, updated_at)
      VALUES ('landing_showcases', $1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET data = $1, updated_at = NOW();
      `,
      [JSON.stringify(showcases)]
    );

    return NextResponse.json({
      success: true,
      message: 'Vitrinas de portada sincronizadas correctamente en la nube.'
    });
  } catch (error: any) {
    console.error('[API /api/showcases POST Error]:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al sincronizar vitrinas.' },
      { status: 500 }
    );
  }
}
