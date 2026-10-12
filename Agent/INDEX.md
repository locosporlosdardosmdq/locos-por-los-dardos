# Índice del Proyecto • Locos por los Dardos Argentina & Darderos MDQ

## 📌 Resumen Ejecutivo
Plataforma integral deportiva, red social, gestor de torneos en vivo y tienda e-commerce para la comunidad de jugadores de dardos en Argentina. Diseñada como una Progressive Web App (PWA) de alto rendimiento, optimizada para móviles y escritorio con soporte offline, interfaz táctil y diseño deportivo oscuro.

- **Stack Principal:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Audio & Voz:** Web Speech API (síntesis de árbitro) + Web Audio API (efectos sintetizados) + HTML5 Audio.
- **Persistencia & Backend:** Node.js, Prisma ORM, esquema relacional PostgreSQL / Supabase, API Routes.
- **Pagos:** Mercado Pago API (Checkout Pro en Pesos Argentinos - ARS) y Webhooks IPN.
- **PWA:** Service Worker (`sw.js` v2) con estrategia Network-First para navegación HTML (garantizando sincronización de estilos en Vercel) y Web App Manifest (`manifest.json`).

---

## 🗺️ Mapa de Rutas y Módulos

### 1. Páginas Públicas y de Juego (`src/app/`)
* **`/` (Landing Page):** Banner promocional superior (Hero Torneos con countdown e inscripción rápida), presentación de la comunidad, accesos a los 4 módulos (Torneos, Anotador, Ranking, Jugadores), ranking previo y sedes destacadas.
* **`/anotador` (Anotador en Vivo estilo My Dart Training):** Marcador táctil para X01 (170, 301, 501, 701 con Single/Double/Master Out), Cricket (Classic y Scoring con marcas), soporte de micrófono y voz en vivo para hablar con el rival, Práctica vs Bot/CPU con 4 dificultades, tabla de cierre interactiva y árbitro de voz ("180", "Game shot").
* **`/anotador/camara-popout` (Segunda Pantalla / TV Pop-out Broadcast):** Ventana emergente desacoplada para setups de 2 monitores, proyectores o TV de club, con streaming de webcam a pantalla completa, captura de micrófono con cancelación de eco y banner televisivo estilo PDC (puntuaciones gigantes, sets/legs, AVG, turno activo y último dardo tirado vía `matchBroadcast`).
* **`/torneos` (Gestor de Torneos Oficial):** Visualización y actualización en vivo de llaves eliminatorias (Cuartos, Semis, Final), fase de grupos (Round Robin) y formulario de creación de torneos presenciales y online con configuración detallada por instancia de llave (Doble Eliminación, Solo Legs vs Sets + Legs).
* **`/ranking` (Ranking Nacional):** Leaderboard público con podio (Oro, Plata, Bronce) y filtros simultáneos por categoría y provincia de Argentina.
* **`/jugadores` (Directorio Federal de Jugadores):** Directorio de la comunidad con buscador por nombre/apodo/club, selector federal de provincias, categorización por AVG y desafío directo al anotador.
* **`/perfil` (Perfil & Registro):** Ficha deportiva del jugador con selector de provincias argentinas, slider de AVG con categorización automática en tiempo real y dashboard con métricas de rendimiento.
* **`/reglamento` (Reglamento Oficial, Código de Conducta & Fair Play):** Manual de 5 capítulos con especificaciones de montaje de diana (1.73m altura, 2.37m tiro), reglas 501/Cricket, sistema de puntos por modalidad (Individuales, Torneos de 1 Día, Ligas Locales, Liga Nacional x2), código de etiqueta, requerimientos técnicos de cámara online y protocolo arbitral de W.O. y desconexiones.
* **`/asociacion` (Órgano Institucional Oficial):** Sección oficial de las autoridades de La Asociación de Dardos Mar del Plata y Dardos Argentina, con fotos de perfil de jugador sincronizadas en vivo, cargos de Comisión Directiva, datos bancarios para transferencias de torneos y panel de gestión para ICEMAN.
* **`/superadmin` (Panel Central de Superadministración):** Panel exclusivo para Mariano Deux con 4 pestañas operativas: 1. Cuotas & Servidores (PostgreSQL Supabase, Storage, Vercel Edge, WebRTC TURN); 2. Demografía & Edades en vivo con Padrón de Jugadores y asignación de categorías; 3. Vitrinas de la Landing Page (Gran Torneo, Comunidad, Sedes, Pagos); 4. Comisión Directiva con asignación de jugadores registrados a puestos institucionales.
* **`/tienda` (E-Commerce Oficial):** Catálogo de productos (dardos 90% tungsteno, dianas sisal, plumas, cañas, cartucheras) preservado a nivel de código para lanzamiento posterior (oculto temporalmente de los menús).

