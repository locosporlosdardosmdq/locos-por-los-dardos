import { Pool } from 'pg';

/**
 * Conexión central a Supabase PostgreSQL para Next.js App Router (Serverless & Local)
 * Prioridad:
 * 1. DATABASE_URL (Transaction Pooler - puerto 6543 para Serverless en Vercel)
 * 2. DIRECT_URL (Session Pooler / Conexión directa)
 */
function getSanitizedConnectionString(): string {
  let conn = process.env.DATABASE_URL || process.env.DIRECT_URL;

  if (!conn) {
    throw new Error(
      '[CRITICAL DB CONFIG ERROR]: DATABASE_URL o DIRECT_URL no está configurada en las variables de entorno. ' +
      'Configura la cadena de conexión en .env.local o en las variables de entorno de Vercel.'
    );
  }

  // Auto-corrección de seguridad: si Vercel tiene configurada la región errónea 'aws-0-sa-east-1',
  // redirigir automáticamente al pooler real del proyecto ('aws-0-us-east-1')
  if (conn.includes('aws-0-sa-east-1.pooler.supabase.com')) {
    conn = conn.replace('aws-0-sa-east-1.pooler.supabase.com', 'aws-0-us-east-1.pooler.supabase.com');
  }

  return conn;
}

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = getSanitizedConnectionString();

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
    });

    pool.on('error', (err) => {
      console.error('[DB Pool Critical Error]:', err.message);
    });
  }

  return pool;
}
