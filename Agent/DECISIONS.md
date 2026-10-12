# Registro de Decisiones de Arquitectura (ADR)

## [ADR-001] Stack Tecnológico y Framework Base
- **Fecha:** 2026-10-10
- **Contexto:** Se requiere una Progressive Web App (PWA) de alto rendimiento, optimizada para móviles y desktop, con capacidades offline para ser utilizada en clubes y bares con mala señal.
- **Decisión:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS.
- **Motivo:** Next.js proporciona Server Components y API Routes en un único proyecto unificado, excelente optimización de bundles, y soporte directo para Service Workers y Web App Manifest sin sobrecarga de configuración.

---

## [ADR-002] Identidad Visual y Jerarquía de Logos (+25% Darderos MDQ)
- **Fecha:** 2026-10-10
- **Contexto:** La plataforma surge de la unión de Darderos Mar del Plata y la comunidad federal Locos por los Dardos, con el requerimiento de otorgar mayor preponderancia al logo de Darderos MDQ (+25%).
- **Decisión:** Se creó el componente `BrandLogo.tsx` que calcula la relación geométrica exacta (ej: 50px vs 40px, o 110px vs 88px en versión Hero), posicionando al club anfitrión con relieve y sombras esmeralda, y complementando armónicamente con la marca nacional.
- **Motivo:** Garantiza consistencia en toda la UI sin desbalancear la diagramación en resoluciones móviles.

---

## [ADR-003] Motor de Audio y Referee de Voz (Web Speech API + Web Audio API)
- **Fecha:** 2026-10-10
- **Contexto:** Simular la experiencia de un árbitro profesional de dardos ("180", "Game shot", "Bust", anuncios de puntuación) sin obligar a descargar decenas de megabytes en archivos MP3 pesados que ralenticen la carga inicial en conexiones móviles 3G/4G.
- **Decisión:** Implementar síntesis mediante `window.speechSynthesis` (Web Speech API) con acento y velocidad calibrada, complementado con osciladores de síntesis en tiempo real (`AudioContext`) para el impacto de dardos y buzzers, y reservando un clip de audio liviano solo para la celebración del campeonato.
- **Motivo:** Cero peso adicional en bundle, respuesta inmediata sin latencia de red y soporte en navegadores modernos.

---

## [ADR-004] Arquitectura del Anotador Táctil (Dual-Mode Scoring)
- **Fecha:** 2026-10-10
- **Contexto:** Diferentes tipos de jugadores prefieren registrar el total de la visita (e.g. 60 o 100 con teclado numérico) mientras que otros prefieren registrar dardo a dardo (S20, T20, D10) para un desglose estadístico exacto.
- **Decisión:** Diseñar `DartKeypad.tsx` con dos modalidades conmutables en caliente: "Puntaje Total" (con accesos directos numéricos tipo My Dart Training) y "Dardo x Dardo (3)" (con multiplicadores Simple/Doble/Triple, diana y miss).
- **Motivo:** Máxima velocidad de entrada y usabilidad táctil al pie del tablero (oche).

---

## [ADR-005] Integración de Pagos con Mercado Pago (ARS)
- **Fecha:** 2026-10-10
- **Contexto:** La plataforma debe operar transacciones comerciales y cobro de inscripciones a torneos en Pesos Argentinos (ARS) de forma confiable.
- **Decisión:** Integración de Checkout Pro mediante endpoints `/api/checkout/mercadopago` (Preferencia de pago) y `/api/webhook/mercadopago` (IPN). Incluye fallback de simulación para desarrollo y pruebas offline locales sin bloquear el flujo cuando no hay token de producción configurado.
- **Motivo:** Es el estándar de pago indiscutido en Argentina con soporte para dinero en cuenta, tarjetas de crédito en cuotas y débito.

---

## [ADR-006] Sistema de Diseño Basado en la Diana de Dardos (Samurai 4) + Fondo Gris Oscuro
- **Fecha:** 2026-10-10
- **Contexto:** Se requiere otorgar una identidad visual deportiva contundente y auténtica a la plataforma, inspirada directamente en los colores de la diana física (Samurai 4), respetando un fondo gris oscuro sobrio para evitar fatiga visual durante sesiones prolongadas.
- **Decisión:** Se mapearon los tokens semánticos en `tailwind.config.ts`:
  * Fondo base y contenedores: Gris Oscuro (`#14161f` / `#1c1f2b` / `#313647`).
  * Aciertos, estadísticas y promedios: Verde Diana Oficial (`#00b853`).
  * Dobles, Bullseye central, bogey checks y alertas: Rojo Diana Oficial (`#e52521`).
  * Acentos de competición y marca Samurai: Azul Eléctrico (`#1d68ed`).
  * Sectores claros y tipografía de alto contraste: Marfil/Sisal natural (`#efe7d8`).
- **Motivo:** Refleja con fidelidad el deporte de los dardos y genera un fuerte impacto visual deportivo sin sacrificar la legibilidad ni la usabilidad bajo iluminación tenue en pubs y clubes.

---

## [ADR-007] Persistencia Offline-First y Espejo de Pista (Real-Time Broadcast)
- **Fecha:** 2026-10-10
- **Contexto:** En torneos presenciales, los jueces y jugadores usan tablets al pie del oche (cancha) y necesitan que los espectadores vean el tablero en una pantalla o proyector sin depender de una conexión a internet estable.
- **Decisión:** Se diseñó `src/lib/storage.ts` para persistencia local de partidas terminadas con cola de sincronización asíncrona, y `src/lib/broadcast.ts` basado en `BroadcastChannel` (con fallback de `storage` events) que emite cada dardo y actualización de pierna instantáneamente a la nueva pestaña "Tablero en Vivo" de `/torneos`.
- **Motivo:** Cero latencia, funcionamiento offline 100% garantizado en locales sin señal de internet y sincronización transparente entre pestañas y dispositivos.

---

## [ADR-008] Navegación por Menú Lateral Colapsable y Paleta Deportiva Negra Profunda
- **Fecha:** 2026-10-10
- **Contexto:** El usuario solicitó unificar la experiencia visual devolviéndola al estándar de máxima legibilidad y estética de la primera captura (fondo casi negro `#07090e`, tipografías en blanco nítido y acentos verdes neón `#00e676`), junto con un menú lateral colapsable para alojar los 6 módulos evolutivos de la plataforma deportiva.
- **Decisión:**
  * Se implementó `AppSidebar.tsx` con soporte de estado colapsado (64px) / expandido (256px), persistido en `localStorage` y drawer para pantallas móviles.
  * Jerarquía de navegación unificada en 6 módulos: 1. Tienda Online (`/tienda`), 2. Torneos (`/torneos`), 3. Anotador (`/anotador`), 4. Ranking (`/ranking`), 5. Jugadores (`/jugadores`), 6. Configuración / Mi Perfil (`/perfil`).
  * Tokens de color: Fondo negro azabache (`#07090e`), tarjetas `#0f1422`, bordes `#1e2638`, textos en blanco puro y marcadores de puntuación gigantes de alto contraste para máxima visibilidad a la distancia de tiro (oche).
- **Motivo:** Brinda una ergonomía visual óptima para salas de juego, evita fatiga por grises intermedios lavados y organiza la arquitectura de navegación para escalar el desarrollo módulo a módulo.

---

## [ADR-009] Identidad de Marca Propia y Ergonomía Responsiva Dual (PC vs Celulares)
- **Fecha:** 2026-10-10
- **Contexto:**
  1. Se definió como premisa de producto superar a cualquier plataforma existente (Nakka01) por mérito propio, eliminando cualquier comparación o referencia explícita de la UI, metadata y base de datos.
  2. El menú lateral requería un control de colapso obvio e inmediato en PC, y una adaptación táctil perfecta para jugadores que usan el celular con una sola mano al pie de la diana.
- **Decisión:**
  * **Erradicación de marcas externas:** Se renombraron todos los cuadros y gestores a "Gestor de Torneos Oficial" y "Cuadro Eliminatorio Oficial en Tiempo Real", asegurando identidad 100% soberana.
  * **Colapso/Expansión en PC (Hover Puro):** Se eliminaron por completo los controles y botones manuales de colapsar/expandir. La interacción está gobernada exclusivamente por el *mouse over* (`onMouseEnter` expande a 256px y `onMouseLeave` repliega a 80px). El margen del layout en desktop es fijo (`lg:pl-20`) para evitar saltos o parpadeos de pantalla (*layout shift*) mientras el menú flota con sombra envolvente.
  * **Navegación Móvil (Celulares/Tablets):** Se implementó `AppBottomNav.tsx` fija en el pie de pantalla con 5 accesos táctiles, destacando el botón central de Anotador en verde neón elevado (`w-13 h-13`) para tiro rápido, y un drawer lateral fluido para opciones adicionales sin robar espacio horizontal durante el juego.
- **Motivo:** Máxima ergonomía en el mundo real (pantallas móviles en torneos presenciales) y control total del espacio de visualización en monitores de PC sin botones innecesarios que distraigan la atención.

---

## ADR-010: Arquitectura Modular del Anotador (501 + Cricket) y Métricas Estándar PDC

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  El Anotador es el corazón deportivo de la plataforma. Tanto para partidos individuales como para torneos, el sistema requería:
  1. Pantalla de configuración previa completa (individual y parejas 2 vs 2 emparentadas a los perfiles de la app).
  2. Tablero de 501 con teclado táctil ergonómico de 5 columnas con atajos rápidos de tiro (`26, 41, 45, CLR` a la izquierda y `60, 85, 100, no Score` a la derecha) y paleta de la diana (fondo negro `#07090e`, presencia destacada de rojo diana `#ef4444` y verde diana `#00e676`).
  3. Tablero de Cricket con pizarra interactiva (Whiteboard View) de 5 columnas con multiplicadores D y T, simbología oficial (`/`, `✕`, `⊗`) y los 3 modos: Default, Cut Throat y No Score.
  4. Métricas oficiales estándar PDC (3-Darts AVG, First 9 AVG, 100+, 140+, 180s, High Finish, Best Leg, MPR) que impactan en vivo en los perfiles.