### 2. Endpoints Backend (`src/app/api/`)
* **`GET & POST /api/jugadores`:** Lectura federada y persistencia de perfiles en PostgreSQL de Supabase. Conecta las tablas `profiles`, `users` y `player_stats`, permitiendo que los usuarios registrados en cualquier celular o PC se visualicen en tiempo real en el directorio federal y en los selectores de torneos.
* **`POST /api/auth`:** Endpoint de autenticación y recuperación de cuenta para inicio de sesión inmediato con 1-click por email o nickname.
* **`POST & GET /api/salas`:** Motor de gestión y sincronización en tiempo real de Salas Online 1 vs 1. Soporta acciones de creación (`CREATE`), unión (`JOIN`), envío de tiradas dardo a dardo (`THROW`) y sondeo periódico de estado con purga automática.
* **`POST /api/checkout/mercadopago`:** Generación de preferencias de pago en ARS para Checkout Pro con soporte para entorno de producción o simulación segura.
* **`POST /api/webhook/mercadopago`:** Handler de notificaciones IPN para actualización de estado de pagos de pedidos.

### 3. Componentes Principales (`src/components/`)
* **`BrandLogo.tsx`:** Lockup de marca oficial con **+25% de preponderancia visual** para Darderos Mar del Plata (`/logos/logo-mdq.png`) respecto a Dardos Argentina (`/logos/dardos-argentina.png`).
* **`layout/`:**
  * `AppSidebar.tsx`: Menú lateral hover-driven (sin botones manuales: colapsado en reposo a 80px y expandido automáticamente a 256px por `onMouseEnter`), con orden jerárquico activo (Torneos, Anotador, Ranking, Jugadores, Mi Perfil, Asociación).
  * `AppTopBar.tsx`: Barra superior limpia sin botones de colapso, con switch móvil, indicador de módulo, botón PWA e inicio rápido de anotación.
  * `AppBottomNav.tsx`: Barra de navegación inferior ergonómica para celulares con botón de tiro central elevado y acceso directo a Jugadores.
  * `AppShell.tsx`: Shell unificado con margen desktop fijo (`lg:pl-20`) para evitar saltos de pantalla (0 layout-shift) mientras el menú flota en hover.
