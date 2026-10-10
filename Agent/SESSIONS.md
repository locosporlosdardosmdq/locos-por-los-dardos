# Bitácora de Sesiones • Locos por los Dardos

## [Sesión 6] - 2026-10-10
- **Objetivo:** Integración de la voz de Clemens Kuntze (`Recursos/Clemens Kuntze.mp3`) en el motor de audio del Anotador oficial de partidas de dardos para cantar los tantos del 1 al 180 con modulación emocional precisa.
- **Realizado:**
  - Copia e integración del sample oficial de alta fidelidad `Recursos/Clemens Kuntze.mp3` en `public/sounds/clemens-kuntze.mp3`.
  - Implementación en `src/lib/sound-effects.ts` del motor de audio híbrido (`SoundEngine.playClemens180()` y `VoiceCaller.announceScore()`):
    * **Tantos < 20 (Muy pesimista):** Pitch 0.65, Rate 0.82 (tono grave, apagado y desganado; ej: "Sin puntuación...", "7...").
    * **Tantos 21 a 59 (Normal):** Pitch 1.0, Rate 1.0 (entonación arbitral clara y neutra).
    * **Tantos 60 a 89 (Con énfasis):** Pitch 1.15, Rate 1.1 (entonación enérgica y firme).
    * **Tantos 90 a 119 (Con más énfasis):** Pitch 1.25, Rate 1.18 (locución acelerada con impacto).
    * **Tantos 120 a 169 (Con mucho énfasis):** Pitch 1.35, Rate 1.25 (grito eufórico de visita alta).
    * **Tantos 170 a 180 (Audio Original de Clemens Kuntze):** Disparo directo del audio original `clemens-kuntze.mp3` para tiros cumbre y 180 perfecto.
  - Validación en navegador (`http://localhost:3000/anotador`) dardo a dardo en tiempo real: comprobados lanzamientos en las 5 bandas (7, 45, 85, 140 y 180) con subagente de navegación y grabación de video/capturas.
  - Verificación de compilación TypeScript (`npx tsc --noEmit`) con 0 errores y registro de decisión técnica ADR-012 en `Agent/DECISIONS.md`.
- **Estado del Proyecto:** Anotador equipado con locución profesional inmersiva, 100% offline, cero latencia y audio auténtico de Clemens Kuntze.
- **Próximos pasos:**
  1. Exportación de cuadros de torneo a PDF / PNG imprimible para la cartelera del club.
  2. Algoritmo de sorteo automatizado de cabezas de serie (*seeding*) según el ranking nacional.

---

## [Sesión 5] - 2026-10-10
- **Objetivo:** Desarrollo e integración del Módulo de Torneos Avanzado conectado en caliente con el Anotador Oficial, Despachador de Partidas (*Match Dispatcher*), Acreditación con contraseña y hardware de pista (Webcam y segundo dispositivo celular).
- **Realizado:**
  - Creación de `MatchDispatcherModal.tsx`: Menú contextual de lanzamiento de partidos desde cualquier celda del fixture (Online, Live presencial en el club, o Carga Rápida de resultados).
  - Conexión del fixture (Grupos y Brackets) con `DartScorer.tsx`: al lanzar un partido en vivo, se abre el Anotador en pantalla completa para el oche asignado y al finalizar el juego avanza automáticamente al ganador en la llave o en la tabla de posiciones.
  - Creación de `TournamentGroupStage.tsx`: Fase de grupos (Round Robin) con tabla oficial de posiciones (PJ, G, P, LF, LC, +/- Dif, Pts) y cruces interactivos hacia la fase eliminatoria.
  - Creación de `PlayerEnrollModal.tsx`: Acreditación de competidores con contraseña de participante y validación de webcam.
  - Creación de `WebcamSetupModal.tsx`: Configuración de hardware de pista con WebRTC, auto-zoom al tiro del rival, vúmetro de audio y soporte para conectar el celular vía QR como cámara de diana remota.
  - Actualización de `TournamentBracket.tsx` y `TournamentManager.tsx` con la paleta de la diana (fondo `#07090e`, rojo `#ef4444`, verde `#00e676`) y pestaña para pantalla TV/proyector del club (`LIVE_BOARD`).
  - Validación con compilación TypeScript 100% limpia (`0 errores`) y pruebas en navegador.
