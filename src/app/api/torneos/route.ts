import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { Tournament } from '@/lib/types';
import { isAuthorizedAdmin } from '@/lib/server-auth';

// Helper para desinflar avatares Base64 incrustados en torneos y ahorrar ancho de banda
function sanitizePlayerAvatar(p?: any) {
  if (!p) return p;
  if (typeof p.avatarUrl === 'string' && (p.avatarUrl.startsWith('data:image/') || p.avatarUrl.length > 500)) {
    const { avatarUrl, ...rest } = p;
    return rest;
  }
  return p;
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const pool = getDbPool();

    const query = id
      ? `
        SELECT 
          id, title, slug, description, tournament_type, format, starting_score, 
          out_mode, best_of_legs, max_participants, venue_name, city, province, 
          start_date, end_date, status, banner_image_url, entry_fee_ars, prize_pool_ars, 
          data, created_at
        FROM tournaments
        WHERE id::text = $1 OR slug = $1
        LIMIT 1;
      `
      : `
        SELECT 
          id, title, slug, description, tournament_type, format, starting_score, 
          out_mode, best_of_legs, max_participants, venue_name, city, province, 
          start_date, end_date, status, banner_image_url, entry_fee_ars, prize_pool_ars, 
          data, created_at
        FROM tournaments
        ORDER BY created_at DESC;
      `;

    const result = id ? await pool.query(query, [id]) : await pool.query(query);

    const tournaments: Tournament[] = result.rows.map((row) => {
      let tData: any = null;
      if (row.data && typeof row.data === 'object' && row.data.title) {
        tData = { ...row.data };
      } else {
        tData = {
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
          status: row.status || 'REGISTRATION_OPEN',
          bannerImageUrl: row.banner_image_url || '/logos/logo-mdq.png',
          entryFeeArs: parseFloat(row.entry_fee_ars || '0'),
          prizePoolArs: parseFloat(row.prize_pool_ars || '0'),
          organizer: 'Locos por los Dardos & Darderos Mar del Plata'
        };
      }

      // Desinflar Base64 de enrolledPlayers y matches para respuestas ligeras
      if (Array.isArray(tData.enrolledPlayers)) {
        tData.enrolledPlayers = tData.enrolledPlayers.map(sanitizePlayerAvatar);
      }
      if (Array.isArray(tData.matches)) {
        tData.matches = tData.matches.map((m: any) => ({
          ...m,
          player1: sanitizePlayerAvatar(m.player1),
          player2: sanitizePlayerAvatar(m.player2)
        }));
      }

      return {
        ...tData,
        id: String(row.id),
        title: row.title || tData.title,
        status: row.status || tData.status || 'REGISTRATION_OPEN',
        startDate: row.start_date ? new Date(row.start_date).toISOString() : (tData.startDate || new Date().toISOString()),
        endDate: row.end_date ? new Date(row.end_date).toISOString() : tData.endDate,
        entryFeeArs: row.entry_fee_ars !== null ? parseFloat(row.entry_fee_ars) : (tData.entryFeeArs || 0),
        prizePoolArs: row.prize_pool_ars !== null ? parseFloat(row.prize_pool_ars) : (tData.prizePoolArs || 0)
      };
    });

    const responsePayload = {
      success: true,
      ...(id ? { tournament: tournaments[0] || null } : {}),
      tournaments
    };

    const jsonString = JSON.stringify(responsePayload);
    const etag = `W/"t-${jsonString.length}-${tournaments.map(t => `${t.id}:${t.status}:${t.registeredCount || 0}`).join('|')}"`;

    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15'
      }
    });
  } catch (err: any) {
    console.error('[API /api/torneos GET Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error al consultar torneos de la base de datos.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Se requieren credenciales de administrador.' },
        { status: 401 }
      );
    }

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
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;
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
        end_date,
        status, 
        banner_image_url, 
        entry_fee_ars, 
        prize_pool_ars, 
        data, 
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()
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
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
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
      endDate,
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
      { success: false, error: 'Error guardando torneo en la base de datos.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Se requieren credenciales de administrador.' },
        { status: 401 }
      );
    }

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
      { success: false, error: 'Error al eliminar torneo de la base de datos.' },
      { status: 500 }
    );
  }
}
