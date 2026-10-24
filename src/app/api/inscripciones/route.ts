import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { GrandTournamentRegistration } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Consultar inscripciones federadas desde la base de datos central Supabase PostgreSQL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const pool = getDbPool();

    // 1. Obtener registros de la tabla dedicada grand_tournament_registrations
    let query = `
      SELECT 
        id, 
        tournament_id as "tournamentId", 
        tournament_title as "tournamentTitle", 
        registered_at as "registeredAt", 
        full_name as "fullName", 
        nickname, 
        dni_or_passport as "dniOrPassport", 
        nationality, 
        country_code as "countryCode", 
        city, 
        province, 
        club, 
        email, 
        phone_whatsapp as "phoneWhatsApp", 
        attendance_days as "attendanceDays", 
        companions_count as "companionsCount", 
        dinner_comensales_count as "dinnerComensalesCount", 
        dietary_restrictions as "dietaryRestrictions", 
        notes, 
        compete_singles as "competeSingles", 
        compete_doubles as "competeDoubles", 
        doubles_partner_mode as "doublesPartnerMode", 
        doubles_partner_name as "doublesPartnerName", 
        payment_status as "paymentStatus", 
        payment_method as "paymentMethod", 
        data, 
        created_at as "createdAt"
      FROM grand_tournament_registrations
    `;

    const values: any[] = [];
    if (tournamentId && tournamentId !== 'ALL') {
      query += ` WHERE tournament_id = $1`;
      values.push(tournamentId);
    }
    query += ` ORDER BY registered_at DESC, created_at DESC;`;

    const result = await pool.query(query, values);
    let registrations: GrandTournamentRegistration[] = result.rows.map(row => {
      if (row.data && typeof row.data === 'object') {
        return {
          ...row.data,
          id: row.id,
          tournamentId: row.tournamentId,
          tournamentTitle: row.tournamentTitle || row.data.tournamentTitle,
          fullName: row.fullName || row.data.fullName,
          nickname: row.nickname || row.data.nickname,
          dniOrPassport: row.dniOrPassport || row.data.dniOrPassport,
          nationality: row.nationality || row.data.nationality,
          countryCode: row.countryCode || row.data.countryCode,
          city: row.city || row.data.city,
          province: row.province || row.data.province,
          club: row.club || row.data.club,
          phoneWhatsApp: row.phoneWhatsApp || row.data.phoneWhatsApp,
          email: row.email || row.data.email,
          attendanceDays: row.attendanceDays || row.data.attendanceDays,
          companionsCount: Number(row.companionsCount ?? row.data.companionsCount ?? 0),
          dinnerComensalesCount: Number(row.dinnerComensalesCount ?? row.data.dinnerComensalesCount ?? 1),
          dietaryRestrictions: row.dietaryRestrictions || row.data.dietaryRestrictions,
          competeSingles: row.competeSingles ?? row.data.competeSingles,
          competeDoubles: row.competeDoubles ?? row.data.competeDoubles,
          doublesPartnerMode: row.doublesPartnerMode || row.data.doublesPartnerMode,
          doublesPartnerName: row.doublesPartnerName || row.data.doublesPartnerName,
          paymentStatus: row.paymentStatus || row.data.paymentStatus || 'PENDING'
        };
      }
      return {
        id: row.id,
        tournamentId: row.tournamentId,
        tournamentTitle: row.tournamentTitle,
        registeredAt: row.registeredAt ? new Date(row.registeredAt).toISOString() : new Date().toISOString(),
        fullName: row.fullName,
        nickname: row.nickname || row.fullName.split(' ')[0],
        dniOrPassport: row.dniOrPassport || '',
        nationality: row.nationality || 'Argentina',
        countryCode: row.countryCode || 'AR',
        city: row.city || 'Mar del Plata',
        province: row.province || 'Buenos Aires',
        club: row.club || 'Independiente',
        email: row.email || '',
        phoneWhatsApp: row.phoneWhatsApp || '',
        attendanceDays: row.attendanceDays || 'BOTH_DAYS',
        companionsCount: Number(row.companionsCount || 0),
        dinnerComensalesCount: Number(row.dinnerComensalesCount || 1),
        dietaryRestrictions: row.dietaryRestrictions || undefined,
        notes: row.notes || undefined,
        competeSingles: row.competeSingles ?? true,
        competeDoubles: row.competeDoubles ?? false,
        doublesPartnerMode: row.doublesPartnerMode || undefined,
        doublesPartnerName: row.doublesPartnerName || undefined,
        paymentStatus: row.paymentStatus || 'PENDING',
        paymentMethod: row.paymentMethod || 'TRANSFERENCIA_BANCARIA'
      };
    });

    // 2. Reconciliación con enrolledPlayers guardados en los torneos de la base de datos
    // (Por ejemplo: Héctor Giménez registrado directamente en enrolledPlayers de torneo-open-mdq-2026)
    try {
      const tourneyQuery = `SELECT id, title, data FROM tournaments`;
      const tourneyRes = await pool.query(tourneyQuery);

      tourneyRes.rows.forEach(tRow => {
        const tData = tRow.data;
        if (tData && Array.isArray(tData.enrolledPlayers)) {
          tData.enrolledPlayers.forEach((p: any) => {
            const alreadyInList = registrations.some(
              r => r.id === p.id || 
              (r.fullName.toLowerCase() === (p.name || '').toLowerCase() && p.name)
            );

            if (!alreadyInList && p.name) {
              const syntheticReg: GrandTournamentRegistration = {
                id: p.id || `reg_${Date.now()}_sync`,
                tournamentId: tRow.id,
                tournamentTitle: tData.title || tRow.title || 'Gran Open Mar del Plata 2026',
                registeredAt: p.enrolledAt || new Date().toISOString(),
                fullName: p.name,
                nickname: p.nickname || p.name.split(' ')[0],
                dniOrPassport: p.dniOrPassport || 'En Acreditación',
                nationality: p.nationality || 'Argentina',
                countryCode: p.countryCode || 'AR',
                city: p.city || tData.city || 'Mar del Plata',
                province: p.province || tData.province || 'Buenos Aires',
                club: p.club || 'Darderos Mar del Plata',
                email: p.email || '',
                phoneWhatsApp: p.phoneWhatsApp || '',
                attendanceDays: p.attendanceDays || 'BOTH_DAYS',
                companionsCount: Number(p.companionsCount || 0),
                dinnerComensalesCount: Number(p.dinnerComensalesCount || 1),
                dietaryRestrictions: p.dietaryRestrictions || undefined,
                competeSingles: p.competeSingles ?? true,
                competeDoubles: p.competeDoubles ?? false,
                doublesPartnerMode: p.doublesPartnerMode,
                doublesPartnerName: p.doublesPartnerName,
                paymentStatus: p.paymentStatus || 'PENDING',
                paymentMethod: 'TRANSFERENCIA_BANCARIA'
              };
              registrations.push(syntheticReg);
            }
          });
        }
      });
    } catch (err: any) {
      console.warn('[API /api/inscripciones] Error en reconciliación de torneos:', err.message);
    }

    return NextResponse.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (err: any) {
    console.error('[API /api/inscripciones GET Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error al consultar inscripciones de la base de datos.', details: err.message },
      { status: 500 }
    );
  }
}

