- [x] **Sincronización Reactiva de Cuenta Bancaria en Formulario de Inscripción y Blindaje Exclusivo de SuperAdmin en `/asociacion`:**
  * **Datos Bancarios de Vitrina 4 en Formulario In-App (`GrandTournamentEnrollModal.tsx`):**
    - Desacoplamiento de la constante estática `DEFAULT_ASSOCIATION_BANK_ACCOUNT` reemplazándola por el hook reactivo `getStoredAssociationBankAccount()`.
    - Escucha de eventos en caliente (`lpld_association_bank_updated` y `storage`) para reflejar instantáneamente cualquier cambio guardado en Vitrina 4 de SuperAdmin (Mercado Pago, Alias `dardeus.mp`, CBU/CVU, Titular, CUIT/CUIL, Teléfono WhatsApp del administrador).
    - Adaptación del mensaje automático de WhatsApp con el nombre del Administrador configurado y desglose completo del arancel.
  * **Blindaje de Permisos Exclusivo SuperAdmin en `/asociacion` (`asociacion/page.tsx`):**
    - Erradicado el fallback inseguro `getCurrentPlayerProfile(USER_ICEMAN)` que otorgaba permisos de administración a visitantes anónimos o no logueados en su primera visita.
    - Sustituido el chequeo genérico `isAdmin` por `isSuperAdmin` (`isUserSuperAdmin(currentUser)`), limitando estrictamente el acceso a Mariano Deux (`marianodeux@gmail.com` / `SUPERADMIN`).
    - Ocultamiento garantizado del botón "Administrar Asociación", "+ Sumar Autoridad", "Editar", "Eliminar" y flechas de orden para cualquier usuario que no sea SuperAdmin autenticado.
    - Integración bidireccional con el Panel SuperAdmin: enlace directo `[⚙️ Panel SuperAdmin ↗]` (`/superadmin?tab=authorities`) y botón de retorno en Tab 4 de SuperAdmin (`[👁️ Ver Organigrama Público ↗]`).

- [x] **Carga Local de Imágenes del Slider con Compresión Canvas, Reordenamiento de Galería y Contador Online de Inscriptos 100% Dinámico:**
  * **Selector y Subida de Imágenes desde Equipo o Disco Local (`superadmin/page.tsx`):**
    - Botón interactivo `[📁 Elegir del Equipo / Disco]` con input de archivo `accept="image/*"`.
    - Compresión y redimensionamiento in-browser mediante `<canvas>` (máx 1920x1080 @ 85% calidad JPEG) para evitar rebasar la cuota de `localStorage` ante fotos de cámaras o teléfonos móviles.
    - Input complementario para URLs externas y presets pre-configurados.
  * **Reordenamiento Intuitivo de la Galería del Slider (`superadmin/page.tsx`):**
    - Grilla de tarjetas con visualización de posición, badge especial `#1 Portada`, controles de desplazamiento táctil: `[←]` (mover antes), `<select>` para saltar directamente a cualquier posición `#1..N`, `[→]` (mover después), y `[🗑️]` (eliminar foto).
  * **Contador de Inscriptos 100% Dinámico y Real ("Contador Online"):**
    - Erradicación definitiva del número estático `38` mockeado en `storage.ts` (`DEFAULT_LANDING_SHOWCASES.heroTournament.registeredCount = 0`).
    - Sanitización reactiva automática en `getStoredLandingShowcases()` para corregir valores guardados previamente en navegadores que tengan el mock de 38.
    - Widget reactivo en SuperAdmin con indicador pulsante en vivo `🟢 Sincronizado En Vivo`, desglose por tarjetas (Inscriptos In-App PDC, Inscriptos en Llave/Cuadro y Total Oficial) y auto-sincronización en tiempo real.
    - Contador pulsante en vivo en el Head Banner (`TournamentHeroBanner.tsx`) con baliza `🟢 EN VIVO: X / Y inscriptos reales`.
    - Sincronización precisa en `GrandTournamentEnrollModal.tsx` que actualiza el conteo exacto de registros confirmados al finalizar el flujo.

