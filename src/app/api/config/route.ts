import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Recuperar configuraciones globales de la plataforma (Vitrinas, Cuenta Bancaria, Autoridades)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const pool = getDbPool();

    if (key) {
      const result = await pool.query(
        'SELECT data FROM platform_settings WHERE key = $1 LIMIT 1;',
        [key]
      );

      if (result.rows.length > 0 && result.rows[0].data) {
        return NextResponse.json({
          success: true,
          key,
          data: result.rows[0].data
        });
      }

      return NextResponse.json({
        success: true,
        key,
        data: null
      });
    }

    // Si no se especifica key, entregar todas las configuraciones en un diccionario
    const result = await pool.query('SELECT key, data FROM platform_settings;');
    const settings: Record<string, any> = {};
    result.rows.forEach(r => {
      settings[r.key] = r.data;
    });

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    console.error('[API /api/config GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Error al consultar configuración de la plataforma' },
      { status: 500 }
    );
  }
}

// POST: Actualizar cualquier configuración global de la plataforma (Exclusivo Administrador)
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
    const { key, data } = body;

    if (!key || typeof key !== 'string' || !data) {
      return NextResponse.json(
        { error: 'Clave y datos requeridos para configurar la plataforma.' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    await pool.query(
      `
      INSERT INTO platform_settings (key, data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key)
      DO UPDATE SET data = $2, updated_at = NOW();
      `,
      [key, JSON.stringify(data)]
    );

    return NextResponse.json({
      success: true,
      message: `Configuración '${key}' persistida exitosamente en Supabase PostgreSQL.`
    });
  } catch (error: any) {
    console.error('[API /api/config POST Error]:', error.message);
    return NextResponse.json(
      { error: 'Error interno al guardar configuración en la nube.' },
      { status: 500 }
    );
  }
}