* **`Navbar.tsx` & `Footer.tsx`:** Navegación responsive depurada, enlaces institucionales y federados, e información de clubes.
* **`jugadores/`:**
  * `PlayerDirectory.tsx`: Directorio federal con buscador en vivo, filtros combinados (Mayor AVG, Liga Argentina, Liga Marplatense y Presenciales MDQ) y fichas deportivas.
  * `UltimateDartsCard.tsx`: Cartas coleccionables estilo FIFA Ultimate Team con silueta de escudo Luke Littler, jerarquía de desempeño que prioriza Liga o Torneo, cápsula espaciosa Top 6 (#1 Campeón a #6 Puesto), bandera nacional, marcas de dardos, autoajuste tipográfico sin desbordes con formateo a primer nombre y apellido, y métrica "TOTAL 180s".
  * `PlayerDetailModal.tsx`: Modal interactivo de ficha deportiva completa con carta coleccionable, palmarés con copas de oro/plata/bronce, métricas avanzadas y selector de 4 pestañas de participación (Partidas Individuales, Torneos de un Día, Ligas Locales y Liga Nacional con badge ⚡x2 Pts) con badges de fechas Online y Presenciales en sede.
* **`anotador/`:**
  * `DartScorer.tsx`: Orquestador principal de partidas, selector de vistas (Settings -> Game Board -> Stats) y canal de broadcast en vivo.
  * `MatchGameSettings.tsx`: Pantalla de configuración previa para 501 y Cricket con asignación obligatoria e inmutable del Jugador 1 como el usuario logueado en la app (`[Tú (Logueado)]`), selector interactivo para el Jugador 2 entre la Comunidad Oficial de registrados, 4 niveles de Bot IA o invitado casual, y botón de acceso a Salas Online.
  * `OnlineRoomModal.tsx`: Modal para generación y conexión a Salas Online (1 vs 1) con generación de código aleatorio (`DART-XXXX`), enlace directo compartible, botón de invitación a WhatsApp con texto pre-armado y sondeo de conexión del rival en tiempo real.
  * `X01Board.tsx`: Tablero oficial de 501 con diseño de diana (fondo negro `#07090e`, presencia dominante de rojo diana `#ef4444`), teclado táctil de 5 columnas con atajos rápidos, cuadro central h-11 con Cierre Sugerido oficial in-place, sincronización remota continua vía `/api/salas`, panel de diana animada cuando lanza el rival y reproducción automática de los cantos de Russ Bray al impactar el tiro del oponente.
  * `CricketBoard.tsx`: Pizarra táctil interactiva de Cricket (Whiteboard View) con 5 columnas, marcas oficiales (`/`, `✕`, `⊗`), multiplicadores D y T, modos Default / Cut Throat / No Score y cálculo de MPR.
  * `MatchPdcStatsModal.tsx`: Modal oficial de estadísticas estándar PDC con comparativa lado a lado (Legs, 3 Darts AVG, First 9, 100+, 140+, 180s, High Finish, Best Leg, MPR).
  * `CheckoutGuide.tsx`: Guía interactiva de combinaciones para cierre en dobles y alerta de números bogey.
* **`torneos/`:**
  * `TournamentManager.tsx`: Orquestador principal de torneos con selector de 3 pestañas (Torneos Activos, Ligas & Posiciones, e Historial de Torneos con estadísticas consolidadas), soporte de 3 formatos (Eliminación Simple, Doble Eliminación [Winners, Losers & Gran Final] y Zonas de Liga), configuración detallada de legs por instancia estilo Nakka (cuartos, semis, finales, perdedores y gran final) y multiplicador x2 en presenciales.
  * `LeagueManager.tsx`: Gestor oficial de ligas y tabla de posiciones acumulada (PJ, Títulos, Podios, AVG 501, Pts) con selector entre Liga Nacional Oficial y Ligas Locales.
  * `CreateLeagueModal.tsx`: Formulario de creación de ligas locales y nacionales con sede, temporada y regla de puntos dobles.
  * `TournamentBracket.tsx`: Visor visual interactivo del cuadro eliminatorio con soporte para Eliminación Simple y Doble Eliminación con pestañas interactivas (Ver Todo, Ganadores por Arriba, Perdedores por Abajo, Gran Final), banderas de nacionalidad, estados de partida, partidas clickeables y administración.
  * `AdminMatchModal.tsx`: Modal exclusivo para Administradores Oficiales (ICEMAN) con edición manual de legs, avance por Walkover (W.O.) ante jugador ausente, aviso de cascada downstream y reseteo de partida a 0-0.
  * `TournamentPodiumView.tsx`: Podio oficial de premiación estilo Challonge con medallas (1º Oro, 2º Plata, 3º Bronce), desglose de premios en ARS y acceso a fichas deportivas.
  * `TournamentGroupStage.tsx`: Fase de grupos (Round Robin) con tabla de posiciones oficial (PJ, G, P, LF, LC, +/-, Pts) y cruces a playoffs.
  * `MatchDispatcherModal.tsx`: Menú contextual de lanzamiento de partido (Partida Online, Anotador en Vivo de Club, o Registrar Resultados).
  * `PlayerEnrollModal.tsx`: Modal de inscripción y acreditación de competidores con contraseña de participante y toggle de webcam.
  * `WebcamSetupModal.tsx`: Configuración de hardware de pista (cámara, micrófono, vúmetro de audio y soporte para celular como cámara de diana secundaria).
* **`comunidad/`:**
  * `TournamentHeroBanner.tsx`: Head banner promocional de torneos con modal de inscripción.
  * `NationalRankings.tsx`: Tabla de posiciones y podio con filtros provinciales conectado a la base de datos de jugadores en la nube (`fetchRegisteredPlayersFromCloud`).
  * `InvitePlayersModal.tsx`: Modal oficial para invitar a nuevos jugadores a registrarse en la plataforma, con enlace directo a `/perfil` (`https://locosporlosdardos.com.ar/perfil`), botón de envío directo por WhatsApp con texto deportivo pre-redactado, copiado de link y copiado de mensaje completo.
* **`perfil/`:**
  * `RegisterAndProfile.tsx`: Ficha deportiva del jugador con selector de nacionalidad y banderas internacionales (`COUNTRIES`), provincias argentinas, slider interactivo de AVG, categorización automática, botón de invitar por WhatsApp y dashboard de estadísticas.
  * `LoginModal.tsx`: Modal de acceso con Magic Link + OTP de 6 dígitos, tarjeta de último jugador del dispositivo y sanitización de avatares.
  * `OnboardingProfileModal.tsx`: Modal obligatorio de primer ingreso blindado con acceso administrativo protegido por clave maestra (`validateAdminCredentials`) exclusivo para el email oficial de Mariano Deux (`marianodeux@gmail.com`).
* **`layout/`:**
  * `AppSidebar.tsx`: Menú lateral hover-driven (80px colapsado / 256px expandido) con drawer móvil y footer de usuario con logout y perfil.
  * `InstallAppButton.tsx`: Componente de instalación PWA permanente en barra lateral con detección de standalone y modal táctil instructivo para iOS y Android.
  * `AppTopBar.tsx`: Barra superior con accesos contextuales.
  * `AppBottomNav.tsx`: Barra de navegación inferior táctil para smartphones.
  * `AppShell.tsx`: Envoltorio maestro del layout de la aplicación.
* **`tienda/`:**
  * `ProductCatalog.tsx`: Grilla de productos con buscador y selector de marcas/categorías.
  * `CartDrawer.tsx`: Drawer lateral deslizable de compras con checkout de Mercado Pago.

### 4. Capa de Datos y Modelos (`src/lib/` y `prisma/`)
* **`src/lib/server-players.ts`:** Helper de servidor para Server-Side Rendering (SSR) de jugadores federados desde Supabase PostgreSQL (`getRegisteredPlayersServer`). Garantiza que `/jugadores` cargue los 5 perfiles oficiales sin dependencia de fetch del cliente.
* **`src/lib/bracket-engine.ts`:** Motor matemático puro de torneos y llaves eliminatorias (Challonge & Nakka N01 Standard). Implementa `generateSingleElimination`, `generateDoubleElimination`, `reportResult`, `computePodium`, `resetMatchSafely`, `previewDownstreamImpact`, siembra matemática con Byes automáticos y enrutamiento determinista por punteros (`nextMatchId`, `nextSlot`, `loserNextMatchId`, `loserNextSlot`).
* **`src/lib/types.ts`:** Tipado TypeScript riguroso (PlayerProfile, TournamentBracketMatch con punteros, TournamentPodium, MatchConfig, etc.).
* **`src/lib/webrtc-room.ts`:** Módulo cliente WebRTC P2P con PeerJS para conexión directa, intercambio de tiradas dardo a dardo sin latencia, streaming de video/audio bidireccional y señalización `{ type: 'LEAVE' }` para apagado limpio de hardware.
* **`src/lib/online-rooms.ts`:** Gestor backend con normalización agresiva de códigos de sala (`normalizeRoomCode`) y ciclo de vida de salas remotas (`createOnlineRoom`, `joinOnlineRoom`, `submitRoomThrow`, `getOnlineRoom`).
* **`src/lib/constants.ts`:** Provincias de Argentina, checkout guide, categorización por AVG, validación de credenciales maestras de administrador y datasets de la comunidad.
* **`src/lib/storage.ts`:** Persistencia offline-first con localStorage/IndexedDB y cola de sincronización.
* **`src/lib/broadcast.ts`:** Canal de transmisión broadcast en tiempo real (BroadcastChannel API + storage sync) para marcadores de pista.
* **`src/lib/sound-effects.ts`:** Motor de audio Web Audio API + Web Speech API.
* **`src/lib/db-schema.sql`:** DDL en PostgreSQL / Supabase con enums, índices y funciones PL/pgSQL.
* **`prisma/schema.prisma`:** Esquema declarativo de Prisma ORM.

---

## ☁️ Infraestructura & Configuración Supabase (Dashboard 2025/2026)
- **ID de Proyecto (Ref):** `pufyeabrvrlikbgkjplz`
- **Ubicación de Database Settings:** En la interfaz moderna, la base de datos se administra desde el 4º ícono (cilindro) en la barra lateral izquierda o directamente vía `/database/settings#database-password`.
- **Botón `Connect`:** Ubicado en la barra superior del Dashboard para obtener directamente las cadenas de conexión:
  - `DATABASE_URL` (puerto 6543, transaction pooler con `?pgbouncer=true` para Vercel Serverless).
  - `DIRECT_URL` (puerto 5432, session pooler para migraciones directas de Prisma).