- **Decisión:**
  Se desacopló el monolito previo en 4 componentes especializados y tipados:
  * `MatchGameSettings.tsx`: Configuración previa, selector de jugadores y reglas.
  * `X01Board.tsx`: Tablero de 501 con teclado ergonómico de 5 columnas.
  * `CricketBoard.tsx`: Pizarra táctil interactiva de Cricket con multiplicadores y marcas.
  * `MatchPdcStatsModal.tsx`: Modal oficial de estadísticas comparativas PDC.
  * `DartScorer.tsx`: Orquestador principal que preserva persistencia offline-first (`saveCompletedMatch`) y broadcast de pista (`matchBroadcast.publish`).
- **Motivo:** Cero acoplamiento, alta velocidad de renderizado, fidelidad absoluta a las necesidades de los jugadores al pie del oche y base sólida para conectar el módulo de Torneos.

---

## ADR-011: Despachador de Partidos de Torneo (Match Dispatcher) y Puente en Caliente con el Anotador

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  Los torneos de dardos combinan partidas jugadas en oches presenciales de clubes, partidas a distancia conectadas por internet con cámara apuntando a la diana, y cierres administrativos por walkover o planillas manuales. Se requería un mecanismo no bloqueante que permitiera desde cualquier celda del fixture (cuadro eliminatorio o fase de grupos) resolver el partido.
- **Decisión:**
  1. Se implementó `MatchDispatcherModal.tsx` como el despachador universal de partidas con 3 vías:
     * *Partida Online:* Sala conectada remota con soporte de webcam y segundo dispositivo (celular).
     * *Anotador en Vivo (En el Club):* Abre en caliente el nuevo `DartScorer.tsx` en el oche físico.
     * *Registrar Resultados:* Carga directa de legs ganados para validación rápida.
  2. Al cantar victoria en el Anotador (`Game Shot and the Match`), el resultado alimenta directamente al cuadro (`TournamentBracket.tsx`) avanzando al ganador a la siguiente ronda, o computa los puntos y diferencia de legs ($+/-$) en la tabla de posiciones de `TournamentGroupStage.tsx`.
  3. Soporte de hardware de pista en `WebcamSetupModal.tsx` con WebRTC `getUserMedia`, auto-zoom a la diana del rival y código QR para conectar el celular como cámara de diana remota.
- **Motivo:** Interoperabilidad total entre los torneos y el motor de juego, evitando duplicación de lógica y permitiendo una experiencia ininterrumpida al pie del oche.

---

## ADR-012: Motor de Locución Emocional de Partidas y Audio Original de Clemens Kuntze

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  La experiencia inmersiva del dardo profesional depende críticamente de la entonación y dramatismo del árbitro (*caller*). El usuario solicitó cantar todos los tantos del 1 al 180 con una modulación emocional específica basada en el rendimiento del tiro, integrando el audio original del reconocido locutor Clemens Kuntze presente en `Recursos/Clemens Kuntze.mp3`.
- **Decisión:**
  Se diseñó un motor híbrido inteligente en `src/lib/sound-effects.ts`:
  1. **Tantos de 170 a 180 (Banda Clímax / 180 Perfecto):**
     * Dispara directamente el audio original de alta fidelidad `public/sounds/clemens-kuntze.mp3` (`SoundEngine.playClemens180()`).
  2. **Tantos de 1 a 169 (Modulación Paramétrica por Web Speech API):**
     * **Banda 1 (< 20 - Muy pesimista):** Pitch 0.65, Rate 0.82 (tono grave, apagado y desganado).
     * **Banda 2 (20 a 59 - Normal):** Pitch 1.0, Rate 1.0 (entonación arbitral clara y neutra).
     * **Banda 3 (60 a 89 - Con énfasis):** Pitch 1.15, Rate 1.1 (entonación enérgica y firme).
     * **Banda 4 (90 a 119 - Con más énfasis):** Pitch 1.25, Rate 1.18 (locución acelerada con impacto).
     * **Banda 5 (120 a 169 - Con mucho énfasis):** Pitch 1.35, Rate 1.25 (grito eufórico de visita alta).
- **Motivo:** Cero latencia, funcionamiento offline 100% garantizado en PWA, máximo realismo competitivo y preservación del sample original para las jugadas cumbre.

---

## ADR-013: Optimización del Espacio Vertical (Eliminación de TopBar) y Rediseño del Menú Lateral

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  En el oche y durante torneos, la visibilidad de los números del anotador y las llaves eliminatorias (*brackets*) debe ser máxima. La barra superior fija (`AppTopBar`) y encabezados estáticos redundantes consumían más de 120px de espacio vertical crítico. Además, se requería que la barra lateral tuviera tipografía pura en la cabecera y el logo de la sede deportiva (Darderos Mar del Plata) antes del perfil del jugador, junto con acciones explícitas de gestión de cuenta.
- **Decisión:**
  1. **Remoción de `AppTopBar`:** En `AppShell.tsx`, se retiró el componente de la vista para ganar altura vertical completa en desktop y mobile.
  2. **Encabezados Dinámicos de Partida:**
     * En torneos: muestra dinámicamente `${currentTournament.title} • Oche Asignado`.
     * Fuera de torneos (en `/anotador`): muestra exclusivamente `Partida individual`.
  3. **Rediseño de `AppSidebar`:**
     * **Top del Menú:** Sólo texto e identidad tipográfica pura (colapsado: "LPD MDQ", expandido: "Locos por los Dardos ARG - Circuito Federal").
     * **Final del Menú:** Logo de Darderos Mar del Plata (`/logos/logo-mdq.png`) con la leyenda "Sede Oficial del Circuito" antes de la división del jugador.
     * **División de Usuario:** Accesos directos con iconos para "Modificar Perfil" (`/perfil`) y "Cerrar Sesión" (`LogOut`).
- **Motivo:** Máximo aprovechamiento de la pantalla para los tableros de juego y fixtures, mayor ergonomía visual y accesos directos de perfil y sesión.

---

## ADR-014: Banco de Audios Oficiales MP3 (Russ Bray 1-180) y Clemens Kuntze Clímax

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  La síntesis de voz sintética nativa de navegadores carecía de la fuerza acústica y aspereza característica del dardo profesional. El usuario requirió descargar el set oficial de audios MP3 del legendario árbitro de la PDC Russ Bray (del 1 al 180) y mantener el audio original de Clemens Kuntze para la máxima visita de 180.
- **Decisión:**
  1. Se implementó y ejecutó `descargar.js` para recuperar los 180 audios MP3 oficiales en `audios_russ_bray/` y copiarlos a `public/sounds/russ_bray/` (3.67 MB, 181 archivos).
  2. Para las puntuaciones matemáticas imposibles en 3 dardos (176, 178 y 179) que arrojaban 404 en el servidor remoto, se crearon copias de seguridad de visita para blindar contra fallos en tiempo de ejecución.
  3. En `src/lib/sound-effects.ts`, `VoiceCaller.announceScore(score)` reproduce el archivo MP3 `/sounds/russ_bray/${score}.mp3` con fallback transparente a Web Speech API en caso de error, y reproduce `clemens-kuntze.mp3` para la visita perfecta de 180.
- **Motivo:** Calidad de audio idéntica a las retransmisiones oficiales de PDC y preservación del clip de Clemens Kuntze.

---

## ADR-015: Rol de Administrador Full (ICEMAN), Historial de Torneos y Banderas de Nacionalidad

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  1. El gestor de torneos requería un sistema de superadministración para `marianodeux@gmail.com` ("ICEMAN") y futuros administradores autorizados, con permisos para editar marcadores de cualquier partido, declarar victorias por Walkover (W.O.) si un jugador no se presenta, resetear partidas a 0-0 y eliminar/archivar torneos.
  2. En la vista de torneos debía separarse la tabla oficial de torneos activos de una pestaña dedicada para el Historial de Torneos con estadísticas consolidadas (Campeón, Subcampeón, Highest AVG, Highest Checkout, 180s y Mejor Pierna) y visualización del cuadro eliminatorio resuelto.
  3. Los perfiles de jugador y cuadros de juego debían incorporar selección de nacionalidad y visualización de la bandera oficial correspondiente.
- **Decisión:**
  1. **Control de Acceso Admin:** Se definió `ADMIN_EMAILS` en `src/lib/constants.ts` y la función `isUserAdmin()`. Si el usuario activo es administrador, se habilita `AdminMatchModal.tsx` con acciones de edición de legs, declaración de W.O. y reseteo.
  2. **Arquitectura de Torneos:** Se reestructuró `TournamentManager.tsx` en dos vistas de primer nivel: "Torneos Activos" (con tabla de torneos o estado vacío si no hay torneos creados) e "Historial de Torneos" (con visor de estadísticas y desarrollo de llave).
  3. **Nacionalidad y Banderas:** Se incorporó el catálogo oficial `COUNTRIES` con códigos ISO y banderas emoji, agregando `nationality` y `countryCode` en `PlayerProfile`, formulario en `RegisterAndProfile.tsx`, barra inferior en `AppSidebar.tsx` y tarjetas en `PlayerDirectory.tsx`.
- **Motivo:** Separación clara entre torneos en curso y archivo histórico, gobernanza completa de llaves para organizadores y representación federal e internacional fidedigna de los competidores.

---

