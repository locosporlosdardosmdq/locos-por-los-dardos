# Tareas del Proyecto (TODO) • Locos por los Dardos

## 🏆 Tareas Completadas
- [x] **WebRTC Bidireccional Puro, Modal de Cámara Rival en PC y Desbloqueo de Audio:**
  * Reparación de la transmisión de cámara entre PC y celulares en `webrtc-room.ts`: llamadas independientes salientes/entrantes, captura de `call.peer`, señalización `STREAM_READY` y registro inmediato de `setActiveWebRtcHandler` para el Guest.
  * Auto-Healing de WebRTC en `X01Board.tsx` que detecta salas online sin conexión y las levanta automáticamente reconectando y enviando el stream local.
  * Solución a la congelación de video por Autoplay: añadido `muted={true}` en `<video ref={remoteVideoRef}>` para visualización garantizada en Android y Chrome PC.
  * Reparación de audio WebRTC: reubicación de `<audio ref={remoteAudioRef}>` con estilos fijos fuera de pantalla (`top: -9999px`) erradicando `display: none` que congelaba el audio en navegadores móviles.
  * Desbloqueo universal de audio HTML5 y Web Audio API (`unlockAudio()`) en el primer toque de usuario para garantizar locución de Russ Bray sin bloqueo.
  * Modal Emergente de Diana del Contrincante (`showRivalModal`) en PC y segunda pantalla con Picture-in-Picture nativo (`handleTogglePiP`), marcador en vivo y botón de reconexión directa.
  * Bypassing de caché en `/api/jugadores` (`force-dynamic`, `revalidate = 0`, `no-store`) y botón "Actualizar" en `PlayerDirectory.tsx` para sincronización inmediata de nuevos jugadores registrados (ej. Juli).
- [x] **Fase 0 de Estabilización Técnica (Auditoría `AUDITORIA.MD`):**
  * Resolución de la causa raíz de conexión a Supabase: auto-corrección de región de pooler hacia `aws-0-us-east-1` (puerto 6543) eliminando el error `(ENOTFOUND) tenant/user postgres.pufyeabrvrlikbgkjplz not found`.
  * Endpoint de diagnóstico en vivo `/api/health/db` con medición de latencia a PostgreSQL.
  * Respuestas defensivas en `/api/auth` (sin exponer datos del pooler ni el usuario de BD a los teléfonos celulares).
  * Endpoint `PATCH /api/jugadores` y cláusula `COALESCE` en queries SQL para evitar que editar una categoría borre el teléfono, bio o dardos del jugador.
  * Persistencia de "Último Jugador del Dispositivo" (`lpld_last_player_v1`) y cuentas recientes preservadas al cerrar sesión.
  * Modal de Login (`LoginModal.tsx`) con tarjeta destacada para continuar con el último jugador del equipo con un solo click.
  * Botón de Instalación PWA en Celulares (`InstallAppButton.tsx`) visible de forma permanente en la barra lateral con guía interactiva para iPhone (Safari) y Android.
  * Saneamiento de `public/manifest.json` y sanitización de secretos en la documentación.
- [x] **Fase 1: Autenticación Passwordless Híbrida (Magic Link + OTP 6 Dígitos):**
  * Integración de `@supabase/supabase-js` con `createClient` singleton en `src/lib/supabase.ts`.
  * Envío y verificación de código OTP in-app (`signInWithOtp`, `verifyOtp`) para que los jugadores no tengan que salirse de la PWA en celulares.
  * Ruta de callback con intercambio de sesión `/auth/callback`.
- [x] **Fase 2: Motor Puro de Torneos y Ligas (Challonge & Nakka N01 Tournament Standard):**
  * Motor matemático inmutable en `src/lib/bracket-engine.ts` (`generateSingleElimination`, `generateDoubleElimination`, `reportResult`, `computePodium`, `resetMatchSafely`, `previewDownstreamImpact`).
  * Enrutamiento determinista por punteros (`nextMatchId`, `nextSlot`, `loserNextMatchId`, `loserNextSlot`) eliminando dependencias de heurísticas rígidas.
  * Soporte de Byes automáticos y siembra matemática para cuadros de 4, 8, 16, 32 y 64 participantes.
  * Componente de Podio Oficial de Premiación (`TournamentPodiumView.tsx`) con 1º Oro, 2º Plata y 3º Bronce, medallas, montos de premios y enlaces a fichas.
  * Panel de Superadministrador ICEMAN (`AdminMatchModal.tsx`) con advertencia visual de impacto en cascada downstream y reseteo seguro.
  * Integración en caliente en `TournamentManager.tsx` y `TournamentBracket.tsx` para torneos activos e históricos.