- [x] **Slider de Galería en Head Banner, Formulario Unificado In-App (PDC + Sociedad de Fomento) y Gobernanza Estricta de Torneos y Ligas:**
  * **Slider de Galería de Imágenes en Head Banner (`TournamentHeroBanner.tsx`):**
    - Carrusel interactivo automático cada 5 segundos con pausa al hover, indicadores dot, flechas previo/siguiente y contador de diapositivas.
    - Pestaña `[📸 Galería Sede]` vs `[🛡️ Fiscaliza]` alternando entre imágenes de alta fidelidad y la doble insignia federativa (Darderos MDQ +25% sobre Dardos Argentina).
    - Presets de imágenes generadas profesionalmente: Sede Sociedad de Fomento Nueva Pompeya (`gallery-venue-pompeya.jpg`), Trofeos Oficiales & Tungsteno (`gallery-trophies.jpg`), y Comunidad Darderos MDQ (`darderos.jpeg`).
  * **Formulario de Inscripción Unificado In-App (`GrandTournamentEnrollModal.tsx`):**
    - Flujo atómico "todo en un mismo form":
      1. Registra al jugador simultáneamente en el torneo oficial creado para esa fecha (en `enrolledPlayers` de la llave y suma a `registeredCount`).
      2. Si el torneo aún no fue creado en el sistema, lo auto-crea en tiempo y forma para garantizar que el participante quede sembrado en `/torneos`.
      3. Captura credenciales oficiales estándar PDC para candidatura de sede clasificatoria a mundiales (Nombre completo, Nickname, DNI/Pasaporte, Nacionalidad con bandera, Ciudad, Provincia, Club).
      4. Captura relevamiento logístico para la Sociedad de Fomento Nueva Pompeya: cantidad de acompañantes en sede, comensales para la cena de bienvenida del sábado, días de asistencia (Solo Sábado no oficial, Solo Domingo fecha oficial puntuable, o Fin de semana completo) y restricciones alimentarias (celíacos, vegetarianos).
      5. Datos bancarios oficiales para transferencia (Banco Provincia, CBU, Alias `DARDOS.MDQ.OFICIAL`, CUIT) con botones de 1-click copy.
      6. Enlace directo a WhatsApp con mensaje pre-armado y estructurado listo para enviar el comprobante a Mariano Deux.
      7. Notificación en tiempo real mediante `lpld_tournaments_updated` para actualización instantánea del cuadro en vivo.
  * **Gestor de Vitrina 1 & Logística PDC en SuperAdmin (`superadmin/page.tsx`):**
    - Selector interactivo de modalidad: `IN_APP` (Recomendado), `HYBRID` (Modal + Google Forms) y `GOOGLE_FORM`.
    - Selector de torneo vinculado de la App (`tournamentId`), permitiendo seleccionar cualquier torneo creado o modo auto-detección.
    - Gestor de galería de imágenes del slider con agregar URL, presets rápidos y miniaturas con eliminación.
    - Tablero logístico en vivo: Inscriptos confirmados, Acompañantes en sede, Aforo total en Fomento Pompeya, Comensales cena sábado, desglose por días de asistencia y países PDC.
    - Botón **"Exportar Planilla Oficial (CSV / Excel)"** con descarga directa.
  * **Gobernanza de Creación y Edición de Torneos y Ligas (`TournamentManager.tsx`, `CreateLeagueModal.tsx`, `types.ts`):**
    - El creador del torneo es automáticamente designado su administrador (`creatorId`), con potestad de designar co-administradores (`coAdminIds`).
    - Las acciones críticas (Walkover, reseteo de match, eliminación de torneo, puesta en sesión y edición de parámetros) están protegidas: solo el creador, co-admins o SuperAdmin (`marianodeux@gmail.com` Master Key) pueden realizarlas.
    - Regla de Liga Local: si un usuario tiene una liga local activa en curso, se bloquea la creación de una nueva hasta finalizar la anterior.
    - Regla de Liga Nacional: reservada exclusivamente para SuperAdmin, administradores oficiales y miembros de la Comisión Directiva Nacional.

