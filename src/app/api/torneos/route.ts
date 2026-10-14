import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { Tournament } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();
    const query = `
      SELECT 
        id, 
        title, 
        slug, 
        description, 
        tournament_type, 
        format, 
        starting_score, 
        out_mode, 
        best_of_legs, 
        max_participants, 
        venue_name, 
        city, 
        province, 
        start_date, 
        end_date, 
        status, 
        banner_image_url, 
        entry_fee_ars, 
        prize_pool_ars, 
        data, 
        created_at
      FROM tournaments
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    const tournaments: Tournament[] = result.rows.map((row) => {
      if (row.data && typeof row.data === 'object' && row.data.title) {
        return {
          ...row.data,
          id: String(row.id),
          title: row.title || row.data.title,
          status: row.status || row.data.status || 'REGISTRATION_OPEN',
          entryFeeArs: row.entry_fee_ars !== null ? parseFloat(row.entry_fee_ars) : (row.data.entryFeeArs || 0),
          prizePoolArs: row.prize_pool_ars !== null ? parseFloat(row.prize_pool_ars) : (row.data.prizePoolArs || 0)
        };
      }

      // Reconstrucción de fallback desde columnas relacionales si data no estuviese poblada
      return {
        id: String(row.id),
        slug: row.slug || String(row.id),
        title: row.title,
        description: row.description || '',
        type: row.tournament_type || 'PRESENCIAL',
        format: row.format || 'SINGLE_ELIMINATION',
        startingScore: row.starting_score || 501,
        outMode: row.out_mode || 'DOUBLE_OUT',
        bestOfLegs: row.best_of_legs || 5,
        maxParticipants: row.max_participants || 32,
        registeredCount: 0,
        venueName: row.venue_name || 'Sede Central',
        city: row.city || 'Mar del Plata',
        province: row.province || 'Buenos Aires',
        startDate: row.start_date ? new Date(row.start_date).toISOString() : new Date().toISOString(),
        endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
        status: row.status || 'REGISTRATION_OPEN',
        bannerImageUrl: row.banner_image_url || '/logos/logo-mdq.png',
        entryFeeArs: parseFloat(row.entry_fee_ars || '0'),
        prizePoolArs: parseFloat(row.prize_pool_ars || '0'),
        organizer: 'Locos por los Dardos & Darderos Mar del Plata'
      };
    });

    return NextResponse.json({ success: true, tournaments });
  } catch (err: any) {
    console.error('[API /api/torneos GET Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error al consultar torneos de la base de datos.', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tournament: Tournament = body.tournament;

    if (!tournament || !tournament.id || !tournament.title) {
      return NextResponse.json(
        { success: false, error: 'Datos de torneo incompletos. ID y Título requeridos.' },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    const id = String(tournament.id);
    const title = tournament.title.trim();
    const slug = tournament.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const description = tournament.description || '';
    const tournamentType = tournament.type === 'ONLINE' ? 'ONLINE' : 'PRESENCIAL';
    const format = ['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'HYBRID'].includes(tournament.format)
      ? tournament.format
      : 'SINGLE_ELIMINATION';
    const startingScore = tournament.startingScore || 501;
    const outMode = ['SINGLE_OUT', 'DOUBLE_OUT', 'MASTER_OUT'].includes(tournament.outMode)
      ? tournament.outMode
      : 'DOUBLE_OUT';
    const bestOfLegs = tournament.bestOfLegs || 5;
    const maxParticipants = tournament.maxParticipants || 32;
    const venueName = tournament.venueName || 'Sede Mar del Plata';
    const city = tournament.city || 'Mar del Plata';
    const province = tournament.province || 'Buenos Aires';
    const startDate = tournament.startDate ? new Date(tournament.startDate) : new Date();
    const status = tournament.status || 'REGISTRATION_OPEN';
    const bannerImageUrl = tournament.bannerImageUrl || '/logos/logo-mdq.png';
    const entryFeeArs = tournament.entryFeeArs || 0;
    const prizePoolArs = tournament.prizePoolArs || 0;

    const upsertQuery = `
      INSERT INTO tournaments (
        id, 
        title, 
        slug, 
        description, 
        tournament_type, 
        format, 
        starting_score, 
        out_mode, 
        best_of_legs, 
        max_participants, 
        venue_name, 
        city, 
        province, 
        start_date, 
        status, 
        banner_image_url, 
        entry_fee_ars, 
        prize_pool_ars, 
        data, 
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        tournament_type = EXCLUDED.tournament_type,
        format = EXCLUDED.format,
        starting_score = EXCLUDED.starting_score,
        out_mode = EXCLUDED.out_mode,
        best_of_legs = EXCLUDED.best_of_legs,
        max_participants = EXCLUDED.max_participants,
        venue_name = EXCLUDED.venue_name,
        city = EXCLUDED.city,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        banner_image_url = EXCLUDED.banner_image_url,
        entry_fee_ars = EXCLUDED.entry_fee_ars,
        prize_pool_ars = EXCLUDED.prize_pool_ars,
        data = EXCLUDED.data;
    `;

    await pool.query(upsertQuery, [
      id,
      title,
      slug,
      description,
      tournamentType,
      format,
      startingScore,
      outMode,
      bestOfLegs,
      maxParticipants,
      venueName,
      city,
      province,
      startDate,
      status,
      bannerImageUrl,
      entryFeeArs,
      prizePoolArs,
      JSON.stringify(tournament)
    ]);

    return NextResponse.json({ success: true, tournament });
  } catch (err: any) {
    console.error('[API /api/torneos POST Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error guardando torneo en la nube.', details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parámetro id requerido para eliminar.' },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    await pool.query('DELETE FROM tournaments WHERE id = $1', [id]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('[API /api/torneos DELETE Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar torneo de la base de datos.', details: err.message },
      { status: 500 }
    );
  }
}
