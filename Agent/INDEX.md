# Índice del Proyecto • Locos por los Dardos Argentina & Darderos MDQ

## 📌 Resumen Ejecutivo
Plataforma integral deportiva, red social, gestor de torneos en vivo y tienda e-commerce para la comunidad de jugadores de dardos en Argentina. Diseñada como una Progressive Web App (PWA) de alto rendimiento, optimizada para móviles y escritorio con soporte offline, interfaz táctil y diseño deportivo oscuro.

- **Stack Principal:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Audio & Voz:** Web Speech API (síntesis de árbitro) + Web Audio API (efectos sintetizados) + HTML5 Audio.
- **Persistencia & Backend:** Node.js, Prisma ORM, esquema relacional PostgreSQL / Supabase, API Routes.
- **Pagos:** Mercado Pago API (Checkout Pro en Pesos Argentinos - ARS) y Webhooks IPN.
- **PWA:** Service Worker (`sw.js`) con estrategia stale-while-revalidate y Web App Manifest (`manifest.json`).

---

## 🗺️ Mapa de Rutas y Módulos

### 1. Páginas Públicas y de Juego (`src/app/`)
* **`/` (Landing Page):** Banner promocional superior (Hero Torneos con countdown e inscripción rápida), presentación de la comunidad, accesos a los 4 módulos, ranking previo y sedes destacadas.
* **`/anotador` (Anotador en Vivo estilo My Dart Training):** Marcador táctil para X01 (170, 301, 501, 701 con Single/Double/Master Out), Cricket (Classic y Scoring con marcas), Práctica vs Bot/CPU con 4 dificultades, tabla de cierre interactiva y árbitro de voz ("180", "Game shot").
* **`/torneos` (Gestor de Torneos estilo Nakka n01):** Visualización y actualización en vivo de llaves eliminatorias (Cuartos, Semis, Final), fase de grupos (Round Robin) y formulario de creación de torneos presenciales y online.
* **`/ranking` (Ranking Nacional):** Leaderboard público con podio (Oro, Plata, Bronce) y filtros simultáneos por categoría y provincia de Argentina.
* **`/perfil` (Perfil & Registro):** Ficha deportiva del jugador con selector de provincias argentinas, slider de AVG con categorización automática en tiempo real y dashboard con métricas de rendimiento.
* **`/tienda` (E-Commerce Oficial):** Catálogo de productos (dardos 90% tungsteno, dianas sisal, plumas, cañas, cartucheras) con filtros por categoría y marca, y carrito de compras desplegable.

### 2. Endpoints Backend (`src/app/api/`)
* **`POST /api/checkout/mercadopago`:** Generación de preferencias de pago en ARS para Checkout Pro con soporte para entorno de producción o simulación segura.
* **`POST /api/webhook/mercadopago`:** Handler de notificaciones IPN para actualización de estado de pagos de pedidos.

### 3. Componentes Principales (`src/components/`)
* **`BrandLogo.tsx`:** Lockup de marca oficial con **+25% de preponderancia visual** para Darderos Mar del Plata (`/logos/logo-mdq.png`) respecto a Dardos Argentina (`/logos/dardos-argentina.png`).
* **`Navbar.tsx` & `Footer.tsx`:** Navegación responsive, contador dinámico de carrito, botón de instalación PWA e información de clubes.
* **`anotador/`:**
  * `DartScorer.tsx`: Tablero digital central, lógica de X01/Cricket/CPU, promedio global y First 9.
  * `DartKeypad.tsx`: Teclado táctil dual (Puntuación Total vs Dardo x Dardo con multiplicadores).
  * `CheckoutGuide.tsx`: Guía interactiva de combinaciones para cierre en dobles y alerta de números bogey.
* **`torneos/`:**
  * `TournamentManager.tsx`: Administrador de torneos, pestañas de llaves, grupos e inscriptos.
  * `TournamentBracket.tsx`: Visor visual de brackets con actualización en vivo de resultados.
* **`comunidad/`:**
  * `TournamentHeroBanner.tsx`: Head banner promocional de torneos con modal de inscripción.
  * `NationalRankings.tsx`: Tabla de posiciones y podio con filtros provinciales.
* **`perfil/`:**
  * `RegisterAndProfile.tsx`: Formulario de registro, slider interactivo de AVG y dashboard de stats.
* **`tienda/`:**
  * `ProductCatalog.tsx`: Grilla de productos con buscador y selector de marcas/categorías.
  * `CartDrawer.tsx`: Drawer lateral deslizable de compras con checkout de Mercado Pago.

### 4. Capa de Datos y Modelos (`src/lib/` y `prisma/`)
* **`src/lib/types.ts`:** Tipado TypeScript riguroso (PlayerProfile, MatchConfig, DartThrow, Tournament, Product, etc.).
* **`src/lib/constants.ts`:** Provincias de Argentina, checkout guide, categorización por AVG y datasets mock.
* **`src/lib/sound-effects.ts`:** Motor de audio Web Audio API + Web Speech API.
* **`src/lib/db-schema.sql`:** DDL en PostgreSQL / Supabase con enums, índices y funciones PL/pgSQL.
* **`prisma/schema.prisma`:** Esquema declarativo de Prisma ORM.