- [x] **Edición Segura de Torneos y Ligas, Blindaje de Integridad Topológica y Puesta en Sesión Estilo Nakka N01:**
  * **Análisis Crítico de Estabilidad y Ciclo de Vida Federativo:**
    - Identificación y delimitación de fases: *Fase Previa (`0` partidos / `REGISTRATION_OPEN`)* donde la edición es irrestricta y cambiar el formato regenera la llave preservando inscriptos; vs *Fase En Sesión / En Juego (`IN_PROGRESS` / partidos en vivo o terminados)* donde el formato se congela obligatoriamente para no corromper el árbol de punteros (`nextMatchId`, `loserNextMatchId`).
  * **Modal de Edición de Torneos (`EditTournamentModal.tsx`):**
    - Formulario integral: Título, descripción, fechas, sedes, ciudad, provincia, cupo máximo (con guarda estricta `min={enrolledCount}` impidiendo reducir el cupo por debajo de los anotados), aranceles, pozo de premios (desglose 60-30-10), distancia de juego base y desglose independiente por rondas (Cuartos, Semis, Final).
    - Candado de Integridad 🔒: Si el torneo tiene partidos disputados, el formato queda deshabilitado con advertencia visual. Si se modifican distancias en caliente, solo se recalculan los partidos pendientes (`SCHEDULED`).
  * **Modal de Edición de Ligas (`EditLeagueModal.tsx`):**
    - Edición de nombre, temporada, club organizador, sedes geográficas, descripción y toggle de bonificación presencial (⚡ x2 Pts), preservando el identificador foráneo `id` y las tablas acumuladas de posiciones.
    - Integración de botones `[✏️ Editar Liga]` en el banner y tarjetas de `LeagueManager.tsx`.
  * **Puesta en Sesión y Bloqueo de Inscripción Estilo Nakka N01 (`TournamentManager.tsx` & `PlayerEnrollModal.tsx`):**
    - Botón de control de sesión para el administrador: **"🔒 Iniciar Sesión (Cerrar Cupo)"** que transiciona el torneo a `IN_PROGRESS` y sella la llave sorteada, con opción de reabrir inscripción solo si no hay partidos jugados.
    - Bloqueo de inscripción en UI: el botón "+ Inscribirme" transmuta a *"🔒 Inscripción Cerrada (En Sesión)"*.
    - Bloqueo en `PlayerEnrollModal.tsx`: ante cualquier acceso directo o deep link (`?inscribir={id}`), despliega un panel explicativo con candado bloqueando el formulario para impedir que nuevos registros alteren el cuadro.
  * **Sincronización en la Nube:**
    - Persistencia en Supabase PostgreSQL (`saveTournamentToCloud`) y `localStorage` en tiempo real.