- **Estado del Proyecto:** Ecosistema completo de Torneos y Anotador plenamente funcional y conectado.
- **Próximos pasos:**
  1. Generación de PDF / PNG imprimible de los cuadros para la cartelera física del club.
  2. Automatización del sorteo de cabezas de serie según el ranking federal.

---

## [Sesión 4] - 2026-10-10
- **Objetivo:** Retorno estricto a la estética de alto contraste de la primera captura (fondo negro `#07090e`, textos blancos nítidos, acentos neón `#00e676`), arquitectura de navegación con Menú Lateral Colapsable (`AppSidebar`), y definición de la jerarquía modular de 6 secciones con creación del módulo `/jugadores`.
- **Realizado:**
  - Redefinición cromática: Reemplazo del fondo gris por negro profundo (`#07090e`), tarjetas en `#0f1422` y bordes `#1e2638`. Eliminación de matices marfil/sisal opacos en textos reemplazándolos por blanco puro `#ffffff` y puntuaciones gigantes de alto contraste para máxima visibilidad en el oche.
  - Implementación del Menú Lateral Colapsable: Creados `AppSidebar.tsx`, `AppTopBar.tsx` y `AppShell.tsx`. Configuración de los 6 módulos en el orden exacto solicitado (1. Tienda Online, 2. Torneos Nakka, 3. Anotador, 4. Ranking, 5. Jugadores, 6. Configuración / Mi Perfil) con badges distintivos, memoria de estado en `localStorage` y drawer para dispositivos móviles.
  - Creación del Módulo Jugadores: Implementados `src/components/jugadores/PlayerDirectory.tsx` y la ruta `src/app/jugadores/page.tsx` con buscador en tiempo real, selector federal de provincias, filtros por categoría de AVG y botón de reto directo al Anotador.
  - Alineación de diseño en `DartScorer.tsx`, `DartKeypad.tsx`, `NationalRankings.tsx` y `TournamentManager.tsx` para coincidir pixel-perfect con la primera captura de referencia.
  - Verificación de compilación de producción con Next.js 15 (`npm run build`).
  - Diagnóstico y resolución de colisión de Webpack & Service Worker:
    * Causa raíz de pantalla sin estilos y lentitud: ejecución concurrente de `npm run build` mientras `next dev` estaba activo, lo que corrompió el bundle de CSS (`layout.css` 404). Además, el Service Worker en `localhost` interceptaba peticiones de desarrollo y las congelaba.
    * Solución: purga completa de `.next`, reinicio limpio del dev server daemon, bypass de caché para `/_next/` en `public/sw.js`, desregistración del Service Worker en `providers.tsx` durante desarrollo y activación de `prefetch={true}` en los enlaces del Sidebar para transiciones instantáneas (<300ms).
  - Soberanía de Marca e Identidad Propia:
    * Erradicación completa de cualquier mención a "Nakka", "Nakka01" y "n01" en la UI, layout, páginas, esquemas y textos (ahora: "Gestor de Torneos Oficial" y "Cuadros en Vivo").
  - Adaptabilidad Responsiva Total (PC y Celulares):
    * En PC: Eliminación total de botones manuales de colapso. La expansión y repliegue del menú está gobernada 100% por el *hover* del mouse (`onMouseEnter` expande a 256px y `onMouseLeave` colapsa a 80px), manteniendo el layout principal fijo y estable (0 layout shift).
    * En Celulares: Implementación de `AppBottomNav.tsx` con 5 accesos táctiles y botón de Anotador central elevado (`#00e676`), dejando la pantalla limpia y operable con una sola mano sin invadir el área de juego.
