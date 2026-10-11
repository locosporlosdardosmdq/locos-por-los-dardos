# Tareas del Proyecto (TODO) • Locos por los Dardos

## 🏆 Tareas Completadas
- [x] Configuración inicial del proyecto con Next.js 15, TypeScript y Tailwind CSS.
- [x] Implementación de PWA con Web App Manifest (`manifest.json`) y Service Worker (`sw.js`).
- [x] Identidad de marca unificada con +25% de preponderancia para Darderos Mar del Plata (`BrandLogo.tsx`).
- [x] Módulo 1: Formulario de Registro y Perfil con estimación de AVG y categorización automática (Principiante, Intermedia, Avanzada, Elite) en tiempo real.
- [x] Módulo 2: Anotador en Vivo táctil (My Dart Training) con X01, Cricket, Bot AI, Checkout Guide interactiva y Referee de voz.
- [x] Módulo 3: Gestor de Torneos Oficial con llaves eliminatorias en vivo y fase de grupos (Round Robin).
- [x] Módulo 4: Landing Page comunitaria con Head Banner promocional superior (Hero Torneos) y Leaderboard público.
- [x] Módulo 5: E-commerce integrado con catálogo, carrito lateral (`CartDrawer`) y API de Mercado Pago en ARS.
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

## ⚡ En Progreso / Siguientes Pasos Inmediatos
- [ ] **Módulo de Cámara para Partidas Online (Celular + PC con 2 Pantallas / Ventana Emergente Pop-out):**
  * Implementación del plan técnico validado: alternancia automática en móviles (feed del rival al tirar vs anotador al puntuar) y ventana flotante desacoplada (`window.open` o Document Picture-in-Picture API) para setups de 2 monitores/TV en PC.
  * Generación de PDF / PNG imprimible del cuadro final del torneo para la cartelera física del club.
  * Sorteo automatizado de cabezas de serie (*seeding*) según el AVG oficial del ranking nacional.

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