- [x] **Aislamiento de Estadísticas de Bot vs Humano, Preservación y Reconexión de Partidas Online, Badges en Español y Asignación de Llave Estilo Nakka N01:**
  * **Aislamiento Total de Métricas de Bot (`storage.ts`, `DartScorer.tsx`, `RegisterAndProfile.tsx`):**
    - Desvío de partidas vs Bot/CPU a `lpld_bot_matches` y `lpld_bot_stats` independientes. No alteran el AVG federativo ni se sincronizan al ranking competitivo de Supabase.
    - Pestaña dedicada en perfil: `[🏆 Oficial Competitivo]` vs `[🤖 Modo Práctica (vs Máquina)]` con banner explicativo, 4 tarjetas de métricas (PJ, AVG vs Bot, Checkout, 180s) e historial de matches con etiqueta de dificultad.
  * **Preservación de Partidas Online y Reconexión Rápida (`X01Board.tsx` & `AppShell.tsx`):**
    - La desconexión accidental o navegación por el menú ya no destruye la sala ni envía `sendLeave()`.
    - Sesión persistida inmediatamente en estado `IN_PROGRESS` desde el montaje del tablero.
    - Banner global sticky en `AppShell.tsx`: *"🎯 Partida en Curso: P1 vs P2 (Sala DART-XXXX) [Volver a la Partida ↗]"*.
  * **Traducción y Estilo de Badges de Torneo (`TournamentManager.tsx`):**
    - `getTournamentStatusBadge`: `Inscripción Abierta`, `En Juego`, `Finalizado`, `Cancelado`.
    - Eliminado el corte a 2 líneas con `whitespace-nowrap font-black text-xs uppercase px-3 py-1 rounded-full`.
  * **Siembra Automática y Asignación Manual Estilo Nakka N01 (`TournamentBracket.tsx`, `SlotAssignModal.tsx`, `TournamentManager.tsx`, `bracket-engine.ts`):**
    - Estructura `enrolledPlayers` en `types.ts` y en `Tournament` sincronizada en PostgreSQL de Supabase.
    - Integración de `PlayerEnrollModal` para acreditación de competidores.
    - Barra de herramientas Nakka: `[⚡ Asignación Automática]`, `[☑️ Aleatorio]` (sorteo vs ranking) y `[🗑️ Despejar Llave]`.
    - Modal `SlotAssignModal.tsx` para asignación manual slot a slot en Ronda 1, con soporte para Byes automáticos y vaciado de slots.