- [x] Configuración inicial del proyecto con Next.js 15, TypeScript y Tailwind CSS.
- [x] Implementación de PWA con Web App Manifest (`manifest.json`) y Service Worker (`sw.js`).
- [x] Identidad de marca unificada con +25% de preponderancia para Darderos Mar del Plata (`BrandLogo.tsx`).
- [x] Módulo 1: Formulario de Registro y Perfil con estimación de AVG y categorización automática (Principiante, Intermedia, Avanzada, Elite) en tiempo real.
- [x] Módulo 2: Anotador en Vivo táctil (My Dart Training) con X01, Cricket, Bot AI, Checkout Guide interactiva y Referee de voz.
- [x] Módulo 3: Gestor de Torneos Oficial con llaves eliminatorias en vivo y fase de grupos (Round Robin).
- [x] Módulo 4: Landing Page comunitaria con Head Banner promocional superior (Hero Torneos) y Leaderboard público.
- [x] Módulo 5: E-commerce integrado con catálogo, carrito lateral (`CartDrawer`) y API de Mercado Pago en ARS.
- [x] **Doble Diana Split-Screen en Vivo (Estilo Nakka N01) & WebRTC TURN TCP 443:**
  * Implementación de streaming de video P2P bidireccional entre celulares en red 4G y PCs mediante servidores TURN de OpenRelay en puerto TCP 443.
  * Panel de Doble Diana simétrica en `X01Board.tsx` mostrando en tiempo real la diana local y la diana del rival con estados de tiro, badges y halos luminosos.
  * Locución garantizada de Russ Bray para ambos jugadores al impactar cada visita.
  * Fondo de la comunidad con `Darderos.jpeg` en la landing page (`src/app/page.tsx`) y cuadros interiores al 90% de transparencia.
- [x] **Persistencia en la Nube con Supabase PostgreSQL & Directorio Federal Dinámico:**
  * Implementación de conexión directa con SSL a PostgreSQL de Supabase en `src/lib/db.ts` con pool de conexiones.
  * Endpoints `/api/jugadores` (GET y POST) con JOIN de `profiles`, `users` y `player_stats`, permitiendo que todos los usuarios registrados en cualquier celular o PC aparezcan inmediatamente en el directorio federado.
  * Endpoint `/api/auth` para autenticación y recuperación de perfiles por email o nickname.
  * Sincronización asíncrona automática en `storage.ts` que persiste en `localStorage` y en la nube en segundo plano.
- [x] **Selección y Cambio Táctil 1-Click de Categoría Oficial (`RegisterAndProfile.tsx`):**
  * Esquema de Categorías Oficiales completamente interactivo: las 4 tarjetas (Principiante, Intermedia, Avanzada, Elite Pro) son botones táctiles con feedback verde inmediato (`handleQuickCategoryChange`), guardado en `localStorage` y persistencia en Supabase.
  * Sincronización bidireccional entre el slider de AVG y los botones de categoría en la pestaña de edición de ficha.
  * Badge de categoría en la cabecera del perfil interactivo que scrollea y enfoca la sección de categorías.
  * Selector directo de 4 categorías en el modal de onboarding obligatorio (`OnboardingProfileModal.tsx`).
- [x] **Cierre de Sesión y Selección Rápida de Cuentas (`LoginModal.tsx` & `AppSidebar.tsx`):**
  * Modal interactivo `LoginModal.tsx` con listado de jugadores registrados en la nube para cambiar de usuario con 1-click.
  * Botón de cierre de sesión en la barra lateral y en la cabecera del perfil (`clearCurrentPlayerSession`).
- [x] **Panel Central de Superadmin (`/superadmin`):**
  * Módulo con 4 pestañas: 1. Cuotas & Servidores; 2. Demografía & Edades en vivo con Padrón de Jugadores y asignación de categorías; 3. Vitrinas de Landing Page (Gran Torneo con contador de Google Forms, Comunidad, Clubes y Pagos); 4. Comisión Directiva de Mar del Plata y Nacional.
