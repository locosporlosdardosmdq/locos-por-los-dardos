import { Pool } from 'pg';

/**
 * Conexión central a Supabase PostgreSQL para Next.js App Router (Serverless & Local)
 * Prioridad:
 * 1. DATABASE_URL (Transaction Pooler - puerto 6543 para Serverless en Vercel)
 * 2. DIRECT_URL (Session Pooler / Conexión directa)
 */
function cleanUrl(raw?: string): string | null {
  if (!raw) return null;
  let conn = raw.trim().replace(/^["']|["']$/g, '').replace(/[\r\n]+/g, '');
  if (!conn) return null;
  if (conn.includes('aws-0-sa-east-1.pooler.supabase.com')) {
    conn = conn.replace('aws-0-sa-east-1.pooler.supabase.com', 'aws-0-us-east-1.pooler.supabase.com');
  }
  return conn;
}

function getSanitizedConnectionString(): string {
  const dbUrl = cleanUrl(process.env.DATABASE_URL);
  const directUrl = cleanUrl(process.env.DIRECT_URL);
  const conn = dbUrl || directUrl;

  if (!conn) {
    throw new Error(
      '[CRITICAL DB CONFIG ERROR]: DATABASE_URL o DIRECT_URL no está configurada en las variables de entorno. ' +
      'Configura la cadena de conexión en .env.local o en las variables de entorno de Vercel.'
    );
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
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('[DB Pool Critical Error]:', err.message);
      pool = null;
    });
  }

  return pool;
}