- [x] **Validación de Puntajes Reales de Dardos (Máx 180 e Imposibles), Inversión de Cámaras WebRTC y Sincronización de Torneos en Supabase con Enlace Directo e Invitación WhatsApp:**
  * **Validación Rigurosa de Puntajes de Dardos (`X01Board.tsx` & `DartKeypad.tsx`):**
    - **Límite Físico de 3 Dardos:** Bloqueo de ingresos mayores a 180 puntos (3 x T20). Prevención interactiva en el teclado táctil para impedir tipear valores superiores a 180.
    - **Puntajes Matemáticamente Imposibles con 3 Dardos:** Detección y bloqueo automático de puntajes imposibles en cualquier visita (`163, 166, 169, 172, 173, 175, 176, 178, 179`) con feedback visual rojo explicativo.
    - **Reglas Oficiales de Cierre (Double Out):**
      * El cierre máximo posible en el reglamento mundial de dardos es 170 (T20 + T20 + Bull). Bloqueado cualquier checkout mayor a 170 (ej: 171, 174, 177, 180).
      * Detección de números Bogey imposibles de cerrar con 3 dardos (`159, 162, 163, 165, 166, 168, 169`).
      * Manejo correcto de BUST cuando resta 1 punto o cuando la tirada deja puntos negativos.
  * **Inversión Ergonómica de Cámaras en Salas Online (`X01Board.tsx`):**
    - Agregado el botón `[🔄 Invertir]` / `[🔄 Invertir Cámaras]` tanto en el panel móvil de Doble Diana como en el modo DUAL de escritorio (PC).
    - Permite alternar instantáneamente la posición izquierda/derecha de las dianas mediante clases dinámicas de flex/grid ordering (`order-1` y `order-2`), resolviendo el desfasaje de roles locales/remotos con un solo toque.
  * **Sincronización de Torneos en Supabase PostgreSQL & Enlace Compartible Directo:**
    - **Persistencia en la Nube:** Creación del endpoint `GET, POST & DELETE /api/torneos` conectado a la tabla `tournaments` de Supabase (con columna `data JSONB`), permitiendo que cualquier torneo creado sea inmediatamente visible para todos los jugadores de la comunidad en tiempo real.
    - **Migración Automática:** Al abrir la pestaña de torneos, el sistema sincroniza con Supabase y migra torneos locales preexistentes a la nube para no perder historial ni torneos creados previamente.
    - **Enlace Directo de Inscripción:** Cada torneo genera un link único compartible (`/torneos?inscribir={id}`) con botón de 1-click al portapapeles y botón de invitación pre-armada por WhatsApp.
    - **Auto-Apertura de Inscripción:** Al ingresar al enlace con `?inscribir={id}`, la plataforma localiza el torneo, cambia a vista de detalle y abre automáticamente el modal `PlayerEnrollModal`.


  * **Exclusión de Jugadores Suspendidos del Padrón Público (`/jugadores`):**
    - `src/lib/server-players.ts`: Filtro SSR `WHERE (p.status IS NULL OR p.status = 'ACTIVE')` para que perfiles suspendidos o inactivos no aparezcan públicamente.
    - `src/app/api/jugadores/route.ts`: Por defecto entrega únicamente jugadores activos. Soporte de parámetro `?all=true` para el Padrón General de Superadmin.
    - `src/components/jugadores/PlayerDirectory.tsx`: Doble filtro defensivo en cliente (`player.status === 'ACTIVE'`).
  * **Motor de Simulación de Bot CPU Inteligente (`X01Board.tsx` & `MatchGameSettings.tsx`):**
    - Resuelta la congelación de partida vs Bot: `MatchGameSettings` ahora propaga correctamente `isVsCpu: true`, `cpuDifficulty` y `botAvg`.
    - Algoritmo de tiro de 3 dardos inspirado en *My Dart Training*:
      * Variación gaussiana (Box-Muller) alrededor del AVG objetivo con clustering realista de dardos (26, 41, 45, 60, 81, 85, 100, 140, 180).
      * Detección de números de cierre posibles e imposibles en 3 dardos con Double Out (169, 168, 166, etc.).
      * Curva de probabilidad de checkout por nivel (Fácil ~12%, Medio ~25%, Avanzado ~42%, Pro ~65%) con bonificación en dobles directos (<= 40 pts).
      * Manejo de fallos realistas: tiros afuera, setup a dobles ideales (40, 32, 36, 16) y bust ocasional.
      * Temporizador de tiro natural de 1.5s con banner visual de CPU y voz de árbitro oficial Russ Bray anunciando cada visita y cierre (*"Game Shot!"*).
  * **Ocultamiento de Cuadro de Cámara en Partidas Presenciales Locales:**
    - `isSplitActive` condicionado estrictamente a `isDesktopSplitEnabled && (config.isOnlineRoom || showMobileCamera || !!localStream)`.
    - En partidas locales presenciales (1 vs 1 local o vs BOT), el panel lateral de cámara ("Tu Cámara está apagada") NO se monta, y el anotador se centra elegantemente en la pantalla sin elementos superfluos.
  * **Priorización de Nicks / Apodos en el Anotador Oficial:**
    - Función determinista `getPlayerDisplayNick` que extrae el Nick o apodo oficial (ej: "ICEMAN", "CARPO", "Rubio.jr") por encima del nombre civil, tanto en tarjetas de juego como en el indicador de turno de tiro.
  * **Limpieza y Ampliación de Números en Display Central ("Últimos Tantos"):**
    - Removidos los prefijos de nombre (`Mariano:` / `Rival:`) que saturaban el cuadro e impedían ver los números.
    - Formato limpio y legible: `- | 100` o `41 | 100` con separación clara y colores de estado (verde para >=100, rojo para BUST, blanco estándar).

