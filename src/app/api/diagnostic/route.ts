import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  const sanitize = (url: string) => {
    if (!url) return 'NOT_CONFIGURED';
    try {
      const clean = url.trim().replace(/^["']|["']$/g, '');
      const parsed = new URL(clean);
      return {
        protocol: parsed.protocol,
        username: parsed.username,
        host: parsed.host,
        port: parsed.port,
        pathname: parsed.pathname,
        hasQuotes: url.startsWith('"') || url.startsWith("'"),
        length: url.length
      };
    } catch (e: any) {
      return {
        error: 'Invalid URL format: ' + e.message,
        preview: url.substring(0, 15) + '...',
        length: url.length
      };
    }
  };

  const results: Record<string, any> = {
    env: {
      has_DATABASE_URL: !!dbUrl,
      sanitized_DATABASE_URL: sanitize(dbUrl),
      has_DIRECT_URL: !!directUrl,
      sanitized_DIRECT_URL: sanitize(directUrl),
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    }
  };

  // Test pool query
  try {
    const pool = getDbPool();
    const start = Date.now();
    const testRes = await pool.query('SELECT count(*)::int as count FROM profiles;');
    results.dbConnection = {
      status: 'OK',
      profilesCount: testRes.rows[0]?.count,
      latencyMs: Date.now() - start
    };
  } catch (err: any) {
    results.dbConnection = {
      status: 'ERROR',
      message: err.message,
      code: err.code,
      name: err.name,
      detail: err.detail
    };
  }

  return NextResponse.json(results);
}