- **Estado del Proyecto:** Identidad 100% propia y soberana, menú lateral hover-driven en PC sin botones manuales, navegación táctil inferior en celulares, CSS plenamente operativo (HTTP 200) y servidor dev activo en `http://localhost:3000`.
- **Próximos pasos:**
  1. Desarrollo a fondo del motor de competición y llaves del Módulo Torneos Oficial.

---

## [Sesión 3] - 2026-10-10
- **Objetivo:** Redefinición integral del sistema de diseño basado en la diana de dardos (Samurai 4) con fondo gris oscuro, persistencia offline-first y transmisión de partidas en vivo (Live Broadcast).
- **Realizado:**
  - Rediseño de toda la paleta cromática en `tailwind.config.ts` y `globals.css` utilizando los colores exactos de la diana Samurai 4: Gris Oscuro (`#14161f` / `#1c1f2b`), Verde Diana (`#00b853`), Rojo Bullseye (`#e52521`), Azul Samurai (`#1d68ed`) y Sisal natural (`#efe7d8`).
  - Actualización completa de todos los módulos (`BrandLogo`, `Navbar`, `Footer`, `DartKeypad`, `CheckoutGuide`, `DartScorer`, `TournamentHeroBanner`, `NationalRankings`, `TournamentBracket`, `TournamentManager`, `RegisterAndProfile`, `ProductCatalog`, `CartDrawer` y páginas del App Router).
  - Creación de `src/lib/storage.ts`: persistencia local offline-first para guardar partidas completadas y cola de sincronización remota (`SyncItem`).
  - Creación de `src/lib/broadcast.ts`: canal en tiempo real mediante `BroadcastChannel API` que conecta el Oche (`DartScorer`) con una nueva pestaña interactiva "Tablero en Vivo" en el Gestor de Torneos (`TournamentManager`).
  - Validación de compilación limpia de producción (`npm run build`) en Next.js 15 con 0 errores de tipado o linting.
  - Resolución de colisión de caché de servidor de desarrollo: purga de `.next`, reinicio limpio de `next dev` con respuesta HTTP 200 y fijación de dimensiones estrictas en [BrandLogo.tsx](file:///d:/Locos%20por%20los%20dardos/src/components/BrandLogo.tsx) para prevenir desbordes de imagen.
  - Registro de cambios y documentación en `Agent/INDEX.md`, `Agent/TODO.md`, `Agent/DECISIONS.md` y `Agent/SESSIONS.md`.
- **Estado del Proyecto:** La plataforma cuenta con una estética deportiva de élite inspirada fielmente en la diana Samurai 4, fondo gris oscuro, soporte offline y espejo de pista en vivo en tiempo real para torneos. Servidor de desarrollo corriendo de forma óptima en `http://localhost:3000`.
- **Próximos pasos:**
  1. Conexión de autenticación de usuarios y perfiles persistentes en base de datos.
  2. Automatización del sorteo de emparejamientos y cabezas de serie en torneos.

## [Sesión 3] - 2026-10-10
- **Objetivo:** Rediseño integral y profesional del Anotador Oficial en Vivo (501 + Cricket) conforme a las especificaciones y capturas del usuario: estética de la diana (fondo negro `#07090e`, presencia protagónica de rojo diana `#ef4444` y verde diana `#00e676`), teclado táctil de 5 columnas, soporte por parejas (2 vs 2), pizarra de Cricket Whiteboard View y modal de estadísticas oficiales estándar PDC.
- **Realizado:**
  - Creación de `MatchGameSettings.tsx`: Pantalla de configuración previa para 501 y Cricket con selección de jugadores registrados en la app, soporte para modalidad de parejas (2 vs 2 con rotación de 4 turnos), distancia en legs/sets y reglas de cierre.
  - Creación de `X01Board.tsx`: Tablero de juego interactivo de 501 idéntico a las capturas, con teclado táctil ergonómico de 5 columnas (`26, 41, 45, CLR` a la izquierda, `1..9, 0` al centro, y `60, 85, 100, no Score` a la derecha), marcadores gigantes de puntaje restante, AVG, First 9, barra central S/L y checkout guide interactiva.
  - Creación de `CricketBoard.tsx`: Pizarra táctil de Cricket (Whiteboard View) de 5 columnas con los 7 sectores (`20, 19, 18, 17, 16, 15, Bull`), botones D y T, simbología oficial (`/`, `✕`, `⊗`), modos Default / Cut Throat / No Score y cálculo dinámico de MPR.
  - Creación de `MatchPdcStatsModal.tsx`: Modal oficial de estadísticas comparativas PDC (Legs, 3-Darts AVG, First 9, 100+, 140+, 180s, High Finish, Best Leg, MPR).
  - Refactorización de `DartScorer.tsx` como orquestador desacoplado preservando persistencia local y broadcast de pista.
  - Validación de compilación TypeScript (`npx tsc --noEmit`) con 0 errores y prueba interactiva completa en navegador con subagente.
- **Estado del Proyecto:** Anotador 100% operativo, probado y alineado con los estándares del circuito competitivo. Listo para continuar con la integración en caliente del módulo de Torneos y Partidas.
- **Próximos pasos recomendados:**
  1. Conexión del fixture de Torneos (Grupos y Brackets) con el Anotador mediante despacho de partidos (*Online*, *Live Presencial en el Club*, o *Carga Rápida*).
  2. Implementación de hardware de pista (cámara web / segundo dispositivo celular para enfocar la diana).

---

## [Sesión 2] - 2026-10-10
- **Objetivo:** Auditoría de arquitectura, sincronización del protocolo de agentes (`AGENTS.md`) y definición de próximos pasos técnicos y estratégicos del proyecto.
- **Realizado:**
  - Lectura exhaustiva de directivas en `AGENTS.md` (pensamiento crítico obligatorio, protocolo de lectura de bitácora y políticas de ramas git).
  - Actualización integral de la documentación del sistema en `Agent/INDEX.md`, `Agent/DECISIONS.md`, `Agent/TODO.md` y `Agent/SESSIONS.md`.
  - Análisis del estado actual del código: 5 módulos centrales desarrollados y operativos (Perfil/AVG, Anotador táctil con voz, Torneos Nakka, Landing comunitaria y Tienda Mercado Pago).
  - Validación de compilación de producción Next.js 15 sin errores y pruebas funcionales de endpoints.
- **Estado del Proyecto:** Plataforma completamente navegable en entorno local (`http://localhost:3000`), lista para la fase de persistencia en base de datos real (Supabase/PostgreSQL) y sincronización de partidas en vivo.
- **Próximos pasos recomendados:**
  1. Conexión de persistencia real con base de datos (Supabase Client + Migraciones).
  2. Implementación de WebSockets / Supabase Realtime para que los partidos de torneos se reflejen en vivo en las pantallas de todos los espectadores.
  3. Configuración del flujo de control de versiones con Git (inicialización y rama `dev`).

---

## [Sesión 1] - 2026-10-10
- **Objetivo:** Inicialización del proyecto, diseño de arquitectura de software y desarrollo de la base funcional de la plataforma PWA para la comunidad de dardos en Argentina.
- **Realizado:**
  - Creación del proyecto Next.js 15 con TypeScript y Tailwind CSS deportivo oscuro.
  - Implementación de branding con +25% de preponderancia para Darderos Mar del Plata.
  - Desarrollo de los 5 módulos funcionales solicitados y endpoints de Mercado Pago ARS.
  - Generación de esquemas relacionales `db-schema.sql` y `prisma/schema.prisma`.