- [x] **Optimización de UI Móvil en Anotador Oficial: Anotador Superior, Eliminación de Scroll y Display de Últimos Tantos:**
  * **Ocultamiento de Cabecera Redundante en Móviles (`src/app/anotador/page.tsx`):**
    - Banner informativo de sala en `/anotador` condicionado con `hidden lg:flex`, recuperando entre 90px y 100px de espacio vertical crítico en celulares.
    - Paddings perimetrales optimizados (`px-1 sm:px-4 py-1 sm:py-6`) para aprovechar todo el ancho y alto del smartphone.
  * **Reorganización Ergonómica de Pantalla en Celulares (`X01Board.tsx`):**
    - Panel de cámaras (`Doble Diana en Vivo` móvil `lg:hidden`) trasladado por debajo del teclado de 5 columnas y de la barra de tirador activo.
    - Se elimina el scroll necesario para anotar: el jugador tiene marcadores, barra S/L, botones de acción y teclado táctil siempre a la vista al pie del tablero.
    - Las cámaras en vivo permanecen inmediatamente debajo como referencia visual del rival.
    - El layout de escritorio en PC (`lg:`) permanece 100% inalterado (Diana a la izquierda, Anotador a la derecha).
  * **Display Central Inteligente con Últimos Tantos (`X01Board.tsx`):**
    - Reemplazo del texto estático "TIRADA" en reposo por un visor dinámico de los últimos tantos anotados por cada jugador (`Mariano: 41 | Juan: 55`), con detección de `BUST` en rojo y tiradas mayores a 100 en verde.
    - En caso de estar en zona de cierre (<= 170 pts), exhibe la sugerencia oficial de Checkout arriba y los últimos tantos abajo.
    - Al ingresar números por el teclado, muestra el valor tipeado en verde brillante con indicador `[OK]` para confirmación rápida.

  * **Optimización de Bitrate y Fluidez WebRTC (`webrtc-room.ts`):**
    - Implementación de `optimizePeerConnectionBitrate` sobre `RTCRtpSender`: límite de bitrate de video a `500000` bps (500 kbps) y audio a `40000` bps (40 kbps Opus) con `degradationPreference: 'maintain-framerate'`.
    - Eliminación de la saturación de subida residencial/4G que provocaba congelamientos y cortes de voz.
    - `getUserMedia` optimizado a 854x480 / máx 720p a 20-24 fps con fallback seguro a `{ video: true, audio: true }`.
  * **Visibilidad Garantizada de Cámara Local (`localStream` & Ref Callbacks):**
    - Agregado estado reactivo `localStream` junto con `mobileStreamRef` para forzar re-render de React al encender la cámara.
    - Ref callbacks `(el) => { if (el && stream && el.srcObject !== stream) { el.srcObject = stream; el.play(); } }` garantizando que al cambiar de vistas o montar componentes el stream local y remoto siempre se reproduzcan inmediatamente.
    - Tarjeta Picture-in-Picture (PiP) destacada (`w-44 sm:w-52`) con botón táctil directo "Encender" si la webcam propia está apagada, y click para intercambiar el foco de la diana.
  * **Modo de Visualización DUAL ("Ambas Dianas" lado a lado en PC):**
    - Nuevo modo `DUAL` en selector de cámara (`AUTO | DUAL | RIVAL | LOCAL`) que exhibe simultáneamente la Diana del Rival y Tu Diana con badges de tirador activo y marcadores en tiempo real.
  * **Controles Funcionales de Audio y Video del Rival:**
    - Botón para silenciar/desmutear audio del rival (`handleToggleRemoteAudio` con `remoteAudioRef.current.muted` e iconos `Volume2` verde / `VolumeX` rojo) tanto en PC, modal emergente y móvil.
    - Botón para ocultar/mostrar video del rival (`handleToggleRemoteVideo` e iconos `Video` azul / `VideoOff` ámbar).
    - Eliminado el elemento duplicado `<audio ref={remoteAudioRef}>` del panel móvil que causaba colisión de referencias con el audio global.

  * **Reconexión Automática WebRTC ante Refresh (F5):**
    - `webrtc-room.ts`: Auto-recuperación de `unavailable-id` en PeerJS cuando un jugador recarga `/anotador?sala=CODE`. Generación de fallback ID, notificación vía `POST /api/salas` (`action: 'HEARTBEAT'`), y reconexión inmediata (`connectToPeer`, `initiateOutgoingCall`) entre Host y Guest sin quedarse trabados.
    - `online-rooms.ts` & `src/app/api/salas/route.ts`: Registro dinámico de `hostPeerId` y `guestPeerId` en sala online con heartbeats activos cada 2 segundos.
  * **Layout Oficial en Escritorio / PC (Diana a la Izquierda, Anotador a la Derecha):**
    - En `X01Board.tsx`, el modo `isSplitActive` en pantallas de escritorio (`lg:`) permanece activo de forma permanente (`isDesktopSplitEnabled = true`), situando la Diana en Vivo / Cámaras P2P a la izquierda (`lg:col-span-7 xl:col-span-7`) y el Anotador Oficial con teclado de 5 columnas a la derecha (`lg:col-span-5 xl:col-span-5`).
    - En `src/app/anotador/page.tsx`, se expandió el contenedor a `max-w-[1700px]` para que el layout en pantallas panorámicas de PC respire con comodidad.
    - En celulares y pantallas pequeñas (< `lg`), la vista colapsa al formato táctil ergonómico con la Doble Diana móvil en acordeón.
  * **Pop-up Modal y Ventana Pop-out (`/anotador/camara-popout`) con Preservación Total de Información:**
    - Modal emergente `showRivalModal` en `X01Board.tsx`: conserva el 100% de la partida (cabecera con torneo/sala, tarjetas de ambos jugadores con promedios AVG, dardos tirados, puntuación gigante 501, indicador de tiro activo, barra de Sets / Legs (S/L), Cierre Sugerido en tiempo real y tira horizontal de los últimos 5 lanzamientos).
    - Ventana Pop-out (`/anotador/camara-popout`):
      * Reutilización de stream de `window.opener` para evitar colisiones de hardware en Chrome/Windows.
      * Soporte de `?sala=` / `?room=` con polling de respaldo a `/api/salas`.
      * Conmutador interactivo de modos de visualización: Banner TV (estilo PDC broadcast con lower third) y Split Screen TV (Lado a lado: cámara HD izquierda + marcador oficial derecho con histórico de visitas).
      * Preservación milimétrica de todas las métricas de juego en PC y celulares.

