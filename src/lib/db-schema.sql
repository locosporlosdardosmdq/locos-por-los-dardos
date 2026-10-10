-- ============================================================================
-- PLATAFORMA "LOCOS POR LOS DARDOS ARGENTINA" & "DARDEROS MAR DEL PLATA"
-- PostgreSQL / Supabase Relational Database Schema
-- Optimizado para PWA, Torneos en Vivo, Estadísticas de Dardos y E-commerce Mercado Pago
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('PLAYER', 'ORGANIZER', 'ADMIN');
CREATE TYPE player_category AS ENUM ('PRINCIPIANTE', 'INTERMEDIA', 'AVANZADA', 'ELITE');
CREATE TYPE match_game_type AS ENUM ('X01', 'CRICKET', 'ROUND_THE_CLOCK', 'HALVE_IT');
CREATE TYPE out_mode_type AS ENUM ('SINGLE_OUT', 'DOUBLE_OUT', 'MASTER_OUT');
CREATE TYPE tournament_type_enum AS ENUM ('PRESENCIAL', 'ONLINE');
CREATE TYPE tournament_format_enum AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'HYBRID');
CREATE TYPE tournament_status_enum AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE product_category_enum AS ENUM ('DARDOS', 'PLUMAS', 'CANAS', 'CARTUCHERAS', 'DIANAS', 'ACCESORIOS');
CREATE TYPE order_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED');

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'PLAYER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    province VARCHAR(100) NOT NULL, -- ej: "Buenos Aires", "Córdoba", "Santa Fe"
    city VARCHAR(100) NOT NULL,     -- ej: "Mar del Plata", "Rosario", "CABA"
    avatar_url TEXT DEFAULT '/logos/logo-mdq.png',
    initial_estimated_avg NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    category player_category NOT NULL DEFAULT 'PRINCIPIANTE',
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    preferred_dart_weight_g NUMERIC(4, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DETAILED PLAYER METRICS & STATS
CREATE TABLE IF NOT EXISTS player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_avg NUMERIC(5, 2) DEFAULT 0.00,
    first_9_avg NUMERIC(5, 2) DEFAULT 0.00,
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    legs_played INT DEFAULT 0,
    legs_won INT DEFAULT 0,
    highest_checkout INT DEFAULT 0,
    checkout_attempts INT DEFAULT 0,
    checkout_hits INT DEFAULT 0,
    checkout_percentage NUMERIC(5, 2) DEFAULT 0.00,
    count_180s INT DEFAULT 0,
    count_140_plus INT DEFAULT 0,
    count_100_plus INT DEFAULT 0,
    count_60_plus INT DEFAULT 0,
    best_leg_darts INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATCHES & LIVE SCORING
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID, -- Opcional, si pertenece a un torneo
    game_type match_game_type DEFAULT 'X01',
    starting_score INT DEFAULT 501,
    out_mode out_mode_type DEFAULT 'DOUBLE_OUT',
    best_of_legs INT DEFAULT 5,
    is_vs_cpu BOOLEAN DEFAULT FALSE,
    cpu_difficulty VARCHAR(30), -- 'BEGINNER', 'MEDIUM', 'ADVANCED', 'PRO'
    status VARCHAR(30) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
    winner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS match_participants (
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_order INT NOT NULL, -- 1 o 2
    final_avg NUMERIC(5, 2) DEFAULT 0.00,
    legs_won INT DEFAULT 0,
    highest_checkout INT DEFAULT 0,
    count_180s INT DEFAULT 0,
    PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS match_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    leg_number INT NOT NULL,
    winner_id UUID REFERENCES users(id),
    darts_thrown INT DEFAULT 0,
    final_checkout INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dart_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leg_id UUID NOT NULL REFERENCES match_legs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    round_number INT NOT NULL,
    dart_1 VARCHAR(10), -- ej: 'T20', 'S20', 'D10', 'BULL', '25', 'MISS'
    dart_2 VARCHAR(10),
    dart_3 VARCHAR(10),
    visit_score INT NOT NULL,
    is_bust BOOLEAN DEFAULT FALSE,
    remaining_score INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TOURNAMENTS (ESTILO NAKKA N01)
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    tournament_type tournament_type_enum DEFAULT 'PRESENCIAL',
    format tournament_format_enum DEFAULT 'SINGLE_ELIMINATION',
    starting_score INT DEFAULT 501,
    out_mode out_mode_type DEFAULT 'DOUBLE_OUT',
    best_of_legs INT DEFAULT 5,
    max_participants INT DEFAULT 32,
    venue_name VARCHAR(150),
    city VARCHAR(100) DEFAULT 'Mar del Plata',
    province VARCHAR(100) DEFAULT 'Buenos Aires',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status tournament_status_enum DEFAULT 'REGISTRATION_OPEN',
    banner_image_url TEXT,
    entry_fee_ars NUMERIC(10, 2) DEFAULT 0.00,
    prize_pool_ars NUMERIC(10, 2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seed_number INT,
    group_name VARCHAR(10), -- 'Grupo A', 'Grupo B' para Round Robin
    is_paid BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_bracket_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INT NOT NULL,     -- 1 = Dieciseisavos, 2 = Octavos, 3 = Cuartos, 4 = Semis, 5 = Final
    match_position INT NOT NULL,   -- 1, 2, 3...
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    winner_id UUID REFERENCES users(id),
    score_p1 INT DEFAULT 0,
    score_p2 INT DEFAULT 0,
    live_match_id UUID REFERENCES matches(id),
    status VARCHAR(30) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'LIVE', 'FINISHED'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. E-COMMERCE & MERCADO PAGO INTEGRATION
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL, -- 'Winmau', 'Target', 'Harrows', 'Red Dragon'
    category product_category_enum NOT NULL,
    price_ars NUMERIC(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    weight_grams NUMERIC(4, 1),
    material VARCHAR(100),       -- '90% Tungsteno', 'Aluminio', 'Policarbonato'
    image_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20),
    total_amount_ars NUMERIC(12, 2) NOT NULL,
    payment_status order_status_enum DEFAULT 'PENDING',
    mercadopago_preference_id VARCHAR(200),
    mercadopago_payment_id VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price_ars NUMERIC(12, 2) NOT NULL
);

-- INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON profiles(province);
CREATE INDEX IF NOT EXISTS idx_player_stats_avg ON player_stats(overall_avg DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);

-- FUNCTION FOR AUTOMATIC CATEGORY ASSIGNMENT BY AVG
CREATE OR REPLACE FUNCTION calculate_player_category(avg_score NUMERIC)
RETURNS player_category AS $$
BEGIN
    IF avg_score >= 70.00 THEN
        RETURN 'ELITE';
    ELSIF avg_score >= 55.00 THEN
        RETURN 'AVANZADA';
    ELSIF avg_score >= 40.00 THEN
        RETURN 'INTERMEDIA';
    ELSE
        RETURN 'PRINCIPIANTE';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