// POST: Registrar una nueva inscripción en Supabase PostgreSQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reg: GrandTournamentRegistration = body.registration;

    if (!reg || !reg.id || !reg.fullName) {
      return NextResponse.json(
        { success: false, error: 'Datos de inscripción incompletos. ID y Nombre requeridos.' },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    const upsertQuery = `
      INSERT INTO grand_tournament_registrations (
        id,
        tournament_id,
        tournament_title,
        registered_at,
        full_name,
        nickname,
        dni_or_passport,
        nationality,
        country_code,
        city,
        province,
        club,
        email,
        phone_whatsapp,
        attendance_days,
        companions_count,
        dinner_comensales_count,
        dietary_restrictions,
        notes,
        compete_singles,
        compete_doubles,
        doubles_partner_mode,
        doubles_partner_name,
        payment_status,
        payment_method,
        data,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        tournament_id = EXCLUDED.tournament_id,
        tournament_title = EXCLUDED.tournament_title,
        full_name = EXCLUDED.full_name,
        nickname = EXCLUDED.nickname,
        dni_or_passport = EXCLUDED.dni_or_passport,
        nationality = EXCLUDED.nationality,
        country_code = EXCLUDED.country_code,
        city = EXCLUDED.city,
        province = EXCLUDED.province,
        club = EXCLUDED.club,
        email = EXCLUDED.email,
        phone_whatsapp = EXCLUDED.phone_whatsapp,
        attendance_days = EXCLUDED.attendance_days,
        companions_count = EXCLUDED.companions_count,
        dinner_comensales_count = EXCLUDED.dinner_comensales_count,
        dietary_restrictions = EXCLUDED.dietary_restrictions,
        notes = EXCLUDED.notes,
        compete_singles = EXCLUDED.compete_singles,
        compete_doubles = EXCLUDED.compete_doubles,
        doubles_partner_mode = EXCLUDED.doubles_partner_mode,
        doubles_partner_name = EXCLUDED.doubles_partner_name,
        payment_status = EXCLUDED.payment_status,
        payment_method = EXCLUDED.payment_method,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;

    await pool.query(upsertQuery, [
      reg.id,
      reg.tournamentId || 'torneo-open-mdq-2026',
      reg.tournamentTitle || 'Gran Open Mar del Plata 2026 • Pompeya Arena',
      reg.registeredAt ? new Date(reg.registeredAt) : new Date(),
      reg.fullName.trim(),
      reg.nickname || reg.fullName.split(' ')[0],
      reg.dniOrPassport ? reg.dniOrPassport.trim().toUpperCase() : '',
      reg.nationality || 'Argentina',
      reg.countryCode || 'AR',
      reg.city || 'Mar del Plata',
      reg.province || 'Buenos Aires',
      reg.club || 'Independiente',
      reg.email || '',
      reg.phoneWhatsApp || '',
      reg.attendanceDays || 'BOTH_DAYS',
      Number(reg.companionsCount || 0),
      Number(reg.dinnerComensalesCount || 1),
      reg.dietaryRestrictions || null,
      reg.notes || null,
      reg.competeSingles !== false,
      reg.competeDoubles === true,
      reg.doublesPartnerMode || null,
      reg.doublesPartnerName || null,
      reg.paymentStatus || 'PENDING',
      reg.paymentMethod || 'TRANSFERENCIA_BANCARIA',
      JSON.stringify(reg)
    ]);

    // También actualizar el torneo correspondiente en Supabase
    try {
      const tourneyRes = await pool.query(`SELECT id, data FROM tournaments WHERE id = $1`, [reg.tournamentId || 'torneo-open-mdq-2026']);
      if (tourneyRes.rows.length > 0) {
        const tRow = tourneyRes.rows[0];
        const tData = tRow.data || {};
        const enrolled = Array.isArray(tData.enrolledPlayers) ? [...tData.enrolledPlayers] : [];
        const existingIdx = enrolled.findIndex((p: any) => p.id === reg.id || p.name.toLowerCase() === reg.fullName.toLowerCase());
        
        const playerItem = {
          id: reg.id,
          name: reg.fullName,
          nickname: reg.nickname,
          avatarUrl: '/logos/logo-mdq.png',
          nationality: reg.nationality,
          countryCode: reg.countryCode,
          enrolledAt: reg.registeredAt
        };

        if (existingIdx >= 0) {
          enrolled[existingIdx] = { ...enrolled[existingIdx], ...playerItem };
        } else {
          enrolled.push(playerItem);
        }

        const updatedData = {
          ...tData,
          registeredCount: enrolled.length,
          enrolledPlayers: enrolled
        };

        await pool.query(`UPDATE tournaments SET data = $1 WHERE id = $2`, [JSON.stringify(updatedData), tRow.id]);
      }
    } catch (err: any) {
      console.warn('[API /api/inscripciones] Error al sincronizar enrolledPlayers de torneo:', err.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Inscripción guardada exitosamente en PostgreSQL.',
      registration: reg
    });
  } catch (err: any) {
    console.error('[API /api/inscripciones POST Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Error al guardar la inscripción.', details: err.message },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar estado de pago o detalles de inscripción
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de inscripción requerido.' }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.query(
      `UPDATE grand_tournament_registrations SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
      [paymentStatus, id]
    );

    return NextResponse.json({ success: true, message: 'Estado actualizado correctamente.' });
  } catch (err: any) {
    console.error('[API /api/inscripciones PATCH Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Eliminar inscripción
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido.' }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.query(`DELETE FROM grand_tournament_registrations WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: 'Inscripción eliminada correctamente.' });
  } catch (err: any) {
    console.error('[API /api/inscripciones DELETE Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