- [x] **Fecha de Nacimiento, Cálculo Dinámico de Edad, RBAC Jerárquico (Superadmin vs Admin de Torneos) y Análisis Consultivo de Reconocimiento de Voz:**
  * **Fecha de Nacimiento y Demografía Real:** Columna `birth_date` en PostgreSQL (`profiles`), función determinista y libre de desfases de huso horario `calculateAgeFromBirthDate`, input interactivo `type="date"` en `/perfil` con previsualización en tiempo real de edad y rango etario, y actualización reactiva de la tarjeta "Edad Promedio" en `/superadmin`.
  * **RBAC Jerárquico de 3 Niveles:**
    - `SUPERADMIN`: Acceso exclusivo a `/superadmin` (Mariano Deux / ICEMAN), control integral de cuotas, servidores, vitrinas, comisiones, sanciones federativas y designación de roles a competidores.
    - `ADMIN`: Administrador de torneos y ligas federadas. Puede crear, editar partidos de llaves/brackets (W.O., reseteo seguro en cascada, resultados) y eliminar torneos o ligas desde `TournamentManager` y `LeagueManager`, pero tiene **acceso estrictamente denegado a `/superadmin`**.
    - `PLAYER`: Jugador federado estándar sin privilegios de edición estructural.
  * **Ampliación de Enum de Roles en Base de Datos:** `ALTER TYPE user_role ADD VALUE 'SUPERADMIN'`, sincronización de columna `profiles.role VARCHAR(30)` con `users.role`, y selector interactivo de "Rol & Permisos" en la tabla del Padrón de Superadmin conectado a `PATCH /api/jugadores`.
  * **Eliminación y Gestión de Ligas para Administradores:** Control condicional `isAdmin` y botón `Trash2` para eliminar ligas del circuito en `LeagueManager.tsx` con confirmación defensiva.
  * **Evaluación Consultiva de Reconocimiento de Voz:** Análisis técnico exhaustivo de viabilidad, Web Speech API, desafíos acústicos en bares/clubes ruidosos, arquitectura Push-to-Talk y validación de reglas de dardos (0 a 180).