## ADR-016: Arquitectura de Competición en 4 Modalidades, Modelo de Ligas y Bonificación Presencial x2

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  La plataforma requería estructurar las competiciones en 4 modalidades canónicas:
  1. Torneos de un día sin liga asociada (abiertos o relámpagos independientes).
  2. Torneos locales asociados a su respectiva Liga Local (ej. Liga Marplatense • Darderos MDQ) que acumulan puntos en dicha tabla.
  3. Torneos Nacionales regidos por una Única Liga Nacional Oficial de Argentina, de carácter clasificatorio para certámenes internacionales, con calendario online y fechas presenciales oficiales que duplican puntos (x2) para premiar la concurrencia a la sede.
  4. Modo de partida individual en el anotador que no altera fixtures de torneos ni tablas de ligas, computando exclusivamente en las estadísticas del jugador.
  Además, en el Directorio de Jugadores se requirió modelar tarjetas coleccionables (Ultimate Darts Cards) con 4 dimensiones de clasificación y ordenamiento dinámico.
- **Decisión:**
  1. **Tipos y Dominio (`types.ts`):** Se introdujeron `League`, `LeagueStanding`, `CompetitionMode` (`STANDALONE_DAY`, `LOCAL_LEAGUE`, `NATIONAL_LEAGUE`), `NationalStageType` (`ONLINE`, `PRESENCIAL_OFICIAL`) y `pointsMultiplier` en `Tournament`.
  2. **Persistencia y Datasets Oficiales (`storage.ts` y `constants.ts`):** `DEFAULT_LEAGUES` inicializa la Liga Nacional Oficial de Argentina (`league-national-argentina`) con aviso de clasificatoria internacional y la Liga Marplatense 2026 (`league-local-mdq`), con persistencia local (`getStoredLeagues` / `saveStoredLeagues`).
  3. **UI y Componentes:**
     * `CreateLeagueModal.tsx`: Permite a organizadores y clubes dar de alta ligas locales con sede, temporada y regla de duplicación en presenciales.
     * `LeagueManager.tsx`: Pestaña dedicada "Ligas & Posiciones" en `/torneos` que expone las tablas acumuladas de posiciones (PJ, Títulos, Podios, AVG 501, Puntos) y el switch entre ligas.
     * `TournamentManager.tsx`: Selector en la creación de torneo de las 3 modalidades, liga local de pertenencia y selector de fecha nacional (online vs presencial oficial con multiplicador x2).
     * `UltimateDartsCard.tsx` & `PlayerDirectory.tsx`: Tarjetas estilo FIFA Ultimate Team con insignia superior dinámica que conmuta según el ranking activo: Mayor AVG App, Liga Nacional, Liga Marplatense o Torneos Presenciales MDQ (2 fechas al año).
- **Motivo:** Coherencia federativa total, incentivo a la participación presencial oficial con puntaje doble y desacoplamiento limpio entre partidas casuales y competiciones oficiales.

---

## ADR-017: Jerarquía de Desempeño en Cartas Coleccionables (Liga/Torneo con Top 6), Remoción de Canción y Terminología Deportiva ("Leg")

- **Fecha:** 2026-10-10
- **Estado:** ACEPTADA
- **Contexto:**
  1. En la tarjeta coleccionable oficial (`UltimateDartsCard.tsx`), la visualización previa incluía una referencia a canción de entrada (*walkOnSong*) que no posee configuración en la ficha del jugador, robando espacio vertical valioso.
  2. El texto de la última competición disputada requería jerarquía estricta: debe priorizar la última mejor actuación en una Liga (Nacional o Local), y si el jugador no posee datos de liga, tomarla de un Torneo. Si el jugador se ubicó entre los primeros 6 (Top 6: puestos 1 al 6), se debe hacer mención explícita a dicho puesto con trofeo/icono honorífico (`#1 Campeón`, `#2 Subcampeón`, `#3 3er Puesto`, `#4 4to Puesto`, `#5 5to Puesto`, `#6 6to Puesto`).
  3. En Argentina, la comunidad practica el juego utilizando la terminología estándar en inglés: "Set", "Leg", "AVG", por lo que el vocablo "Pierna" debía ser completamente sustituido por "Leg".
  4. La cabecera de la Liga Nacional Oficial debía incorporar el logotipo oficial de Dardos Argentina (`/logos/dardos-argentina.png`), y las ligas y torneos locales el logotipo de Darderos Mar del Plata (`/logos/logo-mdq.png`).
