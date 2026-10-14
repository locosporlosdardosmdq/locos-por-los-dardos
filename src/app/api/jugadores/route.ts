import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { PlayerProfile } from '@/lib/types';
import { ICEMAN_CARD_DATA } from '@/lib/players-data';
import { calculateAgeFromBirthDate } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mapeo de perfiles desde la base de datos PostgreSQL de Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const pool = getDbPool();
    const query = `
      SELECT 
        p.id,
        p.user_id,
        u.email,
        p.nickname,
        p.full_name,
        p.phone,
        p.province,
        p.city,
        p.avatar_url,
        p.photo_url,
        p.logo_url,
        p.nationality,
        p.country_code,
        p.initial_estimated_avg,
        p.category,
        p.status,
        p.is_verified,
        p.bio,
        p.preferred_dart_weight_g,
        p.dart_brand,
        p.major_title,
        p.club,
        p.association_role,
        p.age,
        p.birth_date,
        COALESCE(p.role, u.role::text, 'PLAYER') as role,
        s.overall_avg,
        s.first_9_avg,
        s.matches_played,
        s.matches_won,
        s.legs_played,
        s.legs_won,
        s.highest_checkout,
        s.checkout_attempts,
        s.checkout_hits,
        s.checkout_percentage,
        s.count_180s,
        s.count_140_plus,
        s.count_100_plus,
        s.count_60_plus,
        s.best_leg_darts,
        p.created_at
      FROM profiles p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN player_stats s ON p.user_id = s.user_id
      ${includeAll ? '' : "WHERE (p.status IS NULL OR p.status = 'ACTIVE')"}
      ORDER BY COALESCE(s.overall_avg, p.initial_estimated_avg) DESC;
    `;

    const result = await pool.query(query);

    const players = result.rows.map((row) => {
      const isIcemanRow = (row.nickname?.toLowerCase() === 'iceman') || 
                          (row.email?.toLowerCase() === 'marianodeux@gmail.com') ||
                          (row.full_name?.toLowerCase().includes('mariano deux'));
      
      const cleanAvatar = row.avatar_url && !row.avatar_url.includes('iceman') ? row.avatar_url : undefined;
      const cleanPhoto = row.photo_url && !row.photo_url.includes('iceman') ? row.photo_url : undefined;

      const birthDateStr = row.birth_date
        ? (row.birth_date instanceof Date ? row.birth_date.toISOString().split('T')[0] : String(row.birth_date).split('T')[0])
        : (isIcemanRow ? '1982-05-15' : undefined);
      const computedAge = row.age || (birthDateStr ? calculateAgeFromBirthDate(birthDateStr) : (isIcemanRow ? 44 : undefined));

      return {
        id: row.id || row.user_id,
        email: row.email || '',
        nickname: row.nickname || '',
        fullName: row.full_name || '',
        phone: row.phone || '',
        province: row.province || 'Buenos Aires',
        city: row.city || 'Mar del Plata',
        nationality: row.nationality || 'Argentina',
        countryCode: row.country_code || 'AR',
        avatarUrl: isIcemanRow ? (row.avatar_url || '/images/iceman-perfil.png') : cleanAvatar,
        photoUrl: isIcemanRow ? (row.photo_url || '/images/iceman-perfil.png') : cleanPhoto,
        logoUrl: row.logo_url || (isIcemanRow ? '/logos/logo-iceman-card.png' : undefined),
        estimatedAvg: parseFloat(row.initial_estimated_avg || '45.0'),
        category: row.category || 'INTERMEDIA',
        status: row.status || 'ACTIVE',
        isVerified: !!row.is_verified,
        bio: row.bio || '',
        preferredDartWeight: row.preferred_dart_weight_g ? parseFloat(row.preferred_dart_weight_g) : 24,
        dartBrand: row.dart_brand || 'TARGET 90%',
        majorTitle: row.major_title || '',
        associationRole: row.association_role || '',
        birthDate: birthDateStr,
        age: computedAge,
        role: isIcemanRow ? 'SUPERADMIN' : (row.role || 'PLAYER'),
        club: row.club || 'Darderos Mar del Plata',
        isProfileComplete: true,
        stats: {
          overallAvg: row.overall_avg ? parseFloat(row.overall_avg) : parseFloat(row.initial_estimated_avg || '45.0'),
          first9Avg: row.first_9_avg ? parseFloat(row.first_9_avg) : parseFloat(row.initial_estimated_avg || '45.0'),
          matchesPlayed: parseInt(row.matches_played || '0', 10),
          matchesWon: parseInt(row.matches_won || '0', 10),
          legsPlayed: parseInt(row.legs_played || '0', 10),
          legsWon: parseInt(row.legs_won || '0', 10),
          highestCheckout: parseInt(row.highest_checkout || '0', 10),
          checkoutAttempts: parseInt(row.checkout_attempts || '0', 10),
          checkoutHits: parseInt(row.checkout_hits || '0', 10),
          checkoutPercentage: row.checkout_percentage ? parseFloat(row.checkout_percentage) : 0,
          count180s: parseInt(row.count_180s || '0', 10),
          count140Plus: parseInt(row.count_140_plus || '0', 10),
          count100Plus: parseInt(row.count_100_plus || '0', 10),
          count60Plus: parseInt(row.count_60_plus || '0', 10),
          bestLegDarts: parseInt(row.best_leg_darts || '0', 10)
        }
      };
    });

    // Si la BD no tiene a ICEMAN por algún motivo, inyectarlo como fallback prioritario
    const hasIceman = players.some(p => 
      p.email?.toLowerCase() === 'marianodeux@gmail.com' || 
      p.nickname?.toLowerCase() === 'iceman' ||
      p.fullName?.toLowerCase().includes('mariano deux')
    );

    if (!hasIceman) {
      players.unshift({
        id: 'user-iceman-admin',
        email: 'marianodeux@gmail.com',
        nickname: 'ICEMAN',
        fullName: 'Mariano Deux (ICEMAN)',
        phone: '',
        province: 'Buenos Aires',
        city: 'Mar del Plata',
        nationality: 'Argentina',
        countryCode: 'AR',
        avatarUrl: '/images/iceman-perfil.png',
        photoUrl: '/images/iceman-perfil.png',
        logoUrl: '/logos/logo-iceman-card.png',
        estimatedAvg: 48.0,
        category: 'INTERMEDIA',
        status: 'ACTIVE',
        isVerified: true,
        bio: 'Fundador y Presidente de Darderos Mar del Plata y Locos por los Dardos Argentina.',
        club: 'Darderos Mar del Plata',
        majorTitle: 'ADMINISTRADOR OFICIAL',
        associationRole: 'Presidente • Asociación Mar del Plata',
        birthDate: '1982-05-15',
        age: 44,
        role: 'SUPERADMIN',
        preferredDartWeight: 24,
        dartBrand: 'TARGET 90%',
        isProfileComplete: true,
        stats: {
          overallAvg: 48.0,
          first9Avg: 48.0,
          matchesPlayed: 0,
          matchesWon: 0,
          legsPlayed: 0,
          legsWon: 0,
          highestCheckout: 0,
          checkoutAttempts: 0,
          checkoutHits: 0,
          checkoutPercentage: 0,
          count180s: 0,
          count140Plus: 0,
          count100Plus: 0,
          count60Plus: 0,
          bestLegDarts: 0
        }
      });
    }

    return NextResponse.json({ success: true, players }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (err: any) {
    console.error('[API /api/jugadores GET Error]:', err.message);
    return NextResponse.json({
      success: false,
      error: 'Error de conexión con la base de datos de jugadores.',
      players: []
    }, { status: 503 });
  }
}