- [x] **Optimización de Vitrina Hero, Conexión Real de Google Forms & Gestión de Suspensión de Jugadores:**
  * **Ampliación del cuadro de Sede en Vitrina Hero:** Contenedor responsivo `flex-[2.5]` con ancho expandido en desktop y ancho completo en mobile, eliminando el corte del texto (`truncate`) para mostrar íntegramente sedes largas (ej: "Sociedad de Fomento...").
  * **Configurabilidad total de "Ver Cuadro y Reglamento":** Parámetros editables en Superadmin (Vitrina 1) para el texto y la URL de destino (`secondaryButtonText` y `secondaryButtonUrl`), con soporte transparente para enlaces internos (`/torneos`, `/reglamento`) y externos (PDF, Google Drive, Challonge).
  * **Reflejo real de inscriptos sin simulaciones ficticias:** Incorporado campo numérico editable de inscriptos confirmados en Superadmin y erradicado el generador aleatorio. Nuevo endpoint `POST /api/sync/google-form` con conteo en vivo de filas desde planillas Google Sheets (CSV).
  * **Gestión de Estados Federativos (Activo, Suspendido, Baja):** Columna `status` en PostgreSQL (`profiles`) y controles de acción rápida en el Padrón de Superadmin para suspender o dar de baja competidores, garantizando preservación del 100% de métricas, historial, partidos y AVG acumulado.
  * **Blindaje y Restricciones:** Protección de cuenta maestra de ICEMAN contra autosuspensión, exclusión de jugadores inactivos/sancionados de los selectores de partidas y banner informativo en su perfil.

- [x] **Sincronización Total de Fichas Deportivas, Demografía Real sin Mocks y Podios Dinámicos:**
  * Desacoplamiento del botón "Ficha ↗" en `UltimateDartsCard.tsx`: apertura directa del modal `PlayerDetailModal` con el historial del jugador seleccionado en lugar de redirigir a `/perfil` (que abría la cuenta de ICEMAN).
  * Condición estricta de Campeón: solo los jugadores con títulos oficiales ganados lucen "CAMPEÓN", mientras que los demás muestran "JUGADOR FEDERADO" y "TEMPORADA 2026" (año en curso dinámico).
  * Reemplazo de "PROMEDIO 501" por "AVG 501", eliminación de la fuente `'Impact'` y filtros con blur/shadow en SVG para garantizar tipografía 100% nítida y legible.
  * Erradicación de datos mock en Superadmin Demografía (Pestaña 2): cálculo reactivo en vivo sobre los 5 jugadores reales del padrón (Total: 5, Provincias: 1, Localidades: 1, edad promedio con estado para pendientes).
  * Podio dinámico en `/ranking`: ocultamiento de podios ficticios mientras no haya torneos disputados y despliegue de banner institucional que se corona automáticamente con el primer torneo jugado.
  * Sincronización y preview visual de fotos de perfil en autoridades (`/asociacion` y `/superadmin`), preservando fotos en base64 de jugadoras (Juli) y eliminando fallbacks invasivos a la foto de ICEMAN.
  * Apagado estricto del hardware de cámara (`stream.getTracks().forEach(t => t.stop())`) al salir de la partida en `X01Board.tsx`, liberando inmediatamente la luz física del celular.
  * Señalización `{ type: 'LEAVE' }` y destrucción limpia de WebRTC P2P (`webrtc.destroy()`) que resetea la diana en la pantalla del rival.
  * Modo Dividido Split-Screen en PC (Desktop `lg:`): Columna izquierda con Anotador 501 completo y Columna derecha con Visor de Diana en Vivo HD fija y sincronizada (sin modales invasivos superpuestos).
  * Alternancia automática de cámara por turno (*Turn-based Camera*): muestra automáticamente la diana del rival cuando tira el oponente y la diana local cuando tira el jugador, con switch manual `[⚡ Auto] | [Diana Rival] | [Mi Diana]`.
  * Ventana Pop-out desacoplada (`window.open`) con `[2ª Pantalla / Pop-out]` para setups de doble monitor o TV sin tapar el anotador.
  * Server-Side Rendering (SSR) garantizado en `/jugadores` (`getRegisteredPlayersServer`): consulta directa a PostgreSQL de Supabase en el servidor que inyecta a los 5 jugadores oficiales (**ZEUS, GonDizz, ICEMAN, CARPO, Prueba/Juli**) en el primer render de HTML.
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