- [x] **Vitrina Oficial de Pago de Inscripciones en la Landing Page (`src/app/page.tsx`):**
  * Vitrina con datos bancarios oficiales (Banco, Titular, CUIT, Alias, CBU con botones para copiar) y enlace directo a WhatsApp.
- [x] Definición completa del esquema relacional en PostgreSQL / Supabase (`db-schema.sql`) y Prisma (`schema.prisma`).
- [x] Rediseño integral de la paleta de colores basado 100% en la Diana de Dardos (Samurai 4) con fondo gris oscuro (`#14161f`).
- [x] Persistencia offline-first de partidas y cola de sincronización en `src/lib/storage.ts`.
- [x] Transmisión broadcast en tiempo real entre el Oche y pantallas de torneos (`src/lib/broadcast.ts` y pestaña "Tablero en Vivo" en `/torneos`).
- [x] Paleta deportiva de alto contraste con fondo negro profundo (`#07090e`), tarjetas `#0f1422` y acentos neón (#00e676, #ef4444, #0284c7) idénticos a la primera captura de referencia.
- [x] Menú lateral hover-driven (sin botones manuales: colapsado en reposo a 80px y expandido automáticamente a 256px por over mouse) + Bottom Navigation Bar táctil para celulares (`AppSidebar.tsx` + `AppTopBar.tsx` + `AppBottomNav.tsx` + `AppShell.tsx`).
- [x] Módulo Directorio Federal de Jugadores (`/jugadores` y `PlayerDirectory.tsx`) con filtros por provincia, categoría de AVG y reto directo.
- [x] Verificación de compilación limpia de producción (`npm run build`) con 0 errores de tipos y lint.
- [x] Erradicación completa de referencias externas (Nakka01): identidad de producto soberana y 100% propia.
- [x] **Anotador Oficial Profesional Rediseñado (501 + Cricket + Modalidad Parejas 2 vs 2):**
  * Pantalla previa de configuración (`MatchGameSettings.tsx`) para 501 y Cricket con selección de jugadores registrados o parejas de la app.
  * Tablero interactivo de 501 (`X01Board.tsx`) con paleta oficial de la diana (fondo negro `#07090e`, presencia fuerte de rojo diana `#ef4444`), teclado táctil de 5 columnas con atajos rápidos (`26, 41, 45, CLR | 1..9, 0 | 60, 85, 100, no Score`), marcadores gigantes y cálculo de AVG y First 9.
  * Pizarra táctil de Cricket (`CricketBoard.tsx`) con 5 columnas, marcas (`/`, `✕`, `⊗`), modos Default, Cut Throat y No Score, y cálculo de MPR.
  * Modal oficial de estadísticas estándar PDC (`MatchPdcStatsModal.tsx`) con comparativa lado a lado (Legs, 3 Darts AVG, First 9, 100+, 140+, 180s, High Finish, Best Leg).
  * Rotación estricta de tiros para modalidad por parejas (4 turnos) emparentada a los perfiles de la comunidad.

---

- [x] **Módulo de Torneos Avanzado y Partidas Conectadas (Integrado con el Anotador Oficial):**
  * Despachador de partidos (`MatchDispatcherModal.tsx`) con 3 vías: *Online*, *Live en el Club*, o *Carga Rápida*.
  * Conexión en caliente del fixture de torneos con `DartScorer.tsx`, reportando el resultado en vivo y avanzando al ganador en el cuadro.
  * Fase de Grupos Round Robin (`TournamentGroupStage.tsx`) con tabla de posiciones oficial (PJ, G, P, LF, LC, +/- Dif, Pts).
  * Acreditación de jugador (`PlayerEnrollModal.tsx`) y configuración de hardware de pista (`WebcamSetupModal.tsx`) con soporte para celular como cámara de diana secundaria.
  * Pantalla TV de Club (`LIVE_BOARD`) para retransmisión dardo a dardo en monitores o proyectores.
  * Superadministrador oficial "ICEMAN" (`marianodeux@gmail.com`) con `AdminMatchModal.tsx` para edición manual de legs, avance por Walkover (W.O.) ante rival ausente, reseteo a 0-0 y eliminación de torneos.
  * Reestructuración de la vista `/torneos`: Pestaña "Torneos Activos" (con tabla de torneos creados sin mocks no deseados) y pestaña "Historial de Torneos" con desarrollo completo de la llave eliminatoria y panel de estadísticas (Campeón, Subcampeón, AVG, Mayor Cierre, 180s, Mejor Pierna).

---

- [x] **Audios Oficiales de Árbitro (Russ Bray 1-180 & Clemens Kuntze):**
  * Descarga concurrente y almacenamiento de los 180 archivos MP3 oficiales en `audios_russ_bray/` y `public/sounds/russ_bray/`.
  * Integración en `src/lib/sound-effects.ts` para reproducción auténtica dardo a dardo y sample original para el 180.

---

- [x] **Nacionalidad y Banderas en Perfil y Cuadros:**
  * Catálogo oficial `COUNTRIES` con códigos ISO y banderas emoji.
  * Selector interactivo de nacionalidad en la ficha de jugador (`RegisterAndProfile.tsx`).
  * Visualización de banderas en perfil, sobre el avatar, en el pie del sidebar (`AppSidebar.tsx`), en el directorio de jugadores (`PlayerDirectory.tsx`) y en los cuadros de torneos (`TournamentBracket.tsx`).

---

- [x] **Sistema Oficial de Ligas y Modalidades de Torneo:**
  * Creación del modelo `League` y soporte de 3 modalidades de torneo:
    1. Torneo de un día (sin liga asociada / relámpago).
    2. Torneo local que suma puntos a su Liga Local (`CreateLeagueModal.tsx` y `LeagueManager.tsx`).
    3. Torneo Nacional Oficial: Única Liga Nacional de Argentina, clasificatoria a torneos internacionales, con fechas online y fechas presenciales oficiales que duplican puntos (x2).
    4. Partida individual en el anotador que no altera tablas de torneo ni liga (solo estadísticas personales del jugador).
  * Pestaña "Ligas & Posiciones" en `/torneos` con visualización de tablas acumuladas (PJ, Títulos, Podios, AVG 501, Puntos) y selector de ligas.
  * Formulario de creación de torneos enriquecido con selector interactivo de modalidad, liga y fechas presenciales con bonificación x2.

---

- [x] **Directorio Federal de Jugadores & Cartas Coleccionables (FUT Style):**
  * Tarjetas coleccionables `UltimateDartsCard.tsx` con diseño de escudo Luke Littler, foto oficial, bandera nacional, club, patrocinador de dardos y eliminación total de canción de entrada (*walk-on song*).
  * 4 filtros de ordenamiento y ranking interactivos: Mayor AVG App, Liga Argentina (Circuito Federal), Liga Marplatense (con checkbox "Solo jugadores MDQ") y Torneos Presenciales MDQ (2 fechas oficiales al año).
  * Jerarquía estricta de última mejor actuación: prioridad Liga Nacional/Local, y si no tiene datos de liga, de un Torneo.
  * Cápsula deportiva espaciosa de 2 líneas bajo el nombre para la última competencia disputada: mención explícita si estuvo entre los primeros 6 (Top 6: `#1 CAMPEÓN`, `#2 SUBCAMPEÓN`, `#3 3ER PUESTO`, `#4 4TO PUESTO`, `#5 5TO PUESTO`, `#6 6TO PUESTO`).
  * Modal de Detalle de Jugador (`PlayerDetailModal.tsx`) con apertura interactiva desde el cuadro eliminatorio, historial o tabla de posiciones de ligas, palmarés con copas de oro, plata y bronce (#1, #2, #3), y enlaces a fechas disputadas.
  * Reemplazo integral en toda la plataforma del término "Pierna" por "Leg" (práctica argentina del juego: Set, Leg, AVG).
  * Incorporación del logo oficial de Dardos Argentina en cabecera de Ligas Nacionales y logo de Darderos MDQ en ligas y torneos locales.
  * Módulo de subida de foto de perfil con recorte automático a 400x520 px sobre canvas preservando transparencia PNG.
  * Formateo inteligente de nombres en cartas coleccionables (`formatCardPlayerName`): limita a primer nombre y apellido ante 2 nombres o apellidos compuestos, y autoajusta escala tipográfica y compresión vectorial SVG (`textLength="225"`) sin desbordes.
  * Reemplazo del término "CAREER 180s" por "TOTAL 180s" bajo la bandera.

---

- [x] **Anotador X01, Terminología "Diana" y Sonido Exclusivo de Russ Bray:**
  * Reemplazo sistemático del vocablo "oche" por "Diana" en toda la plataforma.
  * Erradicación total de la voz sintética femenina en audios, consolidando como árbitro exclusivo a Russ Bray (MP3) y Clemens Kuntze en el 180.
  * Cuadro central "TIRADA" (`h-11`) transformado en display de Cierre Sugerido oficial in-place de 2 a 170, eliminando la caja externa inferior y preservando milimétricamente las dimensiones del tablero en celulares sin layout-shift.
  * Botón de silenciar/activar audios integrado en la cabecera del marcador.
  * Instancia final de partida esperando confirmación "FINALIZAR PARTIDA (EXIT)" con botón "Deshacer / Corregir" plenamente habilitado ante cualquier error.
  * Panel 2 de puntuaciones y visitas en juego de dimensiones idénticas con transición suave entre tablero y tabla histórica.

---

- [x] **Doble Eliminación (Double Elimination) y Configuración Detallada por Instancia (Nakka Style):**
  * Árbol de llaves de Doble Eliminación con cruces automáticos de Ganadores (Winners por arriba), Perdedores (Losers por abajo) y Gran Final.
  * Selector interactivo de visualización en `TournamentBracket.tsx` (Ver Todo, Ganadores, Perdedores, Gran Final).
  * Formulario de creación de torneos con acordeón de configuración de legs por ronda emulando Nakka: Cuartos, Semifinales, Final de Ganadores, Rondas de Perdedores, Final de Perdedores y Gran Final.
  * Configuración para Ligas por grupos: número de zonas, competidores por zona, clasificados a playoffs, ida y vuelta y desempate por diferencia de legs.

---

- [x] **Historial de Participación y Estadísticas en 4 Pestañas (`PlayerDetailModal.tsx`):**
  * Desglose deportivo en 4 pestañas independientes: 1. Partidas Individuales (retos y práctica), 2. Torneos de un Día (copas de campeonato), 3. Ligas Locales (MDQ & clubes; online y presencial), 4. Liga Nacional Oficial (fechas online 1x vs presenciales oficiales con doble puntaje ⚡ x2).
  * Panel de métricas dedicado por pestaña con cómputo de AVG específico, puntos, podios y fechas disputadas.
  * Badges detallados de modalidad (`[🌐 Online]`, `[🏢 Presencial Sede]`, `[⚡ Presencial Oficial x2 Pts]`).

---

- [x] **Página Oficial de Reglamento, Código de Conducta & Fair Play (`/reglamento`):**
  * Manual federado en 5 capítulos: 1. Medidas de diana (1.73m altura, 2.37m tiro) y reglas 501/Cricket; 2. Modalidades y sistema de puntuación (x2 en presenciales nacionales); 3. Código de etiqueta en la diana (silencio, distancia, retiro de dardos); 4. Requerimientos técnicos para partidas online (cámara perpendicular sin sombras, micrófono abierto para validación acústica de impacto, prohibición de tocar dardos antes de cantar); 5. Protocolo de W.O. (10 min tolerancia) y caídas de conexión (5 min pausa).
  * Enlazado en pie de página (`Footer.tsx`), menú lateral (`AppSidebar.tsx`) y modales de jugador.

---

- [x] **Configuración Detallada por Instancia de Llave & Soporte de Sets + Legs:**
  * Erradicación completa de marcas externas: denominación soberana "Configuración detallada por instancia de llave".
  * Selector interactivo entre `[🎯 Solo Legs]` y `[🏆 Sets + Legs]`.
  * Configuración de Legs requeridos por Set y etiquetas dinámicas con indicador `1º a X`.
  * Corrección integral del scroll en el modal de creación de torneos (`overflow-y-auto`, `overscroll-contain`, `touch-pan-y`).
  * Visualización de badges de distancia y sets ganados (`1S`, `2S`) en `TournamentBracket.tsx`.

- [x] **Módulo de Cámara para Partidas Online (Celular + PC con 2 Pantallas / Ventana Emergente Pop-out):**
  * Ventana emergente desacoplada `/anotador/camara-popout` para 2ª pantalla, TV o proyector con streaming de webcam a pantalla completa, selector de hardware, controles de zoom/espejo y banner televisivo estilo PDC vía `matchBroadcast`.
  * Botón `[🖥️ Pop-out 2ª Pantalla]` en la cabecera del anotador oficial.
  * Modo móvil de alternancia de cámara con botón `[📹 Diana Rival]` y conmutación automática al teclado táctil de 5 columnas en el turno local, preservando milimétricamente las dimensiones del teclado ergonómico.

- [x] **Torneos Arancelados vs Gratuitos, Cálculo de Premios (60-30-10) y Modal de Pago:**
  * Seteo explícito en la creación de torneo: `[🎉 Gratuito]` vs `[💰 Con Inscripción ($ ARS)]`.
  * Cálculo automático del pozo de premios ($Cupo \times Inscripción$) con edición libre permitida.
  * Desglose oficial de premios en tiempo real: **60% al 1º, 30% al 2º y 10% al 3º**.
  * Modal de inscripción con datos bancarios oficiales (Banco, Titular, CUIT, Alias, CBU con botones para copiar).
  * Botón directo a WhatsApp con mensaje pre-armado dirigido al administrador para enviar comprobante de pago.

- [x] **Módulo Institucional Asociación (`/asociacion`) & Panel de Autoridades:**
  * Nueva sección "Asociación" en `/asociacion` y vinculada en el menú lateral (`AppSidebar.tsx`).
  * Pestañas para Asociación de Dardos Mar del Plata y Dardos Argentina.
  * Grilla de autoridades de la Comisión Directiva con cargos y fotos de perfil de jugador sincronizadas en vivo.
  * Sección de datos bancarios institucionales para transferencias.
  * Panel administrativo exclusivo para ICEMAN (`marianodeux@gmail.com`) para gestionar autoridades (vinculando jugadores de la app) y modificar los datos de la cuenta bancaria.

- [x] **Reparación de Service Worker v1 & Blindaje Anti-Layout Shift:**
  * Actualización a Service Worker v2 (`sw.js`) con estrategia Network-First para navegación HTML, evitando que el cliente cargue HTML en caché que apunte a hashes 404 de CSS de Vercel.
  * Purga automática de cachés `locos-dardos-v1` en `providers.tsx`.
  * Blindaje con dimensiones inline estrictas en contenedores de avatares para evitar desbordes ante cualquier eventualidad.
  * Migración automática de perfiles residuales desactualizados en `localStorage` (`storage.ts`).

- [x] **Ocultamiento Temporal de la Sección Tienda:**
  * Ocultada de `AppSidebar.tsx`, `AppBottomNav.tsx` (reemplazada ergonómicamente por `Jugadores`), `Navbar.tsx`, `Footer.tsx` y la Card 4 de la landing (`page.tsx`).
  * Catálogo y modelos de e-commerce preservados intactos para activación futura.

- [x] **Habilitación de Micrófono & Voz en Tiempo Real para Partidas Online:**
  * Captura de audio WebRTC con cancelación de eco, supresión de ruido y control de ganancia automático.
  * Controles táctiles de micrófono (Mute / Unmute) y retorno en el anotador oficial (`X01Board.tsx`) y en la 2ª pantalla TV (`camara-popout/page.tsx`).
  * Detección de voz en vivo mediante Web Audio API (`AnalyserNode`) con indicación luminosa cuando el competidor está hablando con su rival.

- [x] **Blindaje de Seguridad del Superadministrador ICEMAN (`OnboardingProfileModal.tsx` & `constants.ts`):**
  * Erradicación total del botón público libre que permitía asumir la sesión de Superadministrador a cualquier visitante anónimo.
  * Implementación de modal de autenticación administrativa con contraseña maestra (`ADMIN_MASTER_PASSWORD`), validando estrictamente el correo oficial `marianodeux@gmail.com` mediante `validateAdminCredentials`.
  * Preservación del Onboarding obligatorio deportivo para nuevos jugadores sin brechas de seguridad.

- [x] **Anotador Oficial: Jugador 1 Logueado por Defecto & Jugador 2 de la Comunidad (`MatchGameSettings.tsx`):**
  * Asignación obligatoria e inmutable del Jugador 1 (P1) como el perfil del usuario autenticado en la sesión (`[Tú (Logueado)]`).
  * Enriquecimiento del Jugador 2 (P2) con selector interactivo entre los miembros registrados de la Comunidad Oficial (`CANONICAL_PLAYERS` e `ICEMAN`), 4 dificultades de Bot IA (Fácil 40, Medio 55, Avanzado 70, Pro 85 AVG) e invitado ocasional.

- [x] **Salas Online 1 vs 1: Sincronización Reactiva de Tiros & Cámara Trasera en Móviles (`webrtc-room.ts` & `X01Board.tsx`):**
  * Vinculación reactiva del listener de WebRTC (`setWebRtcThrowListener`): resuelve la falta de avance del turno al conectar directamente los paquetes entrantes `THROW` con `submitScore(score, true)` en el tablero activo.
  * Cámara Trasera por Defecto en Celulares (`facingMode: { ideal: 'environment' }`): enfoca automáticamente la diana física al encender la cámara en dispositivos móviles.
  * Botón interactivo de Alternancia de Cámara (`SwitchCamera`): permite conmutar en caliente entre cámara trasera (diana) y delantera (jugador).

- [x] **Selector Universal de Hardware de Cámaras (`X01Board.tsx` & `WebcamSetupModal.tsx`):**
  * Detección de dispositivos de video reales mediante `navigator.mediaDevices.enumerateDevices()` filtrando `videoinput`.
  * Selector `<select>` desplegable integrado en la barra de diana del anotador para conmutar entre cámaras web USB, integrada o software de captura.
  * Persistencia en `localStorage` (`lpld_camera_device_id`) y fallback a `facingMode` en smartphones.

- [x] **Reparación de Audio WebRTC en Smartphones & Desbloqueo de Autoplay (`webrtc-room.ts` & `X01Board.tsx`):**
  * En `webrtc-room.ts`, incorporación de `pc.addTrack(audioTrack, stream)` en `sendMediaStream` si no existe un audio sender previo, evitando silencios cuando la llamada se conecta antes de encender el micrófono.
  * Elemento `<audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />` dedicado en `X01Board.tsx`.
  * Detección de bloqueo de Autoplay en teléfonos móviles con banner táctil accesible: *"🔊 Toca aquí para escuchar la voz del rival en este teléfono"*.

- [x] **Modal y Herramienta de Invitación Federal por WhatsApp (`InvitePlayersModal.tsx`):**
  * Generación de enlace directo a `/perfil` (`https://locosporlosdardos.com.ar/perfil`).
  * Botón para compartir por WhatsApp con mensaje pre-redactado de la comunidad, botón de copiado de link con feedback visual y botón de copiado de mensaje.
  * Integración en menú lateral (`AppSidebar.tsx`) y en ficha de jugador (`RegisterAndProfile.tsx`).

- [x] **Sincronización Total de Jugadores Cloud & Erradicación de Mocks:**
  * Reemplazo de `MOCK_RANKINGS` por `fetchRegisteredPlayersFromCloud()` en `NationalRankings`, `PlayerEnrollModal`, `asociacion/page.tsx`, `TournamentManager` y `MatchGameSettings`.
  * Sanitize defensivo de avatares para evitar herencias de imagen de ICEMAN en nuevos registros.

---

## ⚡ En Progreso / Siguientes Pasos Inmediatos
- [ ] Generación de PDF / PNG imprimible del cuadro final del torneo para la cartelera física del club.
- [ ] Sorteo automatizado de cabezas de serie (*seeding*) según el AVG oficial del ranking nacional.

---

## 🎯 Prioridad Alta (Próximos Sprints)
- [ ] **Módulo de Torneos Avanzado:**
  * Generación de PDF / PNG exportable del cuadro del torneo para imprimir en la cartelera del club.
  * Modalidad de sorteo de emparejamientos con cabezas de serie automáticos basados en el ranking nacional.
- [ ] **Anotador - Estadísticas de Sesión:**
  * Gráfico de radar / dispersión del calor de tiro (heatmap de aciertos en diana).
  * Entrenamiento específico: "Round the Clock" y "Bobs 27" (dobles).
- [ ] **Mercado Pago & Tienda:**
  * Sincronización de credenciales de producción de Mercado Pago (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`).
  * Módulo de cálculo automático de costo de envío por código postal con OCA / Correo Argentino / Andreani.
- [ ] **Notificaciones Push PWA:**
  * Web Push API para avisar al jugador cuándo es su turno de tirar en una pista asignada del torneo.
