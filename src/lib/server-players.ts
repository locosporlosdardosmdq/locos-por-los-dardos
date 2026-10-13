import { getDbPool } from '@/lib/db';
import { UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';
import { CANONICAL_PLAYERS } from '@/lib/players-data';

export function mapDbRowToCard(row: any): UltimateDartsCardData {
  const isIcemanRow =
    row.nickname?.toLowerCase() === 'iceman' ||
    row.email?.toLowerCase() === 'marianodeux@gmail.com' ||
    row.full_name?.toLowerCase().includes('mariano deux');

  const cleanAvatar = row.avatar_url && !row.avatar_url.includes('iceman') ? row.avatar_url : undefined;
  const cleanPhoto = row.photo_url && !row.photo_url.includes('iceman') ? row.photo_url : undefined;

  const avg = parseFloat(row.overall_avg || row.initial_estimated_avg || '40.0');

  return {
    id: row.id || row.user_id || `player-${Math.random()}`,
    name: row.full_name || row.nickname || 'Jugador Oficial',
    nickname: row.nickname || row.full_name || 'Jugador',
    avatarUrl: isIcemanRow ? (row.avatar_url || '/images/iceman-perfil.png') : (cleanAvatar || '/logos/logo-mdq.png'),
    photoUrl: isIcemanRow ? (row.photo_url || '/images/iceman-perfil.png') : cleanPhoto,
    logoUrl: row.logo_url || (isIcemanRow ? '/logos/logo-iceman-card.png' : undefined),
    nationality: row.nationality || 'Argentina',
    countryCode: row.country_code || 'AR',
    province: row.province || 'Buenos Aires',
    city: row.city || 'Mar del Plata',
    club: row.club || 'Darderos Mar del Plata',
    avg: isNaN(avg) ? 40.0 : avg,
    category: row.category || 'INTERMEDIA',
    matchesWon: parseInt(row.matches_won || '0', 10),
    matchesTotal: parseInt(row.matches_played || '0', 10),
    count180s: parseInt(row.count_180s || '0', 10),
    highestCheckout: parseInt(row.highest_checkout || '0', 10),
    isVerified: !!row.is_verified,
    majorTitle: row.major_title || (row.association_role ? row.association_role : undefined),
    dartBrand: row.dart_brand || 'TARGET 90%',
    dartWeight: row.preferred_dart_weight_g ? parseFloat(row.preferred_dart_weight_g) : 24,
    bestLeg: parseInt(row.best_leg_darts || '0', 10),
    nationalPoints: parseInt(row.national_points || '0', 10),
    nationalRank: row.national_rank ? parseInt(row.national_rank, 10) : undefined,
    mdqLeaguePoints: parseInt(row.mdq_league_points || '0', 10),
    mdqLeagueRank: row.mdq_league_rank ? parseInt(row.mdq_league_rank, 10) : undefined,
    presentialPoints: parseInt(row.presential_points || '0', 10),
    presentialRank: row.presential_rank ? parseInt(row.presential_rank, 10) : undefined,
    tournamentsWonList: [],
    recentHistory: [],
    status: row.status || 'ACTIVE'
  };
}

export async function getRegisteredPlayersServer(): Promise<UltimateDartsCardData[]> {
  try {
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
        s.overall_avg,
        s.first_9_avg,
        s.matches_played,
        s.matches_won,
        s.legs_played,
        s.legs_won,
        s.highest_checkout,
        s.count_180s,
        s.best_leg_darts
      FROM profiles p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN player_stats s ON p.user_id = s.user_id
      ORDER BY COALESCE(s.overall_avg, p.initial_estimated_avg) DESC;
    `;

    const result = await pool.query(query);
    if (result.rows && result.rows.length > 0) {
      return result.rows.map(mapDbRowToCard);
    }
    return CANONICAL_PLAYERS;
  } catch (error) {
    console.warn('[getRegisteredPlayersServer] Error al consultar Supabase:', error);
    return CANONICAL_PLAYERS;
  }
}