// POST: Registrar o actualizar perfil de jugador en Supabase PostgreSQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile: Partial<PlayerProfile> = body.profile || body;

    if (!profile.nickname && !profile.fullName) {
      return NextResponse.json({ success: false, error: 'Nickname o Nombre Completo es requerido.' }, { status: 400 });
    }

    const pool = getDbPool();

    // 1. Manejar o buscar usuario en tabla `users`
    const email = (profile.email || `${profile.nickname || 'jugador'}@locosporlosdardos.com.ar`).toLowerCase().trim();
    const nickname = (profile.nickname || profile.fullName || 'Jugador').trim();
    const fullName = (profile.fullName || nickname).trim();

    // Buscar si ya existe el usuario
    const userRes = await pool.query(
      `SELECT id, email FROM users WHERE LOWER(email) = $1 LIMIT 1;`,
      [email]
    );

    let userId: string;
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
    } else {
      // Crear nuevo usuario
      const newUserRes = await pool.query(
        `INSERT INTO users (email, password_hash, role) 
         VALUES ($1, $2, $3) 
         RETURNING id;`,
        [email, 'no_hash_pwa', profile.role === 'ADMIN' ? 'ADMIN' : 'PLAYER']
      );
      userId = newUserRes.rows[0].id;
    }

    // 2. Upsert en tabla `profiles`
    const profileRes = await pool.query(
      `SELECT id FROM profiles WHERE user_id = $1 OR LOWER(nickname) = $2 LIMIT 1;`,
      [userId, nickname.toLowerCase()]
    );

    const category = profile.category || 'INTERMEDIA';
    const estimatedAvg = profile.estimatedAvg || (profile.stats?.overallAvg) || 45.0;
    const birthDate = profile.birthDate || null;
    const computedAge = profile.age || (birthDate ? calculateAgeFromBirthDate(birthDate) : null);

    let profileId: string;
    if (profileRes.rows.length > 0) {
      profileId = profileRes.rows[0].id;
      // Actualización defensiva con COALESCE para no pisar datos existentes si el payload es parcial
      await pool.query(
        `UPDATE profiles SET
          nickname = COALESCE($1, nickname),
          full_name = COALESCE($2, full_name),
          phone = COALESCE($3, phone),
          province = COALESCE($4, province),
          city = COALESCE($5, city),
          avatar_url = COALESCE($6, avatar_url),
          photo_url = COALESCE($7, photo_url),
          logo_url = COALESCE($8, logo_url),
          nationality = COALESCE($9, nationality),
          country_code = COALESCE($10, country_code),
          initial_estimated_avg = COALESCE($11, initial_estimated_avg),
          category = COALESCE($12, category),
          is_verified = COALESCE($13, is_verified),
          bio = COALESCE($14, bio),
          preferred_dart_weight_g = COALESCE($15, preferred_dart_weight_g),
          dart_brand = COALESCE($16, dart_brand),
          major_title = COALESCE($17, major_title),
          club = COALESCE($18, club),
          association_role = COALESCE($19, association_role),
          age = COALESCE($20, age),
          birth_date = COALESCE($21, birth_date),
          updated_at = NOW()
        WHERE id = $22;`,
        [
          nickname || null,
          fullName || null,
          profile.phone || null,
          profile.province || null,
          profile.city || null,
          profile.avatarUrl || null,
          profile.photoUrl || null,
          profile.logoUrl || null,
          profile.nationality || null,
          profile.countryCode || null,
          estimatedAvg || null,
          category || null,
          profile.isVerified ?? null,
          profile.bio || null,
          profile.preferredDartWeight || null,
          profile.dartBrand || null,
          profile.majorTitle || null,
          (profile as any).club || null,
          profile.associationRole || null,
          computedAge || null,
          birthDate || null,
          profileId
        ]
      );
    } else {
      const newProf = await pool.query(
        `INSERT INTO profiles (
          user_id, nickname, full_name, phone, province, city, 
          avatar_url, photo_url, logo_url, nationality, country_code,
          initial_estimated_avg, category, is_verified, bio, 
          preferred_dart_weight_g, dart_brand, major_title, club,
          association_role, age, birth_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING id;`,
        [
          userId,
          nickname,
          fullName,
          profile.phone || null,
          profile.province || 'Buenos Aires',
          profile.city || 'Mar del Plata',
          (nickname.toLowerCase() === 'iceman' || email.toLowerCase() === 'marianodeux@gmail.com') ? (profile.avatarUrl || '/images/iceman-perfil.png') : (profile.avatarUrl || null),
          profile.photoUrl || null,
          profile.logoUrl || null,
          profile.nationality || 'Argentina',
          profile.countryCode || 'AR',
          estimatedAvg,
          category,
          profile.isVerified ?? false,
          profile.bio || null,
          profile.preferredDartWeight || 24,
          profile.dartBrand || 'TARGET 90%',
          profile.majorTitle || null,
          (profile as any).club || 'Darderos Mar del Plata',
          profile.associationRole || null,
          computedAge || null,
          birthDate || null
        ]
      );
      profileId = newProf.rows[0].id;
    }

    // 3. Upsert en tabla `player_stats`
    const stats = profile.stats;
    if (stats) {
      await pool.query(
        `INSERT INTO player_stats (
          user_id, overall_avg, first_9_avg, matches_played, matches_won,
          legs_played, legs_won, highest_checkout, checkout_attempts,
          checkout_hits, checkout_percentage, count_180s, count_140_plus,
          count_100_plus, count_60_plus, best_leg_darts, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
          overall_avg = EXCLUDED.overall_avg,
          first_9_avg = EXCLUDED.first_9_avg,
          matches_played = EXCLUDED.matches_played,
          matches_won = EXCLUDED.matches_won,
          legs_played = EXCLUDED.legs_played,
          legs_won = EXCLUDED.legs_won,
          highest_checkout = EXCLUDED.highest_checkout,
          checkout_attempts = EXCLUDED.checkout_attempts,
          checkout_hits = EXCLUDED.checkout_hits,
          checkout_percentage = EXCLUDED.checkout_percentage,
          count_180s = EXCLUDED.count_180s,
          count_140_plus = EXCLUDED.count_140_plus,
          count_100_plus = EXCLUDED.count_100_plus,
          count_60_plus = EXCLUDED.count_60_plus,
          best_leg_darts = EXCLUDED.best_leg_darts,
          updated_at = NOW();`,
        [
          userId,
          stats.overallAvg || estimatedAvg,
          stats.first9Avg || estimatedAvg,
          stats.matchesPlayed || 0,
          stats.matchesWon || 0,
          stats.legsPlayed || 0,
          stats.legsWon || 0,
          stats.highestCheckout || 0,
          stats.checkoutAttempts || 0,
          stats.checkoutHits || 0,
          stats.checkoutPercentage || 0,
          stats.count180s || 0,
          stats.count140Plus || 0,
          stats.count100Plus || 0,
          stats.count60Plus || 0,
          stats.bestLegDarts || 0
        ]
      );
    }

    const savedProfile: PlayerProfile = {
      ...profile as PlayerProfile,
      id: profileId,
      email,
      nickname,
      fullName,
      birthDate: birthDate || undefined,
      age: computedAge || undefined,
      category,
      estimatedAvg,
      isProfileComplete: true
    };

    return NextResponse.json({ success: true, profile: savedProfile });
  } catch (err: any) {
    console.error('[API /api/jugadores POST Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Actualización quirúrgica de campos específicos (categoría, rol, club, estado, fecha de nacimiento, rol del sistema) sin sobreescribir el resto del perfil
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, category, nickname, associationRole, isVerified, club, status, birthDate, age, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de jugador requerido para actualización parcial.' }, { status: 400 });
    }

    const computedPatchAge = age || (birthDate ? calculateAgeFromBirthDate(birthDate) : null);
    const pool = getDbPool();
    await pool.query(
      `UPDATE profiles SET
        category = COALESCE($1, category),
        nickname = COALESCE($2, nickname),
        association_role = COALESCE($3, association_role),
        is_verified = COALESCE($4, is_verified),
        club = COALESCE($5, club),
        status = COALESCE($6, status),
        birth_date = COALESCE($7, birth_date),
        age = COALESCE($8, age),
        role = COALESCE($9, role),
        updated_at = NOW()
      WHERE id = $10 OR user_id = $10;`,
      [
        category || null,
        nickname || null,
        associationRole || null,
        isVerified ?? null,
        club || null,
        status || null,
        birthDate || null,
        computedPatchAge || null,
        role || null,
        id
      ]
    );

    // Si se actualizó el rol, sincronizar también en users
    if (role && (role === 'PLAYER' || role === 'ORGANIZER' || role === 'ADMIN' || role === 'SUPERADMIN')) {
      await pool.query(
        `UPDATE users SET role = $1::user_role WHERE id = $2 OR id = (SELECT user_id FROM profiles WHERE id = $2);`,
        [role, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Perfil actualizado exitosamente' });
  } catch (err: any) {
    console.error('[API /api/jugadores PATCH Error]:', err.message);
    return NextResponse.json({ success: false, error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}

