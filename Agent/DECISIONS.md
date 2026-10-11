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


