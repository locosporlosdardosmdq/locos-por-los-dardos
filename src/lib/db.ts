import { Pool } from 'pg';

// Cadena de conexión directa a Supabase PostgreSQL con SSL
const connectionString = 
  process.env.DIRECT_URL || 
  process.env.DATABASE_URL || 
  'postgresql://postgres:D25SJh5t2oMiHa2K@db.pufyeabrvrlikbgkjplz.supabase.co:5432/postgres';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    // Normalizar connection string: para Vercel serverless / conexión directa a Supabase
    let finalConnectionString = connectionString;
    // Si viene con pgbouncer o puerto 6543 y da error de tenant, preferir conexión directa a db.pufyeabrvrlikbgkjplz.supabase.co:5432
    if (finalConnectionString.includes('aws-0-sa-east-1.pooler.supabase.com:6543')) {
      finalConnectionString = 'postgresql://postgres:D25SJh5t2oMiHa2K@db.pufyeabrvrlikbgkjplz.supabase.co:5432/postgres';
    }

    pool = new Pool({
      connectionString: finalConnectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on('error', (err) => {
      console.error('[DB Pool Error]', err);
    });
  }

  return pool;
}
