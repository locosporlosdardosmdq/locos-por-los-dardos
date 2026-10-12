import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { PlayerProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, identifier, profile } = body;
    const pool = getDbPool();

    // 1. INICIAR SESIÓN / BUSCAR PERFIL EXISTENTE
    if (action === 'LOGIN' || action === 'FETCH') {
      const idOrEmail = (identifier || '').toLowerCase().trim();
      if (!idOrEmail) {
        return NextResponse.json({ success: false, error: 'Ingresa tu Email o Apodo para iniciar sesión.' }, { status: 400 });
      }

      const res = await pool.query(
        `SELECT 
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
          p.is_verified,
          p.bio,
          p.preferred_dart_weight_g,
          p.dart_brand,
          p.major_title,
          p.club,
          p.association_role,
          p.age,
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
          s.best_leg_darts
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN player_stats s ON p.user_id = s.user_id
        WHERE LOWER(u.email) = $1 OR LOWER(p.nickname) = $1 OR p.id::text = $1
        LIMIT 1;`,
        [idOrEmail]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'No se encontró ninguna cuenta registrada con ese email o apodo.' }, { status: 404 });
      }

      const row = res.rows[0];
      const userProfile: PlayerProfile = {
        id: row.id,
        email: row.email,
        nickname: row.nickname,
        fullName: row.full_name,
        phone: row.phone || '',
        province: row.province || 'Buenos Aires',
        city: row.city || 'Mar del Plata',
        nationality: row.nationality || 'Argentina',
        countryCode: row.country_code || 'AR',
        avatarUrl: row.avatar_url || '/images/iceman-perfil.png',
        photoUrl: row.photo_url || undefined,
        logoUrl: row.logo_url || undefined,
        estimatedAvg: parseFloat(row.initial_estimated_avg || '45.0'),
        category: row.category || 'INTERMEDIA',
        isVerified: !!row.is_verified,
        bio: row.bio || '',
        preferredDartWeight: row.preferred_dart_weight_g ? parseFloat(row.preferred_dart_weight_g) : 24,
        dartBrand: row.dart_brand || 'TARGET 90%',
        majorTitle: row.major_title || '',
        associationRole: row.association_role || '',
        age: row.age || undefined,
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

      return NextResponse.json({ success: true, profile: userProfile });
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada.' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/auth POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