- **Decisión:**
  1. **Remoción de Canción y Rediseño de Cápsula:** Se eliminó todo texto o mención a canción en la tarjeta. En el espacio liberado, se diseñó una cápsula de 2 líneas bajo el nombre (`width: 270px`, `height: 32px`) que exhibe sin truncamientos el puesto Top 6 y el nombre completo de la competición disputada.
  2. **Función `getPlayerPerformance`:** Implementa la jerarquía condicional: Liga Nacional > Liga Local > Torneo Oficial > Circuito Federado General, computando badges y textos vectoriales de esquina (#1 LIGA NACIONAL, #1 TORNEO OFICIAL).
  3. **Reemplazo Universal a "Leg":** Se sustituyó "Pierna" por "Leg" en todos los componentes del sistema (anotador, fichas, estadísticas históricas, comparativas PDC y modales).
  4. **Logos Federados Oficiales:** Se integró el logo de Dardos Argentina en `LeagueManager.tsx` y selector dinámico en `CreateLeagueModal.tsx` según el ámbito de la competición.
- **Motivo:** Máxima autenticidad y representatividad deportiva, legibilidad sin textos cortados y respeto riguroso por el léxico utilizado por los competidores en el circuito.

---

## ADR-018: Autoajuste de Cartas Coleccionables, Terminología "Diana", Banco Exclusivo de Russ Bray y Cierre Sugerido en el Anotador

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. En las Cartas Coleccionables (`UltimateDartsCard.tsx`), los nombres largos de jugadores desbordaban o tocaban los bordes de la tarjeta física. Se requirió que si el jugador carga dos nombres y apellido, la tarjeta muestre exclusivamente su primer nombre y apellido, autoajustando dinámicamente la escala tipográfica y el ancho SVG (`textLength="225"`, `lengthAdjust="spacingAndGlyphs"`). Asimismo, se aclaró la estadística "Career" (reemplazando el término en inglés por "TOTAL 180s").
  2. En toda la plataforma se reemplazó el vocablo "oche" por "Diana" conforme al uso de los clubes argentinos.
  3. En el motor de audio (`sound-effects.ts`), se erradicó al 100% la síntesis de voz femenina (`window.speechSynthesis`), dejando como árbitro exclusivo los audios MP3 originales de Russ Bray y Clemens Kuntze en el 180.
  4. En el tablero oficial 501 (`X01Board.tsx`), el cuadro central de 44px (`h-11`) reemplaza la etiqueta estática "Tirada" por la ruta de cierre sugerido oficial en tiempo real extraída de la tabla de comprardardos.com, removiendo la caja condicional externa inferior para evitar el desplazamiento vertical del teclado táctil.
  5. Se incorporó un botón de silenciar audios en la cabecera del marcador con persistencia.
  6. Al concluir la partida, el juego permanece en pantalla esperando la confirmación de salida ("FINALIZAR PARTIDA (EXIT)") sin bloquear el botón de deshacer para corregir cualquier tiro erróneo.
  7. Se estructuró un segundo panel de dimensiones idénticas para consultar las visitas y puntuaciones turno a turno de la partida en juego.
- **Decisión:** Implementada la función `formatCardPlayerName` con filtrado de apodos y nombres compuestos, autoajuste tipográfico en SVG, actualización de `sound-effects.ts`, integración de `getSuggestedCheckout` en el cuadro central de `X01Board.tsx` y adición de panel secundario de visitas.
- **Motivo:** Preservación milimétrica de las dimensiones del anotador en celulares, cero layout-shift al entrar en zona de cierre, fidelidad sonora profesional y diseño de tarjetas limpio sin desbordes.

---

## ADR-019: Doble Eliminación (Double Elimination Nakka Style), Historial en 4 Pestañas y Reglamento Federado de Fair Play

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Los torneos de dardos de alta competencia requieren la modalidad de Doble Eliminación (Double Elimination), donde un jugador derrotado en la llave principal (Winners) no queda fuera, sino que cae al cuadro de Perdedores (Losers) para disputar el camino de repesca hacia la Gran Final.
  2. Al estilo Nakka (n01), los organizadores necesitaban poder configurar legs específicos e independientes para cada instancia (Cuartos, Semifinales, Final de Ganadores, Rondas de Perdedores, Final de Perdedores y Gran Final), y para ligas configurar el número de zonas, jugadores por grupo, clasificados a playoffs, ida y vuelta y desempate por diferencia de legs.
  3. En las fichas deportivas de los jugadores, era necesario separar y categorizar su historial de participación en 4 dimensiones claramente delimitadas: Partidas Individuales (retos/práctica), Torneos de un Día (copas/relámpagos sin liga), Ligas Locales (fechas presenciales en sede y fechas online) y Liga Nacional Oficial (fechas online 1x vs fechas presenciales oficiales con doble puntaje ⚡ x2).
  4. Se requería consolidar una sección pública oficial de "Reglamento Oficial, Código de Conducta & Fair Play" que detalle las medidas físicas de la diana (1.73m al Bullseye, 2.37m a la línea de tiro), el cómputo de puntos por modalidad, las pautas de etiqueta en el oche, los requisitos técnicos de cámara e iluminación para partidas online, y el protocolo de Walkover (10 min) y desconexión (5 min).
- **Decisión:**
  1. **Motor de Doble Eliminación (`types.ts`, `TournamentManager.tsx`, `TournamentBracket.tsx`):**
     * Se incorporó `bracketType: 'WINNERS' | 'LOSERS' | 'FINALS'` y `RoundLegsConfig`.
     * Se implementó `generateDoubleEliminationBracket()` generando la estructura completa de Winners (R1, R2, R3), Losers (R1, R2, R3) y Gran Final.
     * `TournamentBracket.tsx` añade pestañas interactivas de visualización: [Ver Todo], [Ganadores (Por Arriba)], [Perdedores (Por Abajo)] y [Gran Final].
  2. **Configuración de Legs por Instancia & Zonas:**
     * En el modal de creación de torneos se añadió un acordeón estilo Nakka con campos numéricos para cada fase eliminatoria y selector para definir parámetros de zonas de liga.
  3. **Historial en 4 Pestañas (`PlayerDetailModal.tsx`):**
     * Selector interactivo de 4 pestañas con badges especializados, métricas calculadas in-situ (ranking, puntos, eficacia, AVG específico) y listado de encuentros con etiquetas de modalidad (Online, Presencial Sede, ⚡ x2 Presencial Oficial).
  4. **Página Oficial de Reglamento (`/reglamento`):**
     * Creada la vista pública `/reglamento` en 5 capítulos navegables con jump links, vinculada en el footer, barra lateral y modales de jugador.
- **Motivo:** Alineación completa con las normativas internacionales de dardos, total transparencia en la asignación de puntos federados y una experiencia de gestión de torneos idéntica al estándar de oro de la disciplina.

---

## ADR-020: Configuración Detallada por Instancia de Llave (Solo Legs vs Sets + Legs), Scroll Universal y Cámara Pop-out para 2ª Pantalla

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Se eliminó cualquier referencia a nombres externos en la interfaz, estableciendo la denominación soberana "Configuración detallada por instancia de llave".
  2. En torneos profesionales coexisten partidas disputadas a distancia directa en Legs (ej: al mejor de 5 legs, primero a 3) y partidas por Sets (estándar PDC, ej: al mejor de 3 o 5 sets, requiriendo ganar X legs por set). Se requería que las etiquetas especificaran claramente qué representan los números cargados y permitieran conmutar y configurar la cantidad de sets y legs por set.
  3. El modal de creación de torneos sufría de un bloqueo de desplazamiento vertical en pantallas compactas y dispositivos móviles.
  4. Para partidas con cámara, se seleccionó la Opción 1: Pop-out Window desacoplada para computadoras con 2 pantallas / TV del club, complementada con alternancia automática y switch manual en celulares según el turno de tiro, preservando milimétricamente las dimensiones del teclado ergonómico de 5 columnas.
- **Decisión:**
  1. **Tipado y Motor de Torneos (`types.ts`, `TournamentManager.tsx`, `TournamentBracket.tsx`):**
     * Se amplió `RoundLegsConfig` con `distanceMode?: 'LEGS' | 'SETS'` y `legsPerSet?: number`.
     * `TournamentBracketMatch` incorpora `distanceMode`, `setTarget`, `scoreSetsP1` y `scoreSetsP2`.
     * El selector interactivo conmuta entre `[🎯 Solo Legs]` y `[🏆 Sets + Legs]`. Las etiquetas de cada ronda indican dinámicamente si se configuran Sets o Legs con la leyenda explícita `1º a X`.
     * En el cuadro eliminatorio se visualizan badges dorados con la distancia del match y marcadores de sets ganados (`scoreSetsP1` S / `scoreSetsP2` S).
  2. **Corrección de Scroll del Modal:**
     * Se desacopló el contenedor exterior con `overflow-y-auto` y el formulario con `my-auto max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y`, garantizando scroll fluido con rueda de ratón y gesto táctil.
  3. **Cámara Opción 1 (Pop-out 2ª Pantalla + Celular):**
     * Creación de la ruta `src/app/anotador/camara-popout/page.tsx`: ventana emergente con streaming WebRTC de la webcam a pantalla completa, controles de zoom, espejo y selector de dispositivo, enlazada vía `matchBroadcast` con un banner televisivo inferior estilo PDC (puntuaciones gigantes, sets, legs, promedios, último dardo tirado e indicador de tirador activo).
     * En `X01Board.tsx`: botón `[🖥️ Pop-out 2ª Pantalla]` (`window.open`), botón `[📹 Diana Rival]` para móviles, alternancia automática al cambiar de turno y sincronización continua dardo a dardo sin alterar el teclado de 5 columnas.
- **Motivo:** Cumplimiento estricto de las directivas de soberanía de marca, soporte reglamentario para los dos formatos de competición de dardos (Legs y Sets), usabilidad móvil intacta y arquitectura multi-pantalla profesional sin dependencias externas pesadas.

---

## ADR-021: Torneos Arancelados vs Gratuitos, Cálculo Automático 60-30-10, Modal de Pago con WhatsApp y Módulo Institucional Asociación

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Los organizadores requerían indicar si un torneo requiere inscripción con dinero o si es gratuito.
  2. Si el torneo es arancelado, el pozo total de premios se debía calcular automáticamente en función del cupo máximo y el valor de la inscripción ($Cupo \times Inscripción$), preservando la potestad de editar manualmente el valor del pozo si el club retiene porcentaje o suma sponsors. Al mismo tiempo, el sistema debía calcular y previsualizar en tiempo real el desglose de premios oficial: **60% al 1º, 30% al 2º y 10% al 3º**.
  3. Al momento de inscribirse en un torneo con arancel, se debía desplegar un modal con los datos bancarios de la cuenta oficial de la Asociación donde transferir (Alias, CBU, Titular, Banco, CUIT) y la instrucción explícita de enviar el comprobante por WhatsApp al administrador designado (con botón de enlace directo a WhatsApp con mensaje pre-armado).
  4. Se requería consolidar una sección aparte ("Asociación" en `/asociacion`) para definir y exhibir a las autoridades de **La Asociación de Dardos Mar del Plata** y **Dardos Argentina**, mostrando sus fotos de perfil oficiales (las mismas elegidas por los jugadores en la plataforma), sus cargos en la Comisión Directiva, y habilitando su administración y la configuración de los datos bancarios exclusivamente desde la cuenta de Administrador (ICEMAN `marianodeux@gmail.com`).
- **Decisión:**
  1. **Tipado y Storage (`types.ts`, `storage.ts`, `constants.ts`):**
     * `Tournament` incorpora `isPaid?: boolean` y `prizesBreakdown?: { first: number; second: number; third: number }`.
     * Se crearon los tipos `AssociationScope` ('MDQ' | 'ARGENTINA'), `AssociationAuthority` y `AssociationBankAccount`.
     * `DEFAULT_ASSOCIATION_AUTHORITIES` inicializa la Comisión Directiva de Mar del Plata y Dardos Argentina (con Mariano Deux como Presidente con su foto de perfil y autoridades designadas).
     * `DEFAULT_ASSOCIATION_BANK_ACCOUNT` define los datos bancarios oficiales del Banco Provincia (Alias: `DARDOS.MDQ.OFICIAL`) y WhatsApp de ICEMAN.
     * Métodos de persistencia: `getStoredAssociationAuthorities`, `saveStoredAssociationAuthorities`, `getStoredAssociationBankAccount` y `saveStoredAssociationBankAccount`.
  2. **Formulario de Creación de Torneo (`TournamentManager.tsx`):**
     * Switch interactivo: `[🎉 Gratuito (Sin Costo)]` vs `[💰 Con Inscripción ($ ARS)]`.
     * Si es arancelado: auto-cálculo `newPrizePool = newMaxParticipants * newEntryFee` con input editable y tarjetas en tiempo real para 1º (60%), 2º (30%) y 3º (10%).
  3. **Acreditación y Pagos (`PlayerEnrollModal.tsx`):**
     * Si el torneo tiene costo, muestra los datos bancarios oficiales con botones de copia de CBU y Alias, y botón verde directo de WhatsApp con mensaje completo pre-redactado dirigido al administrador.
  4. **Página Oficial de la Asociación (`src/app/asociacion/page.tsx`):**
     * Pestañas para Asociación Mar del Plata y Dardos Argentina.
     * Grilla de autoridades con foto de perfil de jugador, cargo oficial, club y localidad.
     * Sección de datos bancarios institucionales.
     * Modal administrativo exclusivo para ICEMAN para sumar/editar autoridades (vinculando jugadores registrados) y actualizar cuentas bancarias.
  5. **Navegación (`AppSidebar.tsx`):**
     * Enlace oficial agregado a `/asociacion` con badge "SEDE".
- **Motivo:** Transparencia económica y deportiva en la recaudación de torneos, automatización del cómputo de premios federados, agilidad en la confirmación de inscriptos vía WhatsApp y consolidación de la personería institucional de la Asociación de Mar del Plata y Dardos Argentina.




---

## ADR-022: Limpieza Integral de Datos de Prueba, Tarjeta Coleccionable con Backdrop Fotográfico Unificado y Configuración Exclusiva de ICEMAN

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. La plataforma acumulaba jugadores ficticios ('rank-1', 'user-mdq-001', 'Sniper', etc.), torneos mock de prueba y ligas simuladas que debían erradicarse por completo antes del lanzamiento oficial a producción.
  2. Como único usuario configurado en la base de datos debe figurar exclusivamente Mariano Deux (ICEMAN), emparentado a su cuenta de administrador oficial (`marianodeux@gmail.com`), con su foto oficial y su logo personal cargados desde los recursos físicos.
  3. Los atributos competitivos de ICEMAN deben fijarse en: AVG oficial de 48.0 (tanto en `estimatedAvg`, `overallAvg` y `first9Avg`) y todas las métricas de "TOTAL" (180s cantados, partidos disputados, piernas ganadas) en 0.
  4. En la Tarjeta Coleccionable (`UltimateDartsCard.tsx`), se requería establecer el mismo fondo de foto uniforme e idéntico para todos los jugadores (un backdrop de estudio deportivo con iluminación focal sobre el que se recorta la silueta), exhibir el logo personal del jugador de forma muy pequeña y refinada en la esquina superior derecha, e indicar explícitamente en la configuración del perfil que la foto debe ser en formato PNG con fondo transparente.
- **Decisión:**
  1. **Recursos de Marca e Imagen:**
     * Se copiaron los archivos de `D:\Locos por los dardos\Recursos`:
       - `Iceman Perfil.png` -> `public/images/iceman-perfil.png` (477 KB).
       - `Logo ICEMAN.png` -> `public/logos/logo-iceman.png` (6.69 MB) y versión optimizada de alta fidelidad `public/logos/logo-iceman-card.png` (90 KB).
  2. **Erradicación de Mocks en Capa de Datos:**
     * `src/lib/constants.ts`: `MOCK_RANKINGS` reducido únicamente a `[USER_ICEMAN]`. `DEFAULT_LEAGUES` vaciado a `[]`. `DEFAULT_ASSOCIATION_AUTHORITIES` conservando solo a Mariano Deux (Presidente MDQ y Presidente Nacional de Dardos Argentina) con su foto oficial `/images/iceman-perfil.png`.
     * `src/lib/players-data.ts`: `CANONICAL_PLAYERS` reducido exclusivamente a Mariano Deux (ICEMAN) con AVG 48.0 y TOTAL 0.
     * `src/components/jugadores/PlayerDirectory.tsx`: Eliminado el array estático de 10 jugadores; ahora consume directamente `CANONICAL_PLAYERS`.
     * `src/components/torneos/TournamentManager.tsx` y `TournamentGroupStage.tsx`: Eliminados los torneos y partidos precargados ficticios; se inicializan en listas limpias (`[]`) con empty states explicativos para cuando se disputen certámenes reales.
  3. **Tarjeta Coleccionable (`UltimateDartsCard.tsx`):**
     * **Backdrop Unificado:** Implementado un gradiente radial de estudio deportivo (`photoBackdropId`) con iluminación focal y halo de estadio centrado detrás de la silueta fotográfica, garantizando que cualquier foto recortada con fondo transparente luzca homogénea y profesional al estilo PDC.
     * **Logo Pequeño Oficial:** Renderizado de una cápsula circular con relieve (`34x34 px`) en la esquina superior derecha (`x="270" y="36"`) que exhibe el logo de ICEMAN (`logo-iceman-card.png`).
     * **Desempeño en 0:** `getPlayerPerformance` adaptado para reconocer el estado inicial limpio, mostrando `👑 SUPERADMINISTRADOR • ASOCIACIÓN DARDEROS MDQ` sin inventar torneos inexistentes.
  4. **Perfil del Jugador (`RegisterAndProfile.tsx`):**
     * Incorporación de aviso destacado y obligatorio: *"Requisito Obligatorio: Para que tu silueta se integre sobre el fondo oficial de la tarjeta de jugador, la foto debe tener fondo transparente (formato PNG sin fondo)."*
     * Blindaje contra división por cero en ratio de victorias ante 0 partidos jugados.
     * Reemplazo de la tabla estática de evolución de AVG por un panel inicial limpio que invita a disputar los primeros partidos.
- **Motivo:** Plataforma 100% limpia para producción, con identidad personal soberana para el administrador, estética coleccionable impecable y cero datos residuales de prueba.


---

## ADR-023: Configuración de Equipamiento de Dardos (Marca y Peso) en Perfil y Aislamiento Estricto de Sesión

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. En la tarjeta coleccionable oficial (`UltimateDartsCard.tsx`) se visualizan de forma prominente la marca/modelo de los dardos (`DARTS`, ej: TARGET 90%) y el gramaje (`WEIGHT`, ej: 24 grams), pero en el formulario de configuración del perfil (`RegisterAndProfile.tsx`) no existían campos para que el jugador personalize sus dardos.
  2. Se requería cerciorar y transparentar el modelo de seguridad del perfil: la ruta `/perfil` debe operar exclusivamente sobre la sesión local y la cuenta autenticada del usuario, impidiendo que modifique las fichas de los demás jugadores (las cuales son de solo lectura en `/jugadores` y cuadros de torneos).
- **Decisión:**
  1. **Tipado y Estado:**
     * Se añadió la propiedad `dartBrand?: string;` al modelo `PlayerProfile` en `src/lib/types.ts`.
     * Se incorporó el estado `dartBrand` y `preferredWeight` sincronizado en `RegisterAndProfile.tsx`.
  2. **Interfaz de Equipamiento de Dardos:**
     * Se diseñó la sección *"Equipamiento Oficial de Dardos"* en el formulario de edición con:
       - Input de texto para marca/modelo (`dartBrand`) con botones de acceso rápido para marcas líderes (`TARGET 90%`, `WINMAU 90%`, `HARROWS 90%`, `RED DRAGON`, `UNICORN`).
       - Slider interactivo y visor numérico de gramaje (`preferredWeight`, de 16g a 32g con paso de 0.5g).
       - Textarea para biografía y presentación deportiva (`bio`).
     * Ambos datos se propagan en tiempo real a la carta coleccionable oficial (`currentUserCardData`).
  3. **Aislamiento de Sesión:**
     * Se removió el botón provisional de login simulado (`Login ICEMAN`) para que la sesión de `/perfil` sea 100% fiel al usuario autenticado, blindando la cuenta de administrador.
- **Motivo:** Coherencia total entre la tarjeta coleccionable y el panel de configuración del jugador, y estricta integridad en la edición de datos propios.

---

## ADR-024: Estrategia Network-First en Service Worker, Blindaje Anti-Layout Shift y Ocultamiento Preventivo de Tienda

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Tras sucesivos despliegues en Vercel, el Service Worker v1 que implementaba `Cache-First` para páginas HTML servía documentos en caché con enlaces a archivos CSS cuyos hashes ya habían cambiado en el servidor de producción, provocando que la página se renderizara sin estilos (fondo blanco, letra Times New Roman) y que las imágenes sin dimensiones inline fijas se mostraran a escala nativa (2500x2500px).
  2. El usuario requirió ocultar momentáneamente la sección de la Tienda de toda la navegación hasta definir el modelo comercial y los productos definitivos.
- **Decisión:**
  1. **Service Worker v2:** Se migró `public/sw.js` a versión `locos-dardos-v2` estableciendo una política obligatoria `Network-First` para peticiones de navegación (`event.request.mode === 'navigate'`). En `activate`, se eliminan todos los cachés antiguos de forma inmediata, y en `providers.tsx` se fuerza la purga de `locos-dardos-v1`.
  2. **Blindaje de Avatares:** Se aplicaron dimensiones inline estrictas (`width: 112px, height: 112px, overflow: hidden`) en el contenedor de avatar de `RegisterAndProfile.tsx` y fallback seguro a `/images/iceman-perfil.png`. En `storage.ts`, se incorporó auto-migración de perfiles viejos guardados en `localStorage`.
  3. **Ocultamiento de Tienda:** Se removieron los accesos visibles en `AppSidebar.tsx`, `AppBottomNav.tsx` (reemplazado por `Jugadores`), `Navbar.tsx`, `Footer.tsx` y la Card 4 de la landing (`page.tsx`), manteniendo intacta la lógica e integración de Mercado Pago en la base de código.
- **Motivo:** Garantía absoluta de carga de estilos CSS en cada despliegue, eliminación de desbordes visuales y respeto del roadmap comercial.

---

## ADR-025: Audio Bidireccional y Micrófono en Tiempo Real para Partidas Online

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  En las partidas de dardos a distancia, los contrincantes necesitan comunicarse por voz en tiempo real para cantar los tiros, acordar decisiones de diana y recrear la interacción presencial del club.
- **Decisión:**
  1. **Captura WebRTC:** En `X01Board.tsx` y `camara-popout/page.tsx`, se habilitó la captura de audio en `getUserMedia` configurada con:
     - `echoCancellation: true` (evita acoples acústicos con los anuncios del árbitro Russ Bray).
     - `noiseSuppression: true` (filtra el sonido ambiente y ventiladores).
     - `autoGainControl: true` (nivela la potencia del micrófono).
  2. **Controles Táctiles y Detección de Voz:**
     - Botón de conmutación de micrófono (Mute / Unmute) en la cabecera del marcador oficial y en la barra de cámara.
     - Analizador de espectro acústico en tiempo real (`AudioContext` + `AnalyserNode`) que activa un badge luminoso y pulsante (`[🎙️ Hablando]`) cuando el usuario está hablando.
- **Motivo:** Conversación fluida y nítida entre rivales, cero acople con los efectos del marcador y feedback visual instantáneo del estado de la voz.

---

## ADR-026: Blindaje de Seguridad para Administrador ICEMAN, P1 Inmutable y Arquitectura de Salas Online 1 vs 1

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. **Seguridad Crítica:** El modal de Onboarding obligatorio contenía un botón libre y público ("Iniciar sesión como ICEMAN") que permitía a cualquier usuario o visitante anónimo asumir los privilegios y la identidad del Superadministrador Mariano Deux.
  2. **Identidad en el Anotador:** El Jugador 1 debe corresponder obligatoriamente y por defecto al competidor actualmente logueado en la aplicación, mientras que el Jugador 2 debe permitir escoger entre los jugadores oficiales registrados en la comunidad, bots de entrenamiento o invitados casuales.
  3. **Partidas Online Conectadas:** Para disputar partidas a distancia de forma ordenada, la aplicación requería un sistema de salas online donde dos jugadores logueados puedan vincularse, intercambiar tiradas en tiempo real dardo a dardo y mantener el audio bidireccional activo.
- **Decisión:**
  1. **Blindaje de Acceso Administrativo:**
     - Se erradicó el botón público en `OnboardingProfileModal.tsx`.
     - Se implementó un modal protegido por contraseña maestra administrativa (`ADMIN_MASTER_PASSWORD`), validando estrictamente en `src/lib/constants.ts` que el email corresponda a `marianodeux@gmail.com` mediante `validateAdminCredentials`.
  2. **Asignación de P1 y P2 en el Anotador (`MatchGameSettings.tsx`):**
     - P1 inicializado estrictamente como `getCurrentPlayerProfile()` (marcado con el badge `[Tú (Logueado)]` e inmutable).
     - P2 configurable con un selector intuitivo que expone a los jugadores de la Comunidad Oficial (`CANONICAL_PLAYERS` e `ICEMAN`), bots con 4 dificultades de AVG (40, 55, 70 y 85) e invitado.
  3. **Motor y API de Salas Online 1 vs 1:**
     - Se implementó el módulo de gestión en memoria de servidor `src/lib/online-rooms.ts` y la ruta de API `src/app/api/salas/route.ts` con acciones `CREATE`, `JOIN`, `THROW` y sondeo automático con purga de salas inactivas (4 horas).
     - Se creó el modal interactivo `OnlineRoomModal.tsx` con generación de código aleatorio (`DART-XXXX`), enlace directo compartible y botón de invitación a WhatsApp con texto pre-armado.
     - En `X01Board.tsx`, se implementó polling adaptativo (cada 1.2s cuando es el turno del oponente) y envío inmediato de tiradas locales vía POST a la API, bloqueando el teclado al esperar al rival y reproduciendo el canto oficial de Russ Bray tan pronto como la diana rival impacta.
- **Motivo:** Eliminación total de la vulnerabilidad de suplantación de identidad administrativa, máxima coherencia en la autoría de partidas personales y experiencia multijugador online fluida sin dependencias externas complejas.

---

## ADR-027: Arquitectura Híbrida WebRTC P2P + Normalización de Códigos para Salas Online en Vercel Serverless

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Al desplegar en producción en Vercel Serverless, dos jugadores conectándose desde dispositivos distintos (por ejemplo, Host en PC y Rival en celular) caen en instancias de Lambda independientes de AWS, por lo que el almacén de memoria en proceso (`globalThis.__LPLD_ONLINE_ROOMS__`) no se comparte entre contenedores serverless.
  2. En dispositivos móviles, los usuarios ingresan o autocompletan códigos con espacios (ej: `DART - RYZD`), lo cual provocaba que la búsqueda exacta fallara con el mensaje `"La sala especificada no existe o ya caducó"`.
- **Decisión:**
  1. **Normalización Inteligente de Códigos:**
     - Se creó `normalizeRoomCode` en `src/lib/online-rooms.ts` que elimina cualquier espacio en blanco (`\s+`), convierte a mayúsculas y añade el prefijo `DART-` automáticamente si solo se ingresan las 4 letras (`RYZD` -> `DART-RYZD`).
     - En `OnlineRoomModal.tsx`, el `<input>` sanitiza el valor en tiempo real, bloqueando la inserción de espacios.
  2. **Conexión P2P Directa vía WebRTC con PeerJS (`src/lib/webrtc-room.ts`):**
     - Se implementó un canal WebRTC DataChannel directo entre ambos navegadores mediante PeerJS (`0.peerjs.com` y servidores STUN de Google).
     - El Host crea el peer con ID predecible `lpld-sala-${code}` y el Guest se conecta directamente.
     - Intercambio de tiradas en milisegundos (< 30ms) y audio de voz P2P sin tocar ningún servidor ni base de datos.
     - Se mantiene el endpoint REST `/api/salas` como canal redundante de respaldo.
- **Motivo:** Garantiza conectividad instantánea 100% confiable entre cualquier combinación de dispositivos (PC, Android, iOS) sobre Vercel sin dependencias de base de datos externas y con tolerancia absoluta a errores tipográficos de espacio.

---

## ADR-028: Enlace Reactivo de Eventos WebRTC P2P en el Tablero y Configuración de Cámara Trasera por Defecto en Celulares

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Durante una partida en vivo entre Florencia (celular) y Mariano Deux (PC) en la sala `DART-P3B5`, ambos jugadores lograron conectarse exitosamente a la sala online. Sin embargo, al registrar una anotación de 180 en el celular de Florencia, el puntaje bajó localmente a 321 y su pantalla quedó esperando el tiro de Mariano, pero la pantalla de la PC de Mariano no avanzó.
  2. La causa raíz fue que el callback de `onThrowReceived` de WebRTC quedó inicializado como función vacía `() => {}` en el modal y nunca se vinculó con la función `submitScore` del tablero `X01Board.tsx`.
  3. En celulares, los jugadores necesitan enfocar la diana física con la cámara trasera por defecto, con opción de alternar a la delantera si desean verse ellos mismos.
- **Decisión:**
  1. **Enlace Reactivo de Tiros WebRTC (`setWebRtcThrowListener`):**
     - Se implementó un dispatcher global en `src/lib/webrtc-room.ts` y se suscribió en `X01Board.tsx` dentro de un `useEffect`. Al recibir el evento `THROW` por el DataChannel P2P, ejecuta inmediatamente `submitScore(score, true)`, actualizando el marcador, reproduciendo el canto oficial de Russ Bray y transfiriendo el turno al jugador local en menos de 30 milisegundos.
  2. **Cámara Trasera por Defecto y Switch Interactivo:**
     - Se configuró `facingMode: { ideal: 'environment' }` en `getUserMedia` para activar la lente trasera apuntando a la diana en smartphones.
     - Se incorporó el botón `[📷 Trasera (Diana) / 🤳 Delantera]` (`SwitchCamera`) con reinicio suave de tracks para conmutar en caliente.
- **Motivo:** Flujo de juego online ininterrumpido sin bloqueos de turno y ergonomía visual óptima para enfocar tableros físicos desde celulares.

---

## ADR-029: Doble Diana Split-Screen en Vivo (Estilo Nakka N01), Servidores TURN OpenRelay TCP 443 y Locución Sincronizada de Russ Bray

- **Fecha:** 2026-10-11
- **Estado:** ACEPTADA
- **Contexto:**
  1. Durante pruebas en salas online entre un celular en red móvil 4G+ (CGNAT) y una PC en red Wi-Fi hogareña, la conexión WebRTC P2P con solo servidores STUN de Google era bloqueada por el NAT simétrico de las compañías de telefonía celular argentinas.
  2. La vista de cámara anterior únicamente mostraba la webcam local en lugar de recibir la cámara del rival, impidiendo ver ambas dianas en vivo como en Nakka N01 Darts (`n01darts.com`).
  3. Los puntos cantados por el referee (Russ Bray) deben sonar en el parlante del contrincante en vivo para enterarse de la puntuación incluso si no se dispone de cámara.
  4. La tarjeta comunitaria principal de la landing page requería la foto de la comunidad de `Darderos Mar del Plata` de fondo con cuadros interiores 90% transparentes con `backdrop-blur`.
- **Decisión:**
  1. **Configuración WebRTC con Servidores TURN Públicos (OpenRelay TCP 443):**
     - Se incorporaron en `PEER_CONFIG` los servidores TURN de `relay.metered.ca` con transporte TCP en puertos 80 y 443. Esto permite atravesar cualquier firewall y NAT simétrico de operadoras móviles (Claro, Personal, Movistar).
  2. **Streaming P2P Bidireccional de Cámaras & Doble Diana (Split-Screen estilo Nakka N01):**
     - En `webrtc-room.ts` se integró el método `sendMediaStream(stream)` y la gestión de llamadas `peer.call` / `peer.on('call')` para transmitir el video de la diana local y recibir el stream remoto del contrincante.
     - En `X01Board.tsx` se diseñó el panel simétrico de Doble Diana:
       * Panel Izquierdo: Diana del Jugador 1 con badge de estado y halo luminoso cuando es su turno.
       * Panel Derecho: Diana del Jugador 2 con badge de estado y halo luminoso cuando es su turno.
       * Controles en caliente de alternancia de cámara (Trasera/Frontal) y micrófono con indicador de habla.
  3. **Locución Inmediata de Russ Bray para Ambos Jugadores:**
     - En el listener de tiradas P2P, al impactar los dardos del rival, se dispara de inmediato el audio oficial de Russ Bray (`VoiceCaller.speakScore(score)` y `SoundEngine.play180()` si es 180), asegurando que el contrincante escuche el puntaje por sus parlantes en tiempo real.
  4. **Fondo de la Comunidad Darderos MDQ en Landing Page:**
     - Se copió `Darderos.jpeg` a `public/images/darderos.jpeg` y se aplicó como fondo de la sección 2 de `src/app/page.tsx` con overlay oscuro y cuadros interiores al 90% de transparencia (`bg-black/10 backdrop-blur-md`).
- **Motivo:** Replicar la ergonomía profesional de Nakka N01 Darts con latencia mínima (< 25ms), máxima robustez en redes móviles 4G y homenaje visual a la comunidad de Darderos Mar del Plata.

---

## ADR-030: Persistencia Federada en Supabase PostgreSQL & API de Jugadores y Auth

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. Anteriormente la plataforma guardaba los registros de nuevos jugadores únicamente en el `localStorage` del navegador local. Esto provocaba que si un jugador (ej: Gabriel Rubio "ZEUS") se registraba en su teléfono celular, dicho usuario no existía en el servidor ni aparecía en el Directorio Federal (`/jugadores`) para otros competidores en sus computadoras o celulares.
  2. Tampoco existía una función de cierre de sesión real (`LogOut`), ni un selector para cambiar de usuario o recuperar cuentas registradas en la nube.
- **Decisión:**
  1. **Conexión Directa a Supabase (`src/lib/db.ts`):** Se configuró conexión directa mediante `pg.Pool` con SSL (`rejectUnauthorized: false`) al servidor PostgreSQL de Supabase (`db.pufyeabrvrlikbgkjplz.supabase.co:5432/postgres`).
  2. **Migración de Tablas:** Se añadieron a `profiles` las columnas faltantes: `photo_url`, `logo_url`, `nationality`, `country_code`, `dart_brand`, `major_title`, `club`, `association_role`, `age`.
  3. **Endpoints Backend:**
     - `GET & POST /api/jugadores`: Lectura consolidada con `JOIN` de `profiles`, `player_stats` y `users`, y `UPSERT` en la nube al registrarse o modificar perfiles.
     - `POST /api/auth`: Búsqueda instantánea de jugadores por email o apodo para inicio de sesión en 1-click.
  4. **Componente `LoginModal.tsx` & Storage:**
     - En `storage.ts`, `saveCurrentPlayerProfile` persiste en `localStorage` y envía asíncronamente un `POST` a `/api/jugadores`.
     - `clearCurrentPlayerSession` limpia el perfil y abre el modal de login con lista de cuentas en la nube y login administrativo.
- **Motivo:** Garantizar que ningún usuario quede atrapado en un navegador local, posibilitando una comunidad federada en tiempo real entre múltiples dispositivos.

---

## ADR-031: Selección Táctil de Categorías 1-Click, Sincronización Bidireccional de AVG y Gestión desde Superadmin

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. En `/perfil`, el esquema oficial de categorías era puramente ilustrativo (tarjetas estáticas sin eventos clickeables), y en el formulario de edición la categoría estaba atada forzosamente al slider de AVG sin permitir forzar o cambiar la categoría deportiva deseada.
  2. En dispositivos móviles, el usuario no tenía ningún botón claro para cambiar su categoría en 1-click.
  3. El Superadministrador requería poder visualizar a todos los jugadores registrados en la base de datos y cambiar la categoría de cualquiera de ellos directamente desde su panel.
- **Decisión:**
  1. **Interactividad 1-Click en Esquema de Categorías (`RegisterAndProfile.tsx`):**
     - Las 4 tarjetas (Principiante, Intermedia, Avanzada, Elite Pro) se convirtieron en botones táctiles interactivos con feedback visual verde inmediato (`handleQuickCategoryChange`), ajustando armónicamente el AVG sugerido y guardando en `localStorage` y en la base de datos de Supabase.
     - Se añadió un badge de categoría interactivo en la cabecera que realiza scroll suave al esquema con foco visual.
  2. **Sincronización Bidireccional en Formulario:**
     - Al deslizar el slider de AVG se actualiza de inmediato `selectedCategory = calculateCategory(val)`.
     - Al presionar cualquiera de los 4 botones de categoría manual, el slider salta al promedio estándar de la categoría seleccionada (35.0, 48.0, 62.0, 75.0 AVG).
  3. **Padrón de Jugadores en Panel de Superadmin (`src/app/superadmin/page.tsx`):**
     - En la pestaña de Demografía se incorporó la tabla de jugadores en tiempo real desde Supabase con selector `<select>` para modificar la categoría de cualquier usuario con un click y guardar en la base de datos.
- **Motivo:** Ergonomía táctil inmediata para teléfonos móviles y flexibilidad total tanto para el jugador como para las autoridades federadas.

---

## ADR-032: Corrección de Región de Pooler Supabase (us-east-1), Último Jugador en Dispositivo y PWA Móvil

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. Durante la auditoría técnica de producción se detectó que el pooler de Supabase arrojaba el error `(ENOTFOUND) tenant/user postgres.pufyeabrvrlikbgkjplz not found`. El diagnóstico reveló que el proyecto fue provisionado en North Virginia (`aws-0-us-east-1`) y no en São Paulo (`aws-0-sa-east-1`).
  2. Al realizar logout, la aplicación borraba toda la información del dispositivo, forzando a reescribir credenciales o perfiles en lugar de presentar al último jugador logueado en ese equipo.
  3. En teléfonos celulares no existía un botón visible de instalación como PWA.
  4. La modificación de categoría desde el Superadmin sobreescribía con valores por defecto campos como bio, teléfono y dardos del jugador al enviar payloads parciales al `POST`.
- **Decisión:**
  1. **Redirección y Estabilización de Pooler (`src/lib/db.ts`):** Prioridad a `DATABASE_URL` (puerto 6543) con auto-corrección de host hacia `aws-0-us-east-1.pooler.supabase.com`.
  2. **Endpoint `/api/health/db`:** Verificación activa de latencia y estado de PostgreSQL.
  3. **Actualización Quirúrgica (`PATCH /api/jugadores`):** Uso de `COALESCE` en queries de actualización y método `PATCH` para categorías.
  4. **Persistencia de Dispositivo (`storage.ts` & `LoginModal.tsx`):** Claves `lpld_last_player_v1` y `lpld_recent_accounts_v1` preservadas tras logout con tarjeta destacada "Último jugador en este celular" para ingreso en 1-click.
  5. **Instalación PWA (`InstallAppButton.tsx` & `providers.tsx`):** Contexto global `useInstallPwa` y botón permanente en barra lateral con guía interactiva para iPhone y Android.
- **Motivo:** Eliminar errores de conexión en la nube, blindar los datos de los jugadores ante ediciones parciales y garantizar acceso offline y móvil de nivel profesional.

---

## ADR-033: Autenticación Passwordless Híbrida (Magic Link + OTP de 6 Dígitos) con Supabase Auth

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. El usuario seleccionó **Magic Link** como el método oficial de autenticación para la plataforma, buscando erradicar contraseñas débiles y recuperar cuentas sin fricción.
  2. En el contexto de una PWA instalada en teléfonos celulares, el Magic Link tradicional presenta el riesgo de que el sistema operativo (iOS/Android) abra una nueva pestaña del navegador externo (Chrome/Safari) al hacer clic en el enlace desde Gmail, perdiendo la vista inmersiva de pantalla completa.
- **Decisión:**
  1. **Instalación de SDK Oficial:** Incorporación de `@supabase/supabase-js` y creación del cliente central `src/lib/supabase.ts` con persistencia de sesión en `localStorage` y refresco automático.
  2. **Esquema Híbrido Magic Link + Código OTP:**
     - Al ingresar el email, `supabase.auth.signInWithOtp` envía un correo con el botón de acceso directo Y un código de 6 dígitos numéricos.
     - La interfaz de `LoginModal.tsx` ofrece un campo táctil con auto-enfoque para que el jugador ingrese el código de 6 números directamente desde la notificación sin salir de la PWA.
  3. **Ruta de Callback (`src/app/auth/callback/page.tsx`):**
     - Si el usuario opta por cliquear el enlace de su correo, la ruta de callback intercepta la sesión y sincroniza automáticamente su perfil deportivo federado (`profiles`).
  4. **Superadmin Blindado:**
     - Mariano Deux (`marianodeux@gmail.com`) cuenta con autenticación garantizada mediante Magic Link enviado a su casilla o ingreso de emergencia por clave maestra.
- **Motivo:** Máxima seguridad y erradicación de robos de identidad combinada con una ergonomía táctil superior para torneos presenciales.

---

## ADR-034: Motor Matemático Puro de Torneos, Enrutamiento Determinista por Punteros y Podio Oficial (Challonge & Nakka N01 Standard)

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. El gestor de torneos previo presentaba limitaciones severas: cuadro fijo de 8 participantes con nombres genéricos ("Por Acreditar #X"), avance rígido mediante heurísticas (`Math.floor(matchIndex / 2)`) que corrompían el cuadro de perdedores en Doble Eliminación, falta de cruces para Gran Final con campeones de ambas llaves, y ausencia de un podio visual de premiación.
  2. El usuario requirió elevar el motor al estándar de oro de la industria: https://challonge.com/ y https://n01darts.com/n01/tournament/, soportando Eliminación Simple y Doble Eliminación completa (Winners, Losers y Gran Final), podio oficial con medallas de Oro, Plata y Bronce, y herramientas para que el Superadministrador pueda editar y resetear cruces con seguridad.
- **Decisión:**
  1. **Motor Puro Inmutable (`src/lib/bracket-engine.ts`):**
     - Desacoplado 100% de React, con funciones puras libres de efectos secundarios: `generateSingleElimination`, `generateDoubleElimination`, `reportResult`, `computePodium`, `resetMatchSafely`, `previewDownstreamImpact`.
     - **Enrutamiento por Punteros Explícitos:** Cada partido declara exactamente `nextMatchId`, `nextSlot` (1 o 2), `loserNextMatchId` y `loserNextSlot`. En Doble Eliminación, los perdedores de Ganadores descienden a Losers con inversión de orden para prevenir revanchas tempranas (estándar Challonge), y el campeón de Losers accede a la Gran Final enfrentando al invicto de Ganadores.
     - **Siembra Matemática y Byes:** `seedParticipants` distribuye cabezas de serie para cuadros de 4, 8, 16, 32 y 64 competidores, resolviendo automáticamente los pases de ronda por Bye en la primera ronda.
  2. **Podio Oficial de Premiación (`src/components/torneos/TournamentPodiumView.tsx`):**
     - Componente deportivo visual con tarjetas de honor: 🥇 1º Puesto (Campeón - Oro), 🥈 2º Puesto (Subcampeón - Plata) y 🥉 3º Puesto (Bronce).
     - Integra foto/avatar del jugador, bandera de nacionalidad, marcador final, montos de premios oficiales en ARS y enlace a la ficha coleccionable.
  3. **Visualizador Dinámico (`src/components/torneos/TournamentBracket.tsx`):**
     - Generación dinámica de rondas (soportando cualquier cantidad de participantes sin límites estáticos), badges de distancia (Legs vs Sets) y podio en la cabecera.
  4. **Panel Superadministrador (`src/components/torneos/AdminMatchModal.tsx`):**
     - Incorporación de detección de impacto downstream (`previewDownstreamImpact`) con alerta visual amarilla que previene corrupciones al modificar o resetear resultados.
- **Motivo:** Estabilidad matemática absoluta, fidelidad total a las normas internacionales de dardos y experiencia visual de premiación que jerarquiza a los competidores.

---

## ADR-035: Selector Universal de Cámaras, Reparación de Audio WebRTC en Smartphones, Invitación Federal por WhatsApp y Erradicación de Mocks

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. Durante pruebas reales de juego online entre una notebook (Mariano Deux / ICEMAN) y un smartphone (Gonzalo Diaz / GonDizz), el rival veía la cámara pero no escuchaba el audio del jugador en PC. La investigación técnica arrojó dos causas raíz:
     - En `src/lib/webrtc-room.ts`, si la llamada P2P se negociaba antes de que ambos participantes tuvieran su micrófono activo, `replaceTrack` no surtía efecto porque no existía un sender de audio previo en `activeCall.peerConnection`, requiriéndose `pc.addTrack(audioTrack, stream)`.
     - Las políticas de seguridad de Autoplay en navegadores móviles (iOS Safari / Android Chrome) bloquean el audio remoto si no hay una interacción táctil directa sobre el elemento multimedia.
  2. En PCs y notebooks con múltiples dispositivos de video (cámara integrada, webcam USB en la diana, OBS Virtual Camera), el anotador no permitía elegir qué hardware utilizar, limitándose a un toggle fijo de `facingMode` móvil.
  3. Los nuevos usuarios registrados (ej: Gabriel Rubio / ZEUS, Gonzalo Diaz / GonDizz) heredaban la foto de perfil de Mariano Deux (ICEMAN) en caso de no subir avatar propio, y en sus teléfonos veían a "GonDizz" como último jugador debido a un selector público de cambio de cuenta sin control.
  4. Múltiples componentes (`NationalRankings`, `PlayerEnrollModal`, `asociacion/page.tsx`, `TournamentManager`, `MatchGameSettings`) consumían mocks estáticos (`MOCK_RANKINGS`) en lugar de los jugadores reales registrados en PostgreSQL / Supabase.
  5. Se requirió una vía ágil y atractiva para que Mariano pueda invitar a nuevos jugadores de Argentina mediante un enlace directo de WhatsApp.
- **Decisión:**
  1. **Selector Universal de Cámara de Video (`src/components/anotador/X01Board.tsx` & `WebcamSetupModal.tsx`):**
     - Detección de dispositivos mediante `navigator.mediaDevices.enumerateDevices()` filtrando `videoinput`.
     - Selector desplegable `<select>` en la barra superior de dianas del anotador, con nombres legibles de cada cámara (ej. "HD Pro Webcam C920", "Integrated Camera", etc.).
     - Persistencia del ID de cámara preferido en `localStorage` (`lpld_camera_device_id`) y fallback suave a `facingMode` en móviles.
  2. **Reparación de Audio WebRTC P2P en Smartphones (`src/lib/webrtc-room.ts` & `X01Board.tsx`):**
     - En `webrtc-room.ts`, `sendMediaStream` verifica si `pc.getSenders()` contiene un audio sender. Si no existe, invoca `pc.addTrack(audioTrack, stream)` en lugar de fallar silenciosamente en `replaceTrack`.
     - En `X01Board.tsx`, se aisló el stream de audio remoto en un elemento `<audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />` dedicado.
     - Captura de promesa rechazada en `play().catch(...)`: si el navegador móvil bloquea el autoplay, se despliega una barra táctil accesible: *"🔊 Toca aquí para escuchar la voz del rival en este teléfono"*, desbloqueando el contexto de audio con un solo toque.
  3. **Herramienta e Invitación Oficial por WhatsApp (`src/components/comunidad/InvitePlayersModal.tsx`):**
     - Modal con enlace directo al formulario de registro y perfil: `https://locosporlosdardos.com.ar/perfil`.
     - Botón directo para compartir por WhatsApp con mensaje pre-redactado de la comunidad (`api.whatsapp.com/send?text=...`).
     - Botones de "Copiar Enlace" (con feedback visual verde) y "Copiar Mensaje Completo".
     - Integración en el menú lateral (`AppSidebar.tsx`) y en la cabecera del perfil (`RegisterAndProfile.tsx`).
  4. **Sincronización Total de Jugadores Cloud (`fetchRegisteredPlayersFromCloud`):**
     - Reemplazo de `MOCK_RANKINGS` por llamadas en vivo a la nube en `NationalRankings`, `PlayerEnrollModal`, `asociacion/page.tsx`, `TournamentManager` y `MatchGameSettings`.
     - Si la base de datos está offline o vacía, fallback graceful sin corromper la interfaz.
  5. **Saneamiento Defensivo de Avatares y Login Seguro:**
     - Eliminado el selector público que permitía cambiar de identidad y marcar a otro jugador en `localStorage`.
     - Asignación de avatares propios o avatar con iniciales dinámicas y colores distintivos para nuevos jugadores, previniendo que asuman la imagen de ICEMAN.
- **Motivo:** Estabilidad técnica en partidas online federadas entre PC y teléfonos celulares, blindaje de identidad y expansión masiva de la comunidad mediante invitaciones directas por WhatsApp.

---

## ADR-036: WebRTC Bidireccional PeerJS, Desbloqueo Universal de Audio y Modal Emergente de Diana del Contrincante en PC

- **Fecha:** 2026-10-12
- **Estado:** ACEPTADA
- **Contexto:**
  1. Durante partidas 1 vs 1 online entre la PC de Mariano Deux (ICEMAN) y el smartphone de Juli (Prueba), la cámara local funcionaba en ambos dispositivos, pero la diana remota del rival quedaba en *"En espera de cámara..."*.
     - *Causa raíz 1:* En `OnlineRoomModal.tsx`, la API REST respondía en <50ms antes de que `joinPeerRoom` resolviera la conexión P2P, y como la bandera `joinedSuccess` pasaba a `true`, `setActiveWebRtcHandler(handler)` nunca se ejecutaba para el Guest. El tablero montaba sin handler WebRTC activo y nunca invocaba `sendMediaStream`.
     - *Causa raíz 2:* PeerJS no renegocia automáticamente pistas con `addTrack()` en SDPs existentes. Se requirieron llamadas independientes salientes (`outgoingCall`) y entrantes (`incomingCall`) con señalización `STREAM_READY` por DataChannel y captura de `call.peer`.
     - *Causa raíz 3 (Video):* Los elementos `<video ref={remoteVideoRef}>` remotos no poseían el atributo `muted`. Como los streams WebRTC incluyen pistas de audio, las políticas de Autoplay de Chrome (Desktop y Android) bloquean el renderizado visual de elementos multimedia no silenciados que no fueron activados por un gesto de usuario explícito sobre dicho elemento.
  2. El audio de voz y los anuncios de Russ Bray no se escuchaban:
     - *Causa raíz 1 (Audio WebRTC):* El elemento `<audio ref={remoteAudioRef}>` tenía `className="hidden"` (`display: none`), lo que en navegadores móviles suspende y congela el pipeline de audio para ahorro de batería.
     - *Causa raíz 2 (Russ Bray):* Las llamadas a `new Audio()` disparadas asíncronamente por eventos de red (WebRTC o polling) fallaban por `NotAllowedError` hasta que hubiera un gesto táctil en el documento.
  3. En la PC, el botón de ventana emergente ejecutaba un popout que abría la webcam local de Mariano en vez de mostrar en primer plano a la contrincante (Juli).
  4. Los nuevos usuarios registrados (ej: Juli) se persistían en PostgreSQL de Supabase, pero la PC de Mariano mostraba el padrón cacheado por Vercel Edge / navegador.
- **Decisión:**
  1. **Motor WebRTC Bidireccional Puro y Auto-Healing (`src/lib/webrtc-room.ts` & `X01Board.tsx`):**
     - Captura automática de `connectedGuestPeerId = (call as any).peer` en el Host.
     - Registro inmediato de `setActiveWebRtcHandler(handler)` en el Guest sin esperar al callback ni depender del tiempo de respuesta de la API REST.
     - Auto-healing en `X01Board.tsx`: si una partida online se monta sin handler activo, se auto-conecta automáticamente a la sala P2P y envía el stream local de inmediato.
     - Marcado de `<video ref={remoteVideoRef} muted ...>` para garantizar reproducción visual instantánea.
  2. **Desbloqueo Universal de Audio (`src/lib/sound-effects.ts` & `X01Board.tsx`):**
     - Reubicación de `<audio ref={remoteAudioRef}>` con estilos fijos fuera de pantalla (`top: -9999px`) sin `display: none`.
     - Creación de `unlockAudio()` enganchado a eventos globales `pointerdown`, `touchstart` y `keydown` (con `once: true`) para inicializar el `AudioContext` y el pipeline de HTML5 Audio en el primer toque de usuario.
  3. **Modal Emergente con la Diana del Contrincante (`src/components/anotador/X01Board.tsx`):**
     - Modal emergente `showRivalModal` con diseño deportivo oscuro para visualizar a la oponente (Juli) en HD en la PC.
     - Integra marcador en vivo del rival, promedio, indicador de tiro activo en su diana, botón de reconexión y Picture-in-Picture nativo (`handleTogglePiP`).
     - Botones `[⛶ Ampliar]` en la diana remota del split-screen y en la barra superior.
  4. **Padrón Federal sin Caché (`/api/jugadores` & `PlayerDirectory.tsx`):**
     - Configurado `export const dynamic = 'force-dynamic'`, `export const revalidate = 0` y cabeceras `Cache-Control: no-store, no-cache, max-age=0`.
     - Parámetro de bust de caché `?t=${Date.now()}` y botón táctil "Actualizar" con icono `RefreshCw` en el directorio.
- **Motivo:** Garantiza que la cámara y el audio del rival se visualicen y escuchen sin restricciones de red ni de navegador, con visualización dedicada en PC y padrón federado en tiempo real.
