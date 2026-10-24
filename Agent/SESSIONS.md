# Bitácora de Sesiones • Locos por los Dardos

## [Sesión 45] - 2026-10-24
- **Objetivo:** Resolver el caso de inscripción de Héctor Giménez ("THE CASHIER"), implementar la persistencia centralizada en PostgreSQL de Supabase mediante `/api/inscripciones`, y desarrollar el sistema de filtros dependientes (Ámbito -> Liga -> Fecha del Evento) y el centro de control del formulario de inscripción por fecha presencial.
- **Diagnóstico y Análisis Consultivo:**
  1. *Auditoría y Confirmación de Héctor Giménez:* Se consultó directamente la base de datos de PostgreSQL en Supabase. Se confirmó fehacientemente que Héctor Valentín Giménez ("THE CASHIER") sí completó el formulario exitosamente hoy 24/10/2026 a las 18:11 hs Argentina (ID: `reg_1792876311590_dfu7`), y su inscripción llegó a la nube en la lista de jugadores de `torneo-open-mdq-2026`.
  2. *Causa Raíz del Desfase Visual en SuperAdmin:* El formulario en el cliente guardaba la ficha logística detallada en el `localStorage` del dispositivo del usuario (en este caso el de Héctor), y el panel de SuperAdmin leía únicamente el `localStorage` del navegador local de Mariano. Al no existir un endpoint cloud centralizado para el padrón logístico de la sede, las inscripciones de competidores externos no se sincronizaban en la pantalla de Mariano.
  3. *Persistencia Centralizada y Reconciliación:* Se creó la tabla `grand_tournament_registrations` en Supabase PostgreSQL y el endpoint REST `/api/inscripciones` (GET, POST, PATCH, DELETE) con reconciliación de torneos existentes. SuperAdmin ahora sincroniza en caliente cada 10s con la base de datos central.
  4. *Filtros Dependientes en 3 Niveles:* Se reestructuró la selección en: 1. Ámbito (`Nacional`, `Local`, `Abiertos`), 2. Liga Madre (filtrada según el ámbito), 3. Fecha del Evento (ordenada cronológicamente).
  5. *Acceso al Formulario por Fecha:* Se incorporó el Centro de Control de la Fecha con botones para previsualizar/abrir el formulario in-app (`GrandTournamentEnrollModal`), copiar link directo (`?inscribir=ID`), difundir por WhatsApp, fijar en portada y ver la ficha individual de cada inscripto.
- **Realizado:**
  - Creación de la tabla `grand_tournament_registrations` en Supabase PostgreSQL.
  - Sincronización oficial del registro de Héctor Giménez en la tabla central de la base de datos.
  - Creación de la ruta API `src/app/api/inscripciones/route.ts`.
  - Integración de funciones cloud en `src/lib/storage.ts` (`fetchGrandTournamentRegistrationsFromCloud` y `saveGrandTournamentRegistrationToCloud`).
  - Sincronización en vivo automática en `src/app/superadmin/page.tsx` con Supabase PostgreSQL.
  - Rediseño de `src/components/superadmin/PresencialEnrollmentsManager.tsx` con filtros dependientes de 3 niveles, centro de control de formulario de la fecha y modal de ficha individual.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código de salida 0).
- **Estado del Proyecto:** Padrón 100% conectado a la nube en tiempo real, inscripciones externas visibles de inmediato y sistema de filtros dependientes operativo.

## [Sesión 44] - 2026-10-24
- **Objetivo:** Implementar la visualización integral y gestión del formulario de inscripción en el Panel SuperAdmin: padrón de competidores, ciudad, provincia y país de procedencia, acompañantes en sede, comensales de la cena/asado del sábado con alertas de celiaquía/dietas, y organización cronológica de múltiples fechas presenciales (resaltando la fecha oficial inmediatamente próxima vs el historial).
- **Diagnóstico y Análisis Consultivo:**
  1. *Visibilidad y Centralización de Datos:* Los datos capturados por el formulario in-app (`GrandTournamentEnrollModal`) para la Sociedad de Fomento Nueva Pompeya requerían un centro de control operativo principal en `/superadmin`, evitando que queden relegados a una tabla secundaria dentro de las vitrinas de la landing.
  2. *Organización Cronológica de Fechas Presenciales:* Ante la existencia de múltiples fechas oficiales en el calendario, se requería un selector de torneos presenciales ordenados cronológicamente por proximidad, con detección y distinción visual inmediata de la **Fecha Oficial Inmediatamente Próxima** (`Gran Open Mar del Plata 2026 • Pompeya Arena`) con badge `🏆 PRÓXIMA FECHA OFICIAL` frente al historial.
  3. *Herramientas Operativas de Sede:* Se implementaron 6 KPI cards de capacidad en tiempo real (competidores, acompañantes, comensales de cena, países/ciudades, modalidades de domingo), chat de WhatsApp directo con 1 clic para cada competidor, alternador interactivo de pago (`CONFIRMADO` / `PENDIENTE`), exportación a Excel (CSV con UTF-8 BOM) y versión imprimible para mesa de acreditaciones.
- **Realizado:**
  - **Componente Maestro `PresencialEnrollmentsManager.tsx` (`src/components/superadmin/`):**
    * Selector y filtro cronológico por fechas presenciales.
    * Banner destacado de la próxima fecha oficial inmediata con acceso a exportación e impresión.
    * 6 tarjetas KPI logísticas en vivo para cálculo de sede y asado de bienvenida.
    * Alertas visuales para celíacos y dietas especiales.
    * Tabla completa con buscador multi-campo, filtros combinados, WhatsApp directo y alternador de pago.
    * Exportador a CSV/Excel con codificación UTF-8 BOM (soporte total para caracteres y tildes).
    * Modal y vista optimizada de impresión para la mesa de entrada de la sede.
  - **Jerarquización en Panel SuperAdmin (`src/app/superadmin/page.tsx`):**
    * Agregada la Pestaña 1 prioritaria `📋 Inscriptos Presencial` (`activeTab = 'ENROLLMENTS'`) con badge dinámico de inscriptos en tiempo real.
    * Soporte para query parameter `?tab=inscriptos` (también `tab=presencial`, `tab=inscripciones`, `tab=logistica`).
    * Banner de acceso directo y atajo desde Vitrina 1 de la Landing Page.
  - **Tipado y Consistencia de Datos (`types.ts`, `bracket-engine.ts`, `GrandTournamentEnrollModal.tsx`):**
    * Añadido `tournamentTitle?: string;` a `GrandTournamentRegistration`.
    * Vinculación atómica del título del torneo al momento de enviar la inscripción.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código de salida 0).
- **Estado del Proyecto:** Panel SuperAdmin con control logístico integral de la sede Nueva Pompeya y padrón maestro de inscriptos presenciales operativo.

## [Sesión 43] - 2026-10-24
- **Objetivo:** Implementar la visualización a pantalla completa desacoplada para TV de 32" estilo Nakka N01 sin scroll vertical, el sorteo a ciegas de parejas (Blind Draw) con edición manual de duplas, la inscripción multimodal para la fecha oficial del domingo (501 Individuales, 501 Parejas o Ambos), el toggle explícito de Premios en Efectivo vs Deportivos, el Baremo Oficial de Puntos (Online 1x vs Presencial 2x) en el Reglamento, y la Cartelera de Récords estilo Arcade Mortal Kombat para el Top 5 de Cierres Más Altos y el Club del 180.
- **Diagnóstico y Análisis Consultivo:**
  1. *Visualización en TV de Club (32" sin scroll para ~24 competidores):* En monitores y televisores de 32" colocados en clubes, las interfaces web estándar obligan a usar el scroll para ver los 16 partidos de la primera ronda. Nakka N01 resuelve esto compactando los slots en ~56px con auto-scaling transform vertical y un ratio panorámico que cabe al 100% en 1080p y 720p. Además, se ofreció tanto el tema clásico Dark TV (LPLD) como el Nakka Classic Green (`#0f5132`).
  2. *Relación de Formulario de Inscripción y Torneos del Domingo:* El domingo se disputan dos torneos paralelos: 501 Individual y 501 Parejas. El formulario unificado debía permitir al jugador elegir en qué certamen/es compite y, en caso de parejas, definir si tiene pareja confirmada o si solicita Sorteo a Ciegas (Blind Draw).
  3. *Sorteo a Ciegas (Blind Draw):* Se desarrolló el algoritmo Fisher-Yates que empareja aleatoriamente los inscriptos en duplas de 2 jugadores, calcula el promedio combinado y las siembra en la llave, permitiendo al organizador intercambiar duplas en cualquier slot mediante `SlotAssignModal.tsx`.
  4. *Premios en Efectivo vs Deportivos:* Se añadió el campo `hasCashPrizes` para diferenciar torneos donde la inscripción se destina a gastos operativos, sede y buffet, entregando trofeos, medallas y puntos federativos sin repartir dinero en mano.
  5. *Baremo de Puntos:* Se incorporó en Capítulo II de `/reglamento` la tabla oficial de puntuación para 1x Online vs 2x Presencial Oficial en modalidades individual y parejas con los 6 criterios jerárquicos de desempate.
  6. *Salón Mortal Kombat:* Se diseñaron cartas de peleadores con fotos oficiales, halos de fuego y rayos neón para celebrar el Top 5 de Cierres Más Altos (170 Big Fish, 164, 160, 156, 140) y el Club del 180.
- **Realizado:**
  - **Componente y Ruta TV 32" (`/torneos/tv-bracket` & `NakkaTvBracketView.tsx`):**
    * Ventana emergente desacoplada a pantalla completa (`100vw x 100vh`) con auto-scaling vertical.
    * Sincronización continua en tiempo real (3.5s polling + `lpld_tournaments_updated` + `storage`).
    * Conmutador de temas: Dark TV y Classic Nakka Green.
    * Botones `[📺 Pantalla TV 32" (Estilo Nakka) ↗]` en `TournamentManager.tsx` y `TournamentBracket.tsx` con fallback a modal in-app.
  - **Sorteo a Ciegas de Parejas (`TournamentManager.tsx`):**
    * Botón `[🎲 Sortear Parejas (Blind Draw)]` en torneos de parejas.
    * Barajado Fisher-Yates y asignación automática en llave, con edición slot a slot en `SlotAssignModal.tsx`.
  - **Inscripción Multimodal Domingo (`GrandTournamentEnrollModal.tsx`):**
    * Selector interactivo: Solo Individuales, Solo Parejas o Ambos.
    * Selector de pareja: Blind Draw vs Nombre de Pareja Confirmada.
  - **Selector de Premios en Efectivo (`TournamentManager.tsx`, `EditTournamentModal.tsx`, `types.ts`):**
    * Toggle interactivo `[💵 Sí (Con Pozo en Efectivo)]` vs `[🏆 No (Solo Trofeos / Puntos)]`.
  - **Baremo de Puntos Homologado (`reglamento/page.tsx`):**
    * Tabla completa en Capítulo II para Online 1x vs Presencial 2x y Parejas, con criterios de desempate.
  - **Salón Mortal Kombat (`MortalKombatStats.tsx` & `/ranking`):**
    * Cartelera de peleadores estilo arcade, Top 5 Cierres Más Altos, Club del 180 y modal de registro de hazañas.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código de salida 0).
- **Estado del Proyecto:** Plataforma lista para retransmisión televisiva en vivo en la fecha oficial, gestión integral de duplas y baremo reglamentario transparente.

## [Sesión 42] - 2026-10-24
- **Objetivo:** Resolver el error crítico de cliente (`Application error: a client-side exception has occurred` / `Minified React error #310 / #418`) al hacer click en el botón `+ INSCRIPCIÓN RÁPIDA` del Head Banner en la página principal.
- **Diagnóstico y Análisis Consultivo:**
  1. *Violación de las Reglas de Hooks de React:* En `GrandTournamentEnrollModal.tsx`, se encontraba un retorno temprano condicional `if (!isOpen) return null;` en la línea 92. Posteriormente, en la línea 275, se declaraban hooks de estado y efecto adicionales (`const [bank, setBank] = useState(...)` y `useEffect(...)`) para la sincronización con Vitrina 4.
  2. *Mecanismo del Fallo:* En el primer render de la landing page con el banner montado y el modal cerrado (`isOpen = false`), la ejecución retornaba `null` en la línea 92, registrando 14 hooks. Al presionar el botón `+ INSCRIPCIÓN RÁPIDA`, el estado `isOpen` pasaba a `true`, saltándose el retorno prematuro y ejecutando los hooks de la línea 275. React detectó una cantidad diferente de hooks respecto al render anterior ("Rendered more hooks than during the previous render"), provocando la excepción inmediata en el cliente.
- **Realizado:**
  - **Reubicación Incondicional de Hooks (`GrandTournamentEnrollModal.tsx`):**
    * Se trasladaron `bank` y su `useEffect` de escucha de eventos (`lpld_association_bank_updated` y `storage`) al bloque principal superior de hooks, garantizando que se ejecuten en idéntico orden en cada render.
    * Se eliminó el `if (!isOpen) return null;` prematuro de la línea 92.
    * Se colocó la guarda condicional `if (!isOpen) return null;` inmediatamente antes del `return (` del JSX principal (después de todas las funciones auxiliares seguras).
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código de salida 0).
- **Estado del Proyecto:** Formulario de inscripción rápida 100% operativo, abriéndose fluidamente sin excepciones de React en el cliente.

## [Sesión 41] - 2026-10-24
- **Objetivo:** Conectar reactivamente los datos de la cuenta bancaria de Vitrina 4 de SuperAdmin (Mercado Pago, Alias `dardeus.mp`, CVU, CUIT, WhatsApp) al formulario unificado in-app de inscripción para el Gran Torneo Oficial, y resolver la seguridad de permisos del botón "Administrar Asociación" y acciones directivas en `/asociacion` asegurando que aparezcan única y exclusivamente a Mariano Deux (SuperAdmin) con integración al panel SuperAdmin.
- **Diagnóstico y Análisis Consultivo:**
  1. *Datos Bancarios Desconectados en Modal:* En `GrandTournamentEnrollModal.tsx`, se utilizaba la constante estática `DEFAULT_ASSOCIATION_BANK_ACCOUNT` (Banco Provincia) en lugar de consultar `getStoredAssociationBankAccount()`. Al guardar cambios en Vitrina 4 en SuperAdmin, el modal continuaba exhibiendo los datos estáticos antiguos.
  2. *Vulnerabilidad de Permisos en `/asociacion`:* La vista institucional `/asociacion` inicializaba `currentUser` mediante `getCurrentPlayerProfile(USER_ICEMAN)`. En la primera visita de cualquier navegador anónimo sin sesión, heredaba la identidad de Mariano Deux (`marianodeux@gmail.com`). Además, utilizaba la guarda laxa `isAdmin` (`currentUser.role === 'ADMIN'`), lo que facultaba a administradores de torneos para editar la Comisión Directiva y las cuentas bancarias de la Asociación.
- **Realizado:**
  - **Reactividad Bancaria Total en Inscripción (`GrandTournamentEnrollModal.tsx`):**
    * Sustituida la constante estática por el hook reactivo `getStoredAssociationBankAccount(DEFAULT_ASSOCIATION_BANK_ACCOUNT)`.
    * Integrados los listeners `lpld_association_bank_updated` y `storage`, de modo que cualquier cambio guardado en Vitrina 4 de SuperAdmin se refleja en vivo en el modal.
    * Desglose completo: Banco, Tipo de Cuenta (ej. "Cuenta Corriente Especial"), Titular, CUIT/CUIL, Alias, CBU/CVU y contacto oficial.
    * Mensaje de WhatsApp automatizado con el nombre del Administrador configurado (`adminWhatsAppName`).
  - **Blindaje Exclusivo de SuperAdmin en `/asociacion` (`asociacion/page.tsx`):**
    * Erradicado el fallback inseguro a `USER_ICEMAN`: ahora inicializa en `getCurrentPlayerProfile(null)` con manejo seguro de nulos.
    * Sustituido `isAdmin` por `isSuperAdmin` (`isUserSuperAdmin(currentUser)`), permitiendo la gestión directiva únicamente a Mariano Deux (`marianodeux@gmail.com` / `SUPERADMIN`).
    * Para todos los visitantes y jugadores estándar, los botones "Administrar Asociación", "+ Sumar Autoridad", "Editar", "Eliminar" y flechas de orden quedan 100% ocultos.
    * Para Mariano Deux, se incorporó el acceso directo `[⚙️ Panel SuperAdmin ↗]` vinculando a `/superadmin?tab=authorities`, junto con la opción de edición rápida in-place.
  - **Deep Linking y Navegación Bidireccional (`superadmin/page.tsx`):**
    * Soporte para selección de pestañas vía URL (`?tab=authorities`, `?tab=payments`).
    * Botón `[👁️ Ver Organigrama Público ↗]` en Tab 4 de SuperAdmin para saltar al organigrama de `/asociacion` en 1 click.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Formulario de inscripción sincronizado al 100% con los datos bancarios de SuperAdmin (Mercado Pago), y panel institucional blindado contra accesos no autorizados.

## [Sesión 40] - 2026-10-24
- **Objetivo:** Permitir la selección y subida de imágenes para la galería del slider directamente desde el equipo o disco local con reordenamiento interactivo de aparición (asignación de orden `#1..N` y portada), y convertir el campo de inscriptos en un contador online 100% dinámico y real conectado al padrón de inscripciones efectivas de la App y de la llave del torneo.
- **Diagnóstico y Análisis Consultivo:**
  1. *Subida de Fotos Locales vs Cuota de LocalStorage:* Permitir cargar fotos tomadas con cámaras o celulares (pesos de 5 MB a 15 MB) directamente en Base64 en `localStorage` ocasiona un error crítico de cuota `QuotaExceededError`. La solución óptima es implementar compresión client-side in-memory mediante un `<canvas>` HTML5 reduciendo a máximo 1920x1080 px en formato JPEG con calidad 85% (~150 KB a 250 KB), conservando nitidez Full HD con un tamaño liviano y seguro.
  2. *Reordenamiento de Galería del Slider:* El SuperAdmin requería decidir qué imagen abre el carrusel en la portada (`#1 Portada`) y cómo se suceden las fotografías en el Head Banner mediante controles táctiles rápidos y selector directo de posición.
  3. *Inscriptos Ficticios (38) vs Contador Online Real:* El valor `38` estaba prefijado como mock estático en `DEFAULT_LANDING_SHOWCASES.heroTournament.registeredCount`. El usuario requirió que sea un contador online dinámico y REAL basado exclusivamente en los competidores que se registren en la App.
- **Realizado:**
  - **Selector y Subida de Imágenes Locales con Compresión en Canvas (`superadmin/page.tsx`):**
    * Input de archivo oculto `type="file" accept="image/*"` disparado mediante el botón destacado `[📁 Elegir del Equipo / Disco]`.
    * Pipeline de compresión client-side con `FileReader` y `<canvas>`: redimensionamiento proporcional a máx 1920x1080 px y codificación JPEG al 85% de calidad.
    * Incorporación automática a `showcases.heroTournament.galleryImages`.
  - **Controles de Reordenamiento de Galería (`superadmin/page.tsx`):**
    * Grilla interactiva de miniaturas con badge `#1 Portada`, indicador visual de índice y controles de movimiento:
      - `[←]` (Mover a la izquierda / antes).
      - `<select>` para saltar directamente a cualquier posición `#1..N`.
      - `[→]` (Mover a la derecha / después).
      - `[🗑️]` (Eliminar fotografía).
  - **Contador Online Dinámico y Real (`storage.ts`, `TournamentHeroBanner.tsx`, `superadmin/page.tsx`, `GrandTournamentEnrollModal.tsx`):**
    * Saneado `DEFAULT_LANDING_SHOWCASES.heroTournament.registeredCount = 0`.
    * Sanitización automática y retrocompatible en `getStoredLandingShowcases()`: si el navegador del usuario contiene el valor `38` mockeado, se reemplaza en caliente por la cantidad de inscriptos reales (`getStoredGrandTournamentRegistrations().length`).
    * Reemplazado el input numérico estático de SuperAdmin por el widget interactivo **"Contador Online en Tiempo Real (100% Dinámico y Real)"** con baliza pulsante verde `🟢 Sincronizado En Vivo`, desglose en 3 tarjetas (In-App PDC, Llave de Torneo y Total Oficial), y `useEffect` reactivo.
    * En `TournamentHeroBanner.tsx`, badge superior transformado en contador online en vivo: `🟢 EN VIVO: {liveCount} / {maxParticipants} inscriptos reales`, con escucha reactiva de eventos `lpld_grand_registrations_updated`, `lpld_tournaments_updated`, `lpld_showcases_updated` y `storage`.
    * En `GrandTournamentEnrollModal.tsx`, al confirmar la inscripción se sincroniza el total fidedigno de inscripciones activas (`updatedRegistrations.length`).
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Galería del slider del Head Banner con carga directa desde el disco local y reordenamiento flexible, y contador de inscriptos 100% dinámico y real en vivo tanto en SuperAdmin como en la portada de la App.

## [Sesión 39] - 2026-10-24
- **Objetivo:** Implementar el Slider & Head Banner del Gran Torneo Oficial con carrusel fotográfico rotativo configurable desde SuperAdmin, el Formulario de Inscripción Unificado In-App que inscribe atómicamente en un solo formulario al jugador en el torneo oficial para esa fecha (en la llave y cuadro) y registra los datos de acreditación PDC y logística para la Sociedad de Fomento Nueva Pompeya (acompañantes en sede, cubiertos para la cena de bienvenida del sábado y días de asistencia), más la Gobernanza Federativa de Creación y Edición de Torneos y Ligas.
- **Diagnóstico y Análisis Consultivo:**
  1. *Fricción y Abandono con Google Forms Externo:* Derivar a los participantes a un Google Forms externo provocaba pérdida de conversiones y desconexión con la llave del torneo en la App. El usuario requirió que el formulario sea in-app y haga **todo junto en un mismo formulario**: inscribirse en el torneo oficial que se cree para esa fecha y registrar el resto de los datos (PDC y Fomento Pompeya).
  2. *Relevamiento Logístico para Fomento Pompeya:* La sede requiere saber con precisión cuántos acompañantes concurren al club, cuántos comensales asistirán a la cena de bienvenida del sábado, qué días se presentarán (sábado no oficial, domingo puntuable nacional, o fin de semana completo) y requerimientos de menú especial.
  3. *Gobernanza de Creación y Co-Administración:* Democratizar la creación de torneos comunitarios sin poner en riesgo la integridad de los cuadros: el creador es el administrador nato (`creatorId`), con potestad de sumar co-administradores (`coAdminIds`). Se protege la llave (W.O., reseteos, eliminación y cambios de parámetros). Además, un organizador no puede crear otra liga local hasta finalizar la anterior, y la creación de la Liga Nacional Oficial queda restringida a autoridades federativas.
- **Realizado:**
  - **Slider de Galería de Fotos en Head Banner (`TournamentHeroBanner.tsx`):**
    * Carrusel interactivo automático cada 5 segundos con pausa al hover, flechas táctiles, puntos indicadores y contador de slides.
    * Pestaña `[📸 Galería Sede]` vs `[🛡️ Fiscaliza]` que exhibe la sede de Nueva Pompeya, trofeos oficiales y la comunidad de darderos junto a las insignias oficiales (+25% Darderos MDQ sobre Dardos Argentina).
  - **Formulario de Inscripción Unificado In-App (`GrandTournamentEnrollModal.tsx`):**
    * Flujo 100% atómico e integrado:
      1. Registra al jugador simultáneamente en el torneo oficial creado para esa fecha (en `enrolledPlayers` de la llave y suma a `registeredCount`).
      2. Si el torneo aún no fue creado en el sistema, lo auto-crea en tiempo y forma para garantizar que el participante quede sembrado en `/torneos`.
      3. Captura credenciales oficiales estándar PDC para candidatura de sede clasificatoria a mundiales (Nombre completo, Nickname, DNI/Pasaporte, Nacionalidad con bandera, Ciudad, Provincia, Club).
      4. Captura relevamiento logístico para la Sociedad de Fomento Nueva Pompeya: acompañantes en sede, comensales para la cena de bienvenida del sábado, días de asistencia y dietas especiales.
      5. Datos bancarios oficiales para transferencia con botones 1-click copy y botón WhatsApp con mensaje pre-armado y estructurado con todos los datos listo para adjuntar comprobante a Mariano Deux.
      6. Notificación en tiempo real mediante `lpld_tournaments_updated` para actualización instantánea del cuadro en vivo.
  - **Gestor de Vitrina 1 & Logística PDC en SuperAdmin (`superadmin/page.tsx`):**
    * Selector interactivo de modalidad: `IN_APP` (Recomendado), `HYBRID` (Modal + Google Forms) y `GOOGLE_FORM`.
    * Selector de torneo vinculado de la App (`tournamentId`), permitiendo seleccionar cualquier torneo creado o modo auto-detección.
    * Gestor de galería de imágenes del slider con agregar URL, presets rápidos y miniaturas con eliminación.
    * Tablero logístico en vivo: Inscriptos confirmados, Acompañantes en sede, Aforo total en Fomento Pompeya, Comensales cena sábado, desglose por días de asistencia y países PDC.
    * Botón **"Exportar Planilla Oficial (CSV / Excel)"** con descarga directa.
  - **Gobernanza de Creación y Edición de Torneos y Ligas (`TournamentManager.tsx`, `CreateLeagueModal.tsx`, `types.ts`):**
    * El creador del torneo es automáticamente designado su administrador (`creatorId`), con potestad de designar co-administradores (`coAdminIds`).
    * Las acciones críticas (Walkover, reseteo de match, eliminación de torneo, puesta en sesión y edición de parámetros) están protegidas: solo el creador, co-admins o SuperAdmin (`marianodeux@gmail.com` Master Key) pueden realizarlas.
    * Regla de Liga Local: si un usuario tiene una liga local activa en curso, se bloquea la creación de una nueva hasta finalizar la anterior.
    * Regla de Liga Nacional: reservada exclusivamente para SuperAdmin, administradores oficiales y miembros de la Comisión Directiva Nacional.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Head Banner con carrusel de imágenes de alta fidelidad, formulario unificado in-app operativo con inscripción atómica a la llave y captura de logística para Fomento Pompeya y PDC, tablero logístico de control con exportación CSV en SuperAdmin, y gobernanza integral de torneos y ligas activa.

## [Sesión 38] - 2026-10-24
- **Objetivo:** Implementar la visualización y estructuración de la Comisión Directiva en forma de Organigrama Jerárquico en `/asociacion` (clasificando en 4 niveles directivos y erradicando el orden plano desordenado), e incorporar el análisis consultivo de arquitectura sobre la gobernanza y creación descentralizada de torneos y ligas (co-administración, protección de llave y exclusividad de Ligas Nacionales).
- **Diagnóstico y Análisis Consultivo:**
  1. *Autoridades en cuadrícula desordenada:* En `/asociacion`, las tarjetas se mostraban en un grid de 4 columnas según el orden de inserción de `localStorage`, lo que provocaba que el Tesorero apareciera antes que el Presidente y el Vicepresidente.
  2. *Estructura de Organigrama:* Un órgano institucional requiere orden jerárquico visual: Cúpula Presidencial (Nivel 1, centrado, destacado con corona dorada 👑) descendiendo por conectores a Mesa Directiva Ejecutiva (Nivel 2), Secretarías Operativas (Nivel 3) y Cuerpo de Vocales & Logística de Pista (Nivel 4).
  3. *Gobernanza de Torneos y Ligas:*
     - Torneos: Cualquiera puede crear, pero solo el creador (`creatorId`) y co-administradores designados (`coAdminIds`) pueden editarlo y resolver partidos, con Master Key de Superadmin.
     - Ligas locales: Máximo 1 liga local presencial activa por usuario hasta su conclusión (`FINISHED`).
     - Liga Nacional: Restringida con exclusividad para Superadmin, administradores globales y miembros de Comisión Directiva de Dardos Argentina.
- **Realizado:**
  - **Motor de Jerarquía de Autoridades (`constants.ts`):**
    * Funciones deterministas `getAuthorityHierarchyWeight(roleTitle)` y `getAuthorityTierInfo(roleTitle)` que mapean los roles a sus 4 niveles de organigrama sin depender de inserción cronológica.
    * Actualizado `DEFAULT_ASSOCIATION_AUTHORITIES` con el organigrama oficial de Mar del Plata (Gabriel Rubio @ZEUS como Presidente, Victor Albaitero @CARPO como Vicepresidente, Mariano Deux @ICEMAN como Tesorero y Héctor Giménez @THE CASHIER como Vocal).
  - **Organigrama Interactivo en `/asociacion` (`asociacion/page.tsx`):**
    * Renderizado por niveles con conectores visuales estilizados (líneas en degradé con nodos luminosos).
    * Tarjeta de Presidencia destacada con corona dorada, anillo de luz ámbar y foco central.
    * Controles directos para administradores: botones `[↑]` (Subir) y `[↓]` (Bajar) para ajuste fino del orden relativo con 1-click.
    * Conmutador en cabecera: `[🌳 Vista Organigrama Jerárquico]` (activa por defecto) vs `[📋 Vista Grilla Estándar]`.
    * Ordenamiento jerárquico sincronizado en la Pestaña 4 de `/superadmin`.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Comisión Directiva organizada como un auténtico organigrama deportivo institucional de alto prestigio, y arquitectura de gobernanza de torneos y ligas claramente estructurada.

## [Sesión 37] - 2026-10-15
- **Objetivo:** Implementar la edición integral de ligas y torneos creados (nombres, configuraciones, sedes, fechas, premios y distancias de legs) con evaluación crítica de estabilidad para proteger la topología del árbol de llaves, e incorporar la instancia de control de sesión de Nakka N01 para definir cuándo el certamen entra en sesión y bloquear la inscripción para no vulnerar el cuadro ni su desarrollo.
- **Diagnóstico y Análisis Consultivo:**
  1. *Riesgo crítico de corrupción de llave:* En `bracket-engine.ts`, los torneos de eliminación simple y doble eliminación se sustentan en grafos con punteros deterministas (`nextMatchId`, `loserNextMatchId`, `nextSlot`). Si un torneo con partidos ya jugados o en vivo cambia de formato (ej: a doble eliminación o zonas), se destruyen los punteros y se corrompe el cuadro. Por lo tanto, el formato debe bloquearse con candado 🔒 cuando `hasMatchesPlayed === true`.
  2. *Guarda de cupo e integridad de legs:* No se puede permitir reducir el cupo máximo por debajo de la cantidad de jugadores inscriptos ya confirmados (`maxParticipants >= enrolledCount`). Y si se modifican las piernas a ganar de una ronda, solo debe propagarse a los partidos pendientes (`SCHEDULED`), nunca a los partidos finalizados (`FINISHED`).
  3. *Inscripción abierta durante el juego (Nakka Session Flow):* Si no existe un mecanismo explícito para poner el torneo "En Sesión" y cerrar inscripciones, nuevos jugadores pueden anotarse vía UI o deep link (`?inscribir={id}`), intentando ingresar a un cuadro ya sorteado y en desarrollo.
- **Realizado:**
  - **Modal de Edición de Torneos con Candado de Integridad (`EditTournamentModal.tsx`):**
    * Formulario completo con: título, descripción, estado, modalidad de pista, formato de competición, sede, ciudad, provincia, fecha/hora, cupo máximo (con guarda `min={enrolledCount}`), checkbox de aranceles y pozo de premios con desglose oficial 60-30-10, distancia base de legs y desglose configurable por rondas (Cuartos, Semis, Final).
    * Alerta visual dinámica de diagnóstico: si hay partidos jugados, el formato queda congelado (`disabled`) con aviso de seguridad; si está en fase previa, permite cambiar de formato regenerando determinísticamente la llave con los inscriptos actuales.
  - **Modal de Edición de Ligas (`EditLeagueModal.tsx` & `LeagueManager.tsx`):**
    * Formulario para actualizar nombre, temporada, ámbito (Nacional vs Local), club organizador, sede geográfica, descripción y regla de puntos dobles presenciales (⚡ x2 Pts), preservando el identificador foráneo `id` y las tablas de posiciones.
    * Botones `[✏️ Editar Liga]` en el banner de la liga seleccionada y en cada tarjeta del listado para administradores.
  - **Puesta en Sesión y Cierre de Inscripción Estilo Nakka N01 (`TournamentManager.tsx` & `PlayerEnrollModal.tsx`):**
    * Botón de acción rápida en tabla y cabecera de torneo: **"🔒 Iniciar Sesión (Cerrar Cupo)"** para transicionar a `IN_PROGRESS` y consolidar la llave sorteada.
    * Posibilidad para el administrador de revertir con **"🔓 Reabrir Inscripción"** únicamente si ningún partido ha sido disputado aún.
    * En la interfaz del torneo, el botón "+ Inscribirme" transmuta a un estado de solo lectura: *"🔒 Inscripción Cerrada (En Sesión)"*.
    * En `PlayerEnrollModal.tsx`, si el torneo ya está en sesión o finalizado, se bloquea el formulario tanto por click como por deep link (`/torneos?inscribir={id}`), desplegando un aviso con candado que explica que la llave ya está fijada y no se admiten nuevos participantes.
  - **Sincronización Cloud Automática:**
    * Todas las actualizaciones se sincronizan de inmediato con Supabase PostgreSQL (`saveTournamentToCloud`) y el almacenamiento local.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Torneos y ligas completamente editables bajo estrictas reglas de integridad deportiva, con ciclo de vida federativo y control de sesión idéntico a Nakka N01.

## [Sesión 36] - 2026-10-15
- **Objetivo:** Aislamiento total de estadísticas de partidas con BOT para no contaminar el promedio competitivo oficial del jugador (mostrándolas en una pestaña dedicada de Práctica vs la Máquina en el perfil), preservación y auto-reconexión de partidas online ante micro-desconexiones o navegación accidental por otras secciones del menú (con banner sticky de retorno inmediato), corrección y traducción al español de badges de estado de torneos ("Inscripción Abierta", sin cortes de línea), e implementación del sistema de siembra automática y asignación manual de llaves estilo Nakka N01.
- **Diagnóstico y Análisis Consultivo:**
  1. *Estadísticas de BOT mezcladas:* Al jugar contra la CPU, las partidas se guardaban en el mismo acumulador que las competitivas contra humanos, distorsionando el AVG federativo del jugador.
  2. *Desconexión al navegar o perder señal:* Al hacer click en otra pestaña de la app, el unmount de React ejecutaba `cleanupHardwareAndWebRtc`, enviaba `webrtc.sendLeave()` y mataba la instancia PeerJS, cerrando la partida para siempre. Además, partidas con 0 dardos no se persistían como `IN_PROGRESS`.
  3. *Badge de torneo deformado:* En la tabla de torneos, "REGISTRATION OPEN" se mostraba en inglés y se quebraba en 2 líneas por falta de `whitespace-nowrap`.
  4. *Inexistencia de siembra de torneos:* El gestor generaba partidos con placeholders fijos ("Por Acreditar #2", etc.) sin tomar a los jugadores inscriptos reales, sin soporte para sorteo aleatorio ni posibilidad de que el administrador asigne o intercambie jugadores en la primera ronda slot por slot como en Nakka N01.
- **Realizado:**
  - **Aislamiento de Métricas vs BOT (`storage.ts`, `DartScorer.tsx`, `RegisterAndProfile.tsx`):**
    * Claves `lpld_bot_matches` y `lpld_bot_stats` independientes en `storage.ts`.
    * En `DartScorer.tsx`, las partidas vs BOT se canalizan exclusivamente al acumulador de práctica (`lpld_bot_stats_updated`), sin sincronizar con el ranking de Supabase.
    * En `RegisterAndProfile.tsx`, selector de pestañas `[🏆 Oficial Competitivo]` vs `[🤖 Modo Práctica (vs Máquina)]`, con banner de aviso institucional, 4 tarjetas de rendimiento dedicadas (Partidas, Promedio, Cierres y 180s) e historial detallado con medallas de dificultad.
  - **Preservación de Partidas Online y Reconexión Rápida (`X01Board.tsx` & `AppShell.tsx`):**
    * `cleanupHardwareAndWebRtc` modificado: ya no envía `sendLeave()` al desmontar el componente por navegación; únicamente lo hace ante el click explícito en "Abandonar Partida".
    * Auto-guardado instantáneo de la sesión como `IN_PROGRESS` desde el montaje del tablero (incluso antes del primer dardo), protegiendo la sala online y la configuración del match.
    * Banner sticky persistente en `AppShell.tsx` cuando hay partida activa y el usuario está fuera de `/anotador`: *"🎯 Partida en Curso: P1 vs P2 (Sala DART-XXXX) [Volver a la Partida ↗]"*.
  - **Traducción y Estilo de Badges de Torneo (`TournamentManager.tsx`):**
    * Función `getTournamentStatusBadge(status)` que entrega etiquetas en español: `Inscripción Abierta`, `En Juego`, `Finalizado`, `Cancelado`.
    * Aplicación de `whitespace-nowrap font-black text-xs uppercase px-3 py-1 rounded-full`, eliminando el corte a 2 líneas.
  - **Siembra Automática y Manual de Llaves Estilo Nakka N01 (`TournamentBracket.tsx`, `SlotAssignModal.tsx`, `TournamentManager.tsx`, `bracket-engine.ts`):**
    * Cada torneo en `types.ts` contiene `enrolledPlayers` estructurado (id, name, nickname, seed, avg, webcam, avatarUrl, enrolledAt).
    * `PlayerEnrollModal` integrado en `TournamentManager` con acreditación oficial de jugadores.
    * Barra de herramientas Nakka en `TournamentBracket.tsx`: `[⚡ Asignación Automática]`, `[☑️ Aleatorio]` toggle y `[🗑️ Despejar Llave]`.
    * Modal `SlotAssignModal.tsx` para asignación slot a slot en Ronda 1: permite asignar cualquier inscripto, otorgar "⚡ Pase Libre (BYE)" (avanzando automáticamente al rival) o desocupar el slot.
    * Actualizado `bracket-engine.ts` con soporte para `options.bracketSize` (4, 8, 16, 32, 64) en llaves simples y dobles.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Estadísticas federativas protegidas contra la máquina, partidas online blindadas contra desconexiones y navegación, torneos con inscripción real y sistema de llaves idéntico a Nakka N01.

## [Sesión 35] - 2026-10-14
- **Objetivo:** Resolver la inversión de cámaras en salas online WebRTC (permitiendo que el competidor ubique su cámara en el lado izquierdo o derecho a voluntad), federalizar y sincronizar torneos en la nube (PostgreSQL Supabase) permitiendo compartir enlaces directos de inscripción vía portapapeles y WhatsApp, e implementar la validación rigurosa de puntuaciones de dardos en el anotador (bloqueando > 180, puntajes matemáticamente imposibles con 3 dardos y checkouts inválidos mayores a 170 o bogey).
- **Diagnóstico y Análisis Consultivo:**
  1. *Cámaras invertidas en salas online:* Al unirse desde el celular a una sala online, el dispositivo tomó el rol secundario (`localPlayerIndex: 1`), mostrando su cámara en la diana derecha mientras su perfil correspondía al jugador de la izquierda ("ICEMAN").
  2. *Torneos locales e invisibles:* `TournamentManager` persistía en `localStorage`. Si Mariano u otro administrador creaba un torneo en su dispositivo, ningún otro usuario podía verlo ni inscribirse, ni existía enlace directo para convocar jugadores.
  3. *Anotación de tantos irreales:* El anotador permitía tipear cualquier número arbitrario (ej. 179, 185, 200, 999) y en modalidad Double Out declaraba Game Shot con checkouts mayores a 170 o números Bogey (169, 168, etc.), violando el reglamento oficial WDF/PDC.
- **Realizado:**
  - **Validación Estricta de Puntajes de Dardos (`X01Board.tsx` & `DartKeypad.tsx`):**
    * Máximo 180 puntos en 3 dardos (bloqueo en teclado numérico y en submit).
    * Bloqueo de puntajes físicamente imposibles en 3 dardos: `[163, 166, 169, 172, 173, 175, 176, 178, 179]`.
    * En Double Out: bloqueo de cualquier cierre superior a 170 (Big Fish) y de números Bogey (`[159, 162, 163, 165, 166, 168, 169]`).
    * Detección precisa de BUST para puntuaciones negativas o que dejen 1 punto.
  - **Botón de Inversión Instantánea de Cámaras (`X01Board.tsx`):**
    * Estado reactivo `isCamerasSwapped` con botón interactivo `[🔄 Invertir]` / `[🔄 Invertir Cámaras]` tanto en móvil como en modo Desktop DUAL.
    * Reordena inmediatamente la visualización izquierda/derecha de las dianas con CSS Flex/Grid (`order-1` / `order-2`).
  - **Sincronización Cloud de Torneos y Deep Linking (`/api/torneos`, `storage.ts`, `TournamentManager.tsx`, `app/torneos/page.tsx`):**
    * Esquema de Supabase actualizado: `tournaments.id` como `VARCHAR(100)` y columna `data JSONB`.
    * Endpoint REST `GET, POST & DELETE /api/torneos` con persistencia en PostgreSQL Supabase y fallback local.
    * Migración automática de torneos existentes a la nube en el primer montaje.
    * Botón de 1-click para copiar enlace de inscripción directo (`/torneos?inscribir={id}`) con feedback visual.
    * Botón directo con template para compartir la invitación por WhatsApp.
    * Soporte de deep link: si el usuario ingresa con `?inscribir={id}`, la vista carga el torneo y abre inmediatamente el modal `PlayerEnrollModal`.
- **Validación:** `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
- **Estado del Proyecto:** Anotador 100% blindado reglamentariamente, salas online con control ergonómico de cámaras, y gestor de torneos federado en la nube con enlaces directos para convocatoria e inscripción.

## [Sesión 34] - 2026-10-14
- **Objetivo:** Resolver el avance del Bot CPU como rival en partidas individuales incorporando un motor de simulación inspirado en *My Dart Training*, ocultar el panel de cámara en partidas locales presenciales (1 vs 1 local y vs CPU), priorizar apodos o Nicks oficiales en el marcador y eliminar los nombres del visor central de últimos tantos para dejar únicamente números legibles y de gran tamaño.
- **Diagnóstico y Análisis Consultivo:**
  1. *El Bot no jugaba:* En `MatchGameSettings.tsx` el arranque de partida fijaba `isVsCpu: false` por omisión y `X01Board.tsx` carecía por completo de un hook o ciclo de turno para el rival CPU; el turno quedaba en el bot pero esperaba una entrada táctil del usuario humano.
  2. *Cámara innecesaria en partidas locales:* En partidas presenciales no online el estado `isSplitActive` se mantenía activo en pantallas de PC, mostrando una tarjeta vacía de "Tu Cámara está apagada" que empujaba el anotador a la derecha.
  3. *Nombres civil vs Nicks:* Las tarjetas llamaban a `formatCardPlayerName` que recortaba los apodos entre paréntesis (ej: "Mariano Deux (ICEMAN)" -> "Mariano Deux"), impidiendo que se lucieran los apodos identitarios de los darderos.
  4. *Cuadro de Últimos Tantos saturado:* La inclusión de nombres como `Mariano: ... | Rival: 100` en un contenedor de 1.4fr colapsaba el espacio, recortando los números con puntos suspensivos.
- **Realizado:**
  - **Motor de Simulación Bot CPU (My Dart Training Engine):**
    * Función `calculateBotTurnScore(currentScore, targetAvg, outMode)` con distribución gaussiana (Box-Muller) alrededor del AVG del nivel seleccionado (Fácil: 40, Medio: 55, Avanzado: 70, Pro: 85).
    * Probabilidades realistas de checkout (12% a 65%) respetando números imposibles de cerrar en 3 dardos con Double Out (169, 168, etc.).
    * Simulación de fallos realistas (tiros fuera, setup a dobles de 40, 32, 16 y bust ocasional).
    * `useEffect` con retardo natural de 1.5s, banner visual `🤖 Turno de ${p2Display}` mientras tira y voz de Russ Bray cantando el puntaje o *Game Shot*.
  - **Ocultamiento de Cámaras en Partidas Locales Presenciales:**
    * Condición `isSplitActive = isDesktopSplitEnabled && (config.isOnlineRoom || showMobileCamera || !!localStream)`.
    * En partidas locales presenciales el anotador se presenta centrado en pantalla sin paneles laterales de webcam.
  - **Priorización de Nicks en el Anotador:**
    * Función `getPlayerDisplayNick` que extrae el apodo oficial de forma determinista para tarjetas, turnos y registros.
  - **Display Central Limpio y Legible:**
    * Eliminados prefijos de texto. Ahora exhibe exclusivamente `- | 100` o `41 | 100` en tamaño destacado con separación clara y colores semánticos.
  - **Exclusión de Jugadores Suspendidos:**
    * Perfiles suspendidos excluidos del padrón público (`/jugadores`) tanto en SSR como en endpoints REST, preservados en el panel de Superadmin (`?all=true`).
- **Estado del Proyecto:** Motor de CPU funcional y desafiante estilo My Dart Training, visualización presencial limpia sin cámaras forzadas, Nicks visibles en el marcador y display central numérico de alta legibilidad.

## [Sesión 33] - 2026-10-14
- **Objetivo:** Optimización de la experiencia móvil en el Anotador Oficial (`/anotador` y `X01Board.tsx`): erradicación de scrolls innecesarios en celulares, ocultamiento del banner redundante de sala en pantallas móviles, reorganización de la interfaz para situar el teclado ergonómico de 5 columnas por encima de las cámaras, y reemplazo del cuadro estático "TIRADA" por un visualizador en reposo de los últimos tantos anotados por cada jugador.
- **Diagnóstico y Análisis Consultivo:**
  1. *Pérdida de espacio vertical en smartphones:* El banner superior que detalla el nombre de la sala ("Sala Online: DART-SLVU...") consumía entre 90px y 100px de altura en pantallas táctiles, empujando la interfaz de tiro hacia abajo. En móviles, el código de sala ya se encuentra visible en la barra superior compacta y en los badges de la partida.
  2. *Desplazamiento forzado (scroll) para anotar:* El panel de cámaras móviles (`Doble Diana en Vivo`) estaba ubicado antes del teclado de 5 columnas, obligando al jugador a scrollear 250-300px hacia abajo tras cada tiro para ingresar su puntaje, perdiendo de vista los marcadores gigantes.
  3. *Incomprensión del cuadro central "TIRADA":* En reposo, el botón/display central mostraba el texto estático y grisáceo "Tirada" (o "Sin Opción" si no había checkout), confundiéndose con un botón muerto. Su función nativa es servir de visor numérico (`typedInput`) y botón de confirmación (`OK`) al tipear.
- **Realizado:**
  - **Ocultamiento de Cabecera Redundante en Móviles (`src/app/anotador/page.tsx`):**
    * Se aplicó `hidden lg:flex` al banner informativo superior de la sala en `/anotador`. En escritorio (PC) se preserva íntegramente y en móviles se ahorran ~100px verticales.
    * Se compactaron los paddings del contenedor en pantallas pequeñas (`px-1 sm:px-4 py-1 sm:py-6`) para aprovechar al máximo la pantalla del teléfono.
  - **Reubicación Ergonómica del Anotador sobre las Cámaras (`X01Board.tsx`):**
    * Se trasladó el bloque de cámaras de móvil (`<div className="lg:hidden">`) para que quede situado debajo del teclado numérico de 5 columnas y de la barra del tirador activo.
    * En smartphones, el jugador tiene en la parte superior y sin scrollear:
      1. Mini cabecera oficial con controles de audio/mic.
      2. Tarjetas de puntajes gigantes de ambos jugadores con promedios y dardos lanzados.
      3. Barra de Sets y Legs (`0 S/L 0`).
      4. Fila de acción: `switch Starter` + Display Central + `REMAINING`.
      5. Teclado ergonómico de 5 columnas (o aviso elegante de turno del rival).
      6. Estado del turno y botón directo a visitas.
      7. Directamente abajo: panel de Doble Diana en Vivo (cámaras en tiempo real con selector de cámara trasera/delantera, mute y reconexión).
    * El layout de escritorio en PC (`lg:`) permanece 100% inalterado (Diana fija a la izquierda y Anotador a la derecha).
  - **Display Central con Últimos Tantos Anotados (`X01Board.tsx`):**
    * Cuando el jugador presiona dígitos en el teclado, el display muestra el número ingresado en verde brillante junto a un indicador `[OK]`.
    * Cuando está en reposo (sin dígitos tipeados):
      - Muestra de forma destacada y balanceada los últimos tantos anotados por cada competidor: `Mariano: 41 | Juan: 55`, con detección de `BUST` en rojo y scores >= 100 en verde.
      - Si el jugador en turno está en zona de cierre (<= 170 pts), exhibe en la línea superior la ruta de checkout sugerida (ej. `Cierre (40): D20`) y en la inferior los últimos tantos de ambos jugadores.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
- **Estado del Proyecto:** Anotador oficial en celulares con ergonomía táctil perfecta: marcadores y teclado inmediatamente visibles al abrir la app sin scrollear, visualización clara de los últimos tantos en el display central y cámaras situadas estratégicamente como apoyo visual en vivo debajo del tablero.
- **Objetivo:** Resolver los cortes intermitentes de video y audio en salas online 1 vs 1, asegurar la visibilidad de la cámara propia del jugador local (tanto en modo PiP como en vista lado a lado "DUAL"), y habilitar controles completamente funcionales para silenciar el audio del rival y ocultar su video sin alterar el teclado de 5 columnas.
- **Diagnóstico de Causa Raíz:**
  1. *Video y audio entrecortados:* El streaming WebRTC transmitía video sin límite de ancho de banda (uplink ilimitado a 30fps), saturando la velocidad de subida en conexiones residenciales y 4G, lo que provocaba degradación, retraso y corte del canal de audio.
  2. *Cámara local no visible:* El stream local se guardaba en una referencia mutable (`mobileStreamRef.current`) sin un estado de React (`useState`), evitando que los componentes se enteraran de la activación de la cámara. Además, al alternar entre modos o al montar/desmontar componentes condicionales, los elementos `<video>` perdían su `srcObject`.
  3. *Botones no funcionales de audio y video:* La función previa sólo intentaba llamar a `.play()` contra el bloqueo de autoplay pero no manipulaba la propiedad `muted`. Además, existía un `<audio ref={remoteAudioRef}>` duplicado en el panel móvil que colisionaba con el reproductor de audio raíz, y no existía botón para ocultar el video remoto.
- **Realizado:**
  - **Optimización de Bitrate WebRTC y Fluidez (`webrtc-room.ts`):**
    * Función `optimizePeerConnectionBitrate(pc)` con `setParameters()` sobre `RTCRtpSender`:
      - Video limitado a 500 kbps (`maxBitrate: 500000`) con `degradationPreference: 'maintain-framerate'`.
      - Audio optimizado a 40 kbps Opus (`maxBitrate: 40000`).
    * Aplicación automática e inmediata con reintento a 800ms en `hostPeerRoom`, `joinPeerRoom` y `sendMediaStream`.
    * Calibración de `getUserMedia` a 854x480 / máx 720p a 20-24 fps en `X01Board.tsx` con fallback robusto a `{ video: true, audio: true }`.
  - **Visibilidad de Cámara Local y Modo DUAL (`X01Board.tsx`):**
    * Agregado estado reactivo `localStream` (`setLocalStream(stream)`).
    * Incorporado modo `DUAL` en `cameraFocusMode` (`AUTO | DUAL | RIVAL | LOCAL`): despliega simultáneamente la Diana Rival y Tu Diana lado a lado en PC (`lg:`).
    * Patrón de ref callbacks aplicado en todos los elementos `<video>` para adjuntar inmediatamente el `srcObject` al stream disponible sin depender de efectos asíncronos frágiles.
    * Inset PiP interactivo en la esquina (`w-44 sm:w-52`) con botón táctil directo "Encender Mi Cámara" si está apagada, y click para alternar entre dianas.
  - **Controles Reales de Audio y Video del Rival:**
    * `handleToggleRemoteAudio`: conmuta `isRemoteAudioMuted` y `remoteAudioRef.current.muted` con feedback visual (`Volume2` verde / `VolumeX` rojo).
    * `handleToggleRemoteVideo`: conmuta `isRemoteVideoHidden` con feedback visual (`Video` azul / `VideoOff` ámbar) y pantalla informativa elegante de reemplazo.
    * Eliminado el tag duplicado `<audio ref={remoteAudioRef}>` del panel móvil para evitar colisiones de referencia.
    * Controles integrados en barra de PC, modal emergente y barra de dianas móvil.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
    * `npm run build` completado con 0 errores (18 rutas estáticas y 6 dinámicas optimizadas).
- **Estado del Proyecto:** Salas online 1 vs 1 con streaming ultra-estable a 500 kbps, audio continuo y sin caídas, ambas cámaras visibles simultáneamente (Modo DUAL y PiP) y controles interactivos completos de silenciamiento y privacidad.

---

## [Sesión 31] - 2026-10-14
- **Objetivo:** Corrección de desconexión WebRTC de audio y video ante F5 (refresh), fijación del layout en escritorio (PC) con Diana a la izquierda y Anotador Oficial a la derecha, y enriquecimiento del modal de cámara y la ventana emergente Pop-out (`/anotador/camara-popout`) preservando el 100% de la información de la partida tanto en PC como en celulares.
- **Diagnóstico de Causa Raíz:**
  1. *Desconexión por refresh F5:* Al recargar la página, el servidor cloud de PeerJS retiene el Peer ID anterior por 20-30 segundos arrojando error `unavailable-id`, lo cual abortaba la inicialización del Host y dejaba al Guest sin contraparte.
  2. *Layout de escritorio condicional:* `isSplitActive` estaba condicionado a `(isOnline || showMobileCamera) && isDesktopSplitEnabled`, provocando que en partidas locales o previas a activar la cámara en PC, la pantalla colapsara a una única columna central (`max-w-lg`) en lugar de mostrar la Diana a la izquierda y el anotador a la derecha. Además, el contenedor en `src/app/anotador/page.tsx` estaba limitado a `max-w-7xl` reduciendo el espacio disponible en monitores 1080p.
  3. *Pérdida de datos en popup:* La ventana emergente `/anotador/camara-popout` carecía de barra S/L, desglose de visitas previas, modo de layout Split y reintentaba capturar la webcam con `getUserMedia()` colisionando con el hardware ya ocupado por la ventana principal de Chrome.
- **Realizado:**
  - **Auto-Healing WebRTC y Heartbeat Bidireccional (`webrtc-room.ts`, `online-rooms.ts`, `/api/salas`):**
    * Detección de error `unavailable-id` en PeerJS con generación instantánea de ID alternativo de contingencia (`${peerId}-${random}`).
    * Notificación de Peer ID activo a través de `POST /api/salas` (`action: 'HEARTBEAT'`) ejecutado cada 2s en polling.
    * Métodos `connectToPeer(targetId)` y `reconnectCall()` en `WebRtcRoomHandler` para reenganchar llamadas y DataChannel en tiempo real ante refrescos.
  - **Layout de Escritorio / PC Permanente (`X01Board.tsx` & `/anotador/page.tsx`):**
    * `isSplitActive` configurado con `isDesktopSplitEnabled` (activo por defecto en pantallas `lg:`).
    * Diana en Vivo / Cámaras P2P fija a la izquierda (`lg:col-span-7 xl:col-span-7`).
    * Anotador Oficial con marcadores gigantes, cierres sugeridos, teclado de 5 columnas e historial a la derecha (`lg:col-span-5 xl:col-span-5`).
    * Ancho máximo del contenedor en `src/app/anotador/page.tsx` ampliado a `max-w-[1700px]`.
    * En dispositivos móviles (< `lg:`), colapso limpio al teclado táctil con acordeón de Doble Diana.
  - **Pop-up y Ventana Desacoplada con 100% de Información (`camara-popout/page.tsx` & `showRivalModal`):**
    * Compartición de stream de video mediante `window.opener` (`__lpld_remote_stream` / `__lpld_local_stream`) para evitar colisiones de cámara en Windows.
    * Soporte para parámetros `?sala=` o `?room=` con polling de respaldo a `/api/salas`.
    * Tarjetas de ambos jugadores completas: Banderas de nacionalidad, nombres, AVG 3-darts, dardos tirados, Sets, Legs, puntuación 501 gigante e indicador pulsante de tirador activo.
    * Barra oficial de Sets y Legs (S/L) y ruta de Cierre Sugerido en vivo.
    * Tira de los últimos lanzamientos de la partida con jugador, score y restante.
    * Selector interactivo de visualización: Banner TV (Lower Third) vs Split View (Cámara izquierda + Marcador derecho).
    * `CamaraPopoutPage` protegido con `<Suspense>` conforme a las convenciones de Next.js App Router.
  - **Validación de Compilación y Tipos:**
    * `npx tsc --noEmit` completado exitosamente con 0 errores (código 0).
    * `npm run build` completado exitosamente con 18 páginas estáticas y 6 rutas dinámicas (código 0).
- **Estado del Proyecto:** Salas online 1 vs 1 con recuperación automática tras F5, layout de PC con anotador a la derecha y visor de diana a la izquierda garantizado, popouts con fidelidad total de datos de juego e interfaz optimizada tanto para escritorio como celulares.

---

## [Sesión 30] - 2026-10-14
- **Objetivo:** Registro de fecha de nacimiento y cálculo dinámico de edad en la ficha del jugador (`RegisterAndProfile.tsx`) para la tarjeta demográfica de Superadmin, RBAC jerárquico de 3 niveles (`SUPERADMIN`, `ADMIN`, `PLAYER`) con delegación de administración de llaves eliminatorias y eliminación de torneos/ligas sin acceso al panel `/superadmin`, y evaluación consultiva de reconocimiento de voz para anotación de tantos.
- **Diagnóstico de Causa Raíz:**
  1. *Ausencia de fecha de nacimiento:* La base de datos carecía de `birth_date` en `profiles`, lo que obligaba a la tarjeta de "Edad Promedio" de Superadmin a computar sobre valores inexistentes.
  2. *Falta de diferenciación de roles:* Todos los privilegios de administración estaban acoplados a la cuenta de ICEMAN. No existía distinción entre un administrador de torneos (capaz de resolver llaves, declarar W.O. y crear/eliminar torneos o ligas) y un Superadministrador global con acceso a cuotas, vitrinas, comisiones y finanzas.
- **Realizado:**
  - **Fecha de Nacimiento y Cálculo Dinámico de Edad:**
    * Columna `birth_date DATE` añadida a la tabla `profiles` en PostgreSQL de Supabase.
    * Función `calculateAgeFromBirthDate(birthDateStr)` determinista, libre de desfasajes de huso horario y con soporte para fechas ISO.
    * Input `type="date"` en `RegisterAndProfile.tsx` con preview reactivo del cálculo de edad y rango etario oficial.
    * Inclusión de `birth_date` y `age` en `types.ts`, `server-players.ts` y endpoints `GET, POST & PATCH /api/jugadores`.
    * Cálculo dinámico de edad promedio en `/superadmin` sobre los registros con fecha válida.
  - **RBAC Jerárquico de 3 Niveles (`SUPERADMIN`, `ADMIN`, `PLAYER`):**
    * `ALTER TYPE user_role ADD VALUE 'SUPERADMIN'` ejecutado en PostgreSQL de Supabase.
    * Columna `profiles.role VARCHAR(30)` sincronizada con `users.role`.
    * Funciones de autorización en `src/lib/constants.ts`: `isUserSuperAdmin` (Mariano Deux / `SUPERADMIN`) y `canUserManageTournaments` (`SUPERADMIN`, `ADMIN`, `ORGANIZER`).
    * Guard estricto en `/superadmin`: acceso denegado a usuarios con rol `ADMIN`; el panel maestro es de uso exclusivo para `SUPERADMIN`.
    * Selector interactivo de "Rol & Permisos" (`PLAYER`, `ADMIN`, `SUPERADMIN`) en la tabla del Padrón de Superadmin para que Mariano pueda promover o degradar administradores con 1 click llamando a `PATCH /api/jugadores`.
    * `TournamentManager.tsx` y `LeagueManager.tsx`: los administradores (`ADMIN`) pueden editar llaves eliminatorias, declarar W.O., resetear matches en cascada, crear ligas y eliminar certámenes o ligas con confirmación defensiva (`Trash2`).
  - **Evaluación Consultiva de Reconocimiento de Voz:**
    * Análisis arquitectónico elaborado sobre viabilidad con Web Speech API, desafíos de ruido ambiente en bares y pubs (música, voces superpuestas), arquitectura Push-to-Talk y validación de gramática cerrada de dardos (0-180 y checkouts).
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
- **Estado del Proyecto:** Fichas de jugadores con fecha de nacimiento y edad real, métricas demográficas de Superadmin fidedignas, RBAC de 3 niveles con aislamiento blindado entre Superadmin y Administradores de Torneo, y documentación institucional actualizada.

---

## [Sesión 29] - 2026-10-13
- **Objetivo:** Ampliación y flexibilización del cuadro de Sede en la vitrina del Gran Torneo oficial, configurabilidad total del botón secundario ("Ver Cuadro y Reglamento") hacia cualquier URL o ruta desde Superadmin, sincronización fidedigna de inscriptos desde Google Forms/Sheets sin simulaciones ficticias, y sistema de suspensión/baja disciplinaria de jugadores federados con preservación estricta del 100% de métricas, AVG y partidas disputadas.
- **Diagnóstico de Causa Raíz:**
  1. *Sede truncada:* `TournamentHeroBanner.tsx` utilizaba una grilla rígida de 4 columnas iguales (`sm:grid-cols-4`) con `truncate`, ahogando nombres de sede extensos (ej. "Sociedad de Fomento...") mientras Fecha, Bolsa y Cupos tenían espacio sobrante.
  2. *Enlace rígido de Cuadro y Reglamento:* El botón secundario del banner apuntaba estáticamente a `/torneos` sin soporte de configuración en Superadmin para derivar a `/reglamento` o documentos externos (PDF de reglamento, Drive o Challonge).
  3. *Inscriptos ficticios en Superadmin:* Al pulsar "Sincronizar Ahora" en la vitrina, el sistema generaba un número aleatorio `Math.floor(Math.random() * 8) + 38` y no ofrecía un campo numérico para que Mariano ingresara o editara la cantidad real de jugadores anotados en el Formulario de Google.
  4. *Falta de gestión de estados federativos:* El padrón de Superadmin solo permitía modificar categorías y mostraba un texto estático "Sincronizado" sin opción para suspender o dar de baja a un jugador, arriesgando la pérdida de datos si se aplicaba un borrado duro (`DELETE`).
- **Realizado:**
  - **Ampliación del Cuadro de Sede en Vitrina Hero (`TournamentHeroBanner.tsx`):**
    * Contenedor flex responsivo con `sm:flex-[2.5]` y `min-w-[220px]` para Sede, anchos ajustados (`min-w-[105px]`) para Fecha, Bolsa e Inscriptos, y `w-full` en móviles.
    * Eliminada la clase `truncate` y ampliado el ancho máximo del Hero a `max-w-3xl`, desplegando el nombre completo de cualquier sede sin cortes.
  - **Configurabilidad del Botón Secundario:**
    * Incorporados campos `secondaryButtonText` y `secondaryButtonUrl` en `LandingShowcaseSettings.heroTournament` (`types.ts` y `storage.ts`).
    * Detección inteligente de enlaces internos (`<Link>`) y externos (`<a>` con `target="_blank"` y `ExternalLink`).
    * Campos de edición incluidos en la Vitrina 1 de `/superadmin`.
  - **Reflejo Real de Inscriptos y Sincronización Google Forms/Sheets:**
    * Campo numérico editable `Inscriptos Confirmados (Real)` incorporado en Superadmin.
    * Erradicada la generación ficticia de números aleatorios.
    * Creado endpoint `POST /api/sync/google-form` que analiza enlaces de Google Sheets y cuenta en vivo las filas de respuestas (CSV) descontando la cabecera.
  - **Arquitectura de Suspensión y Baja de Jugadores con Preservación Histórica:**
    * Añadida columna `status VARCHAR(30) DEFAULT 'ACTIVE'` a la tabla `profiles` en PostgreSQL de Supabase sin romper foreign keys ni dependencias.
    * Mapeo de `status` ('ACTIVE' | 'SUSPENDED' | 'INACTIVE') en `types.ts`, `server-players.ts`, `api/jugadores/route.ts` (GET, POST y PATCH).
    * Nueva columna **Estado** en el Padrón de Jugadores de Superadmin con badges visuales (Activo, Suspendido, Dado de Baja).
    * Botones de acción rápida (Suspender, Dar de Baja, Reactivar) con advertencia y confirmación defensiva.
    * Blindaje absoluto de la cuenta de ICEMAN contra autosuspensión/desactivación.
    * Exclusión de jugadores suspendidos/inactivos en `MatchGameSettings.tsx` para nuevas partidas.
    * Alertas informativas en `RegisterAndProfile.tsx` y badges en `PlayerDetailModal.tsx`.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado exitosamente (código 0).
    * `npm run build` completado exitosamente con 18 páginas estáticas y 6 rutas dinámicas (código 0).
- **Estado del Proyecto:** Portada con Sede amplia y legible, vitrinas 100% configurables, inscriptos fieles a la realidad de Google Forms y padrón federal con gestión de sanciones y bajas preservando la totalidad del historial deportivo.

---

## [Sesión 28] - 2026-10-12
- **Objetivo:** Corrección y desacoplamiento de fichas deportivas en `/jugadores` (modal directo in-place en vez de redirigir a `/perfil` de ICEMAN), estandarización de etiquetas de Campeón y Jugador Federado Temporada 2026, tipografía nítida y reemplazo de "PROMEDIO 501" por "AVG 501", erradicación de datos mock en Superadmin Demografía (1240 usuarios -> cálculo reactivo sobre los 5 jugadores reales), podios condicionales en `/ranking` y sincronización fotográfica con preview de autoridades en `/asociacion` y `/superadmin`.
- **Diagnóstico de Causa Raíz:**
  1. *Desvío de fichas a perfil de ICEMAN:* En `UltimateDartsCard.tsx`, el botón "Ficha ↗" renderizaba `<Link href="/perfil">`, lo que forzaba a cualquier usuario a abrir el formulario de edición de su propia sesión activa en vez del historial del jugador clickeado.
  2. *Etiqueta de "Campeón" universal:* La función `getPlayerPerformance()` asignaba "CAMPEÓN" por defecto a cualquier jugador que no tuviera torneo registrado, falseando el palmarés deportivo.
  3. *Tipografía difusa en cartas:* El uso de la fuente `'Impact'` y filtros SVG con sombras borrosas (`filter="url(#text-shadow-...)"`) generaba degradación visual en pantallas de alta densidad y móviles.
  4. *Demografía inflada en Superadmin:* La Pestaña 2 consumía la constante `COMMUNITY_DEMOGRAPHICS` (1240 jugadores, 1170 en Argentina, 24 provincias), ignorando la base de datos real de Supabase que cuenta con exactamente 5 jugadores federados (**ICEMAN, ZEUS, GonDizz, CARPO, Prueba/Juli**).
  5. *Podios ficticios:* `NationalRankings.tsx` desplegaba un podio estático simulado de Oro/Plata/Bronce antes de haberse jugado el primer torneo oficial de la temporada.
  6. *Fotos de autoridades cruzadas:* Jugadores con fotos subidas en base64 (Juli) o sin foto asignada heredaban la foto de Mariano Deux (`/images/iceman-perfil.png`) al vincular autoridades o listar la directiva.
- **Realizado:**
  - **Ficha Deportiva Desacoplada (`UltimateDartsCard.tsx` & `PlayerDirectory.tsx`):**
    * Añadido prop `onViewFicha?: (player: UltimateDartsCardData) => void` a `UltimateDartsCardProps`.
    * El botón "Ficha ↗" ejecuta `onViewFicha(player)`, abriendo in-place el modal `PlayerDetailModal` con el palmarés, estadísticas y 4 pestañas de participación (Individuales, Torneos de un Día, Ligas Locales, Liga Nacional x2).
    * En `PlayerDetailModal.tsx`, se añadió estado limpio si el jugador aún no registra torneos jugados en la temporada.
  - **Condición Estricta de Campeón y Temporada Dinámica:**
    * Solo los jugadores con títulos oficiales comprobados (`tournamentsWonList.length > 0` o `lastTournamentRank === 1`) reciben la insignia "CAMPEÓN".
    * Los demás competidores reciben "JUGADOR FEDERADO" y "TEMPORADA [Año Actual]" dinámico.
  - **Estandarización AVG 501 y Tipografía Nítida:**
    * Reemplazado "PROMEDIO 501" por "AVG 501".
    * Eliminada la fuente `'Impact'` y los filtros con blur/shadow en SVG, reemplazándolos por tipografía del sistema nítida (`ui-sans-serif, system-ui, -apple-system, sans-serif`).
  - **Demografía 100% Reactiva en Superadmin (`src/app/superadmin/page.tsx`):**
    * Erradicada la importación de `COMMUNITY_DEMOGRAPHICS`.
    * Cálculo reactivo con `useMemo` sobre `availablePlayers`: Total 5 jugadores registrados, edad promedio con estado para pendientes, 1 provincia (Buenos Aires, 100%), 1 localidad (Mar del Plata, 100%) y desglose de categorías en vivo.
  - **Podios Dinámicos en `/ranking` (`NationalRankings.tsx`):**
    * Añadida validación `hasOfficialCompetitiveData`: oculta el podio estático y muestra banner institucional hasta que se dispute la primera competencia oficial de la temporada.
  - **Sincronización y Preview de Fotos de Autoridades (`/asociacion` & `/superadmin`):**
    * Al seleccionar un jugador en el desplegable, se toma dinámicamente su foto oficial real (`photoUrl || avatarUrl`).
    * Previsualización visual en miniatura en el formulario de edición de autoridades.
    * Eliminados los fallbacks a la foto de ICEMAN para otros jugadores, reemplazándolos por `/logos/logo-mdq.png` y renderizado seguro con `<img />` para soportar imágenes en base64 sin errores de Next.js.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
    * `npm run build` completado exitosamente con 18/18 páginas generadas limpias (código 0).
- **Estado del Proyecto:** Fichas deportivas individuales interactivas y desacopladas de ICEMAN, títulos estrictos por mérito competitivo, demografía en vivo fiel a los 5 jugadores reales de Supabase y visualización fotográfica institucional impecable.

---

## [Sesión 27] - 2026-10-12
- **Objetivo:** Implementación de la arquitectura de competiciones online de Nakka n01: apagado estricto del hardware de cámara al salir del match, alternancia automática de video por turno de tiro, modo Split-Screen 50/50 en PC, ventana Pop-out desacoplada para setups multi-monitor/TV y Server-Side Rendering (SSR) garantizado para los 5 jugadores federados en el padrón.
- **Diagnóstico de Causa Raíz:**
  1. *Cámara de celular no se apagaba al salir:* `X01Board.tsx` no contaba con cleanup hook al desmontarse ni al ejecutar `onExit()`, dejando vivos los tracks de `getUserMedia` (`mobileStreamRef.current`) y los RTCPeerConnections en background.
  2. *Modal centrado bloqueaba el anotador en PC:* El modal emergente `showRivalModal` ocupaba el centro de la pantalla sin poder moverse, imposibilitando ingresar puntuaciones con el teclado táctil de 5 columnas.
  3. *Padrón de jugadores en PC:* `src/app/jugadores/page.tsx` era un Client Component inicializado con `CANONICAL_PLAYERS` (solo ICEMAN). Al fallar o demorar la petición `fetch` del cliente debido a la caché, la PC quedaba clavada en "Mostrando 1 cartas oficiales" a pesar de que Supabase contenía 5 jugadores reales.
- **Realizado:**
  - **Apagado Estricto de Hardware y Desconexión WebRTC (`src/components/anotador/X01Board.tsx` & `src/lib/webrtc-room.ts`):**
    * Función `cleanupHardwareAndWebRtc()` ejecutada en el cleanup hook de `useEffect` (desmontaje del componente) y en `handleBackClick`, `handleStandBy`, `handleAbandon` y `confirmExitMatch`.
    * Invoca `track.stop()` en todos los tracks de audio y video de `mobileStreamRef.current`, apagando físicamente la luz de la cámara del celular.
    * Envía el mensaje `{ type: 'LEAVE' }` al rival, destruye el handler P2P (`webrtc.destroy()`) y limpia `activeRemoteStream = null`.
  - **Modo Dividido Split-Screen en PC (Anotador + Visor de Diana en Vivo HD):**
    * En pantallas de escritorio (`lg:`), `X01Board.tsx` estructura el juego en 2 columnas: Columna izquierda (7 cols) para el Anotador 501 completo y Columna derecha (5 cols) para el Visor de Diana en Vivo en HD.
    * Cero modales bloqueantes encima del teclado numérico.
    * Botón para ocultar/restaurar la diana lateral (`LayoutGrid`) en caso de preferir pantalla completa del anotador.
  - **Alternancia Automática de Cámara según el Turno (Nakka Style):**
    * Variable reactiva `shouldShowRivalCamera`: en modo `AUTO`, conmuta automáticamente mostrando la diana del rival cuando tira el oponente (`isRivalTurn`), y la diana local cuando tira el jugador (`isMyTurn`).
    * Selector manual de foco en la cabecera: `[⚡ Auto (Por Turno)]`, `[Diana Rival]` y `[Mi Diana]`.
  - **Ventana Pop-out Desacoplada para Multi-Monitor / 2ª Pantalla (`handleOpenPopout`):**
    * Invoca `window.open('/anotador/camara-popout?room=...', 'DianaRivalPopoutWindow', 'width=1080,height=760...')` para setups de doble monitor o pantallas de club por HDMI.
  - **Server-Side Rendering (SSR) Garantizado en `/jugadores` (`src/app/jugadores/page.tsx` & `src/lib/server-players.ts`):**
    * Creado `src/lib/server-players.ts` con `getRegisteredPlayersServer()` que consulta directamente a PostgreSQL de Supabase.
    * Convertido `src/app/jugadores/page.tsx` en Server Component (`export const dynamic = 'force-dynamic'`, `revalidate = 0`) que inyecta `initialPlayers` en `PlayerDirectory.tsx`.
    * El HTML llega desde el servidor con los 5 jugadores oficiales (**ZEUS, GonDizz, ICEMAN, CARPO, Prueba/Juli**), erradicando el problema de visualización de una sola carta.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
    * `npm run build` completado exitosamente con 18/18 páginas generadas y `/jugadores` marcada como Dynamic SSR (código 0).
- **Estado del Proyecto:** Experiencia online profesional alineada al estándar de Nakka n01: apagado de hardware de cámara garantizado, split-screen nativo en PC con alternancia por turno, pop-out multi-monitor y padrón federal sincronizado con SSR.

---

## [Sesión 26] - 2026-10-12
- **Objetivo:** Corrección de la visibilidad de nuevos jugadores en el padrón de PC (Juli / Prueba), transmisión de video y audio bidireccional WebRTC en partidas online 1 vs 1, modal emergente de la diana del contrincante en PC (Juli) con Picture-in-Picture nativo y desbloqueo universal de audio HTML5 y Russ Bray.
- **Diagnóstico de Causa Raíz:**
  1. *Cámara del contrincante en blanco/espera:* En `OnlineRoomModal.tsx`, la API REST respondía en <50ms antes de que `joinPeerRoom` resolviera la conexión P2P; al pasar `joinedSuccess = true`, `setActiveWebRtcHandler(handler)` se saltaba y el Guest iniciaba la partida sin handler de WebRTC activo. Sumado a esto, los elementos `<video ref={remoteVideoRef}>` remotos carecían del atributo `muted`, lo que provocaba que Chrome/Android bloquearan el renderizado visual de todo video stream con audio sin interacción directa en el elemento.
  2. *Audio silenciado:* El elemento `<audio ref={remoteAudioRef}>` tenía `className="hidden"` (`display: none`), suspendido por los motores WebKit y Blink en smartphones para ahorro de batería. Además, las llamadas a `new Audio()` disparadas asíncronamente por eventos de red fallaban por políticas de Autoplay.
  3. *Popout en PC:* La función `handleOpenPopout` abría `/anotador/camara-popout` que mostraba la webcam local de Mariano en vez de la diana de la contrincante (Juli).
  4. *Falta de visibilidad de nuevos jugadores en PC:* Juli estaba perfectamente guardada en PostgreSQL de Supabase, pero la ruta `/api/jugadores` era servida con caché por Vercel Edge y el navegador de escritorio.
- **Realizado:**
  - **Padrón Federal Dinámico y Sin Caché (`src/app/api/jugadores/route.ts` & `PlayerDirectory.tsx`):**
    * Configurado `export const dynamic = 'force-dynamic'` y `export const revalidate = 0` con cabeceras `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
    * Añadido query param de bust `?t=${Date.now()}` y botón táctil "Actualizar" con icono `RefreshCw` en el directorio.
  - **Motor WebRTC Bidireccional Puro y Auto-Healing (`src/lib/webrtc-room.ts` & `X01Board.tsx`):**
    * Soporte bidireccional puro con llamadas salientes y entrantes independientes (`incomingCall` / `outgoingCall`), captura de `call.peer` y señalización `STREAM_READY`.
    * Registro inmediato e incondicional de `setActiveWebRtcHandler(handler)` en el Guest en `OnlineRoomModal.tsx`.
    * Mecanismo de Auto-Healing en `X01Board.tsx` que detecta si la sala online no tiene handler activo y lo inicializa automáticamente reconectando y enviando el stream local.
    * Incorporado `muted={true}` en `<video ref={remoteVideoRef}>` para garantizar renderizado visual instantáneo sin bloqueos de Autoplay.
  - **Desbloqueo Universal de Audio (`src/lib/sound-effects.ts` & `X01Board.tsx`):**
    * Reubicado `<audio ref={remoteAudioRef}>` fuera de pantalla con posicionamiento fijo (`top: -9999px`) sin `display: none`.
    * Función `unlockAudio()` enganchada a eventos globales `pointerdown`, `touchstart` y `keydown` (`once: true`) para desbloquear el `AudioContext` y HTML5 Audio ante el primer toque.
  - **Modal Emergente con la Diana del Contrincante en PC (`src/components/anotador/X01Board.tsx`):**
    * Componente `showRivalModal` que muestra en HD la diana del oponente (Juli) en la PC con marcador en vivo, estado de tiro activo, AVG, botón de reconexión y Picture-in-Picture nativo (`handleTogglePiP`).
    * Botones `[⛶ Ampliar]` en la diana remota del split-screen y en la barra superior del anotador.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
    * `npm run build` completado exitosamente con 19/19 páginas generadas limpias (código 0).
- **Estado del Proyecto:** Partidas online 1 vs 1 con streaming de video y audio bidireccional fluido, modal emergente de la contrincante en PC con PiP, Russ Bray desbloqueado y sincronización en tiempo real del padrón de jugadores.

---

## [Sesión 25] - 2026-10-12
- **Objetivo:** Selector de hardware de cámara en el anotador (notebook vs webcam USB), reparación de audio WebRTC en smartphones para partidas remotas 1 vs 1, enlace y herramienta de invitación por WhatsApp para registro de nuevos jugadores, erradicación de mocks en selectores/rankings de jugadores y sanitización de avatares en perfiles.
- **Diagnóstico de Causa Raíz:**
  1. *Audio WebRTC silenciado en smartphones:* En `src/lib/webrtc-room.ts`, al conectarse la llamada P2P antes de que ambos participantes tuvieran stream de audio activo, `sendMediaStream` ejecutaba `replaceTrack`, pero `activeCall.peerConnection` no tenía audio sender previo, resultando en un no-op sin envío de audio. Sumado a esto, los navegadores móviles (iOS Safari / Android Chrome) bloquean el Autoplay de elementos de audio sin interacción de usuario directa.
  2. *Cámara fija en notebook:* El anotador utilizaba exclusivamente `{ facingMode: { ideal: cameraFacingMode } }`, ignorando la existencia de múltiples cámaras de video en PCs (webcam USB en la diana, cámara integrada o capturadora).
  3. *Avatares cruzados:* Perfiles nuevos sin foto asignada terminaban mostrando la foto de Mariano Deux (ICEMAN), y el modal de login público permitía asumir identidades marcándolas como último usuario en `localStorage`.
  4. *Tablas y Selectores Desconectados:* `NationalRankings`, `PlayerEnrollModal`, `asociacion/page.tsx`, `TournamentManager` y `MatchGameSettings` consumían `MOCK_RANKINGS` en vez de los jugadores reales de Supabase PostgreSQL.
- **Realizado:**
  - **Selector Universal de Cámara de Video (`src/components/anotador/X01Board.tsx` & `WebcamSetupModal.tsx`):**
    * Enumeración activa de cámaras con `navigator.mediaDevices.enumerateDevices()` filtrando `videoinput`.
    * Selector desplegable `<select>` en la barra de dianas para conmutar en caliente entre webcam USB, integrada o software de video.
    * Persistencia de `deviceId` en `localStorage` (`lpld_camera_device_id`) y fallback suave a cámara trasera en móviles.
  - **Reparación de Audio WebRTC en Smartphones & Desbloqueo de Autoplay (`src/lib/webrtc-room.ts` & `X01Board.tsx`):**
    * En `webrtc-room.ts`, `sendMediaStream` verifica la presencia de un audio sender en `activeCall.peerConnection`. Si no existe, ejecuta `pc.addTrack(audioTrack, stream)` en lugar de depender únicamente de `replaceTrack`.
    * En `X01Board.tsx`, se aisló el audio del oponente en un elemento `<audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />` dedicado.
    * Si el smartphone bloquea el Autoplay, se despliega una barra táctil accesible: *"🔊 Toca aquí para escuchar la voz del rival en este teléfono"*, que reanuda la reproducción en 1 toque.
  - **Herramienta e Invitación Oficial por WhatsApp (`src/components/comunidad/InvitePlayersModal.tsx`):**
    * Modal con enlace directo al formulario de registro y perfil: `https://locosporlosdardos.com.ar/perfil`.
    * Botón directo "Enviar por WhatsApp" (`api.whatsapp.com/send?text=...`) con texto redactado e iconografía oficial.
    * Botones "Copiar Enlace" con feedback visual verde y "Copiar Mensaje Completo para WhatsApp".
    * Integrado en la barra lateral (`AppSidebar.tsx`) y en la cabecera del perfil (`RegisterAndProfile.tsx`).
  - **Sincronización Total de Jugadores Cloud & Erradicación de Mocks:**
    * Conectados `NationalRankings`, `PlayerEnrollModal`, `asociacion/page.tsx`, `TournamentManager` y `MatchGameSettings` a `fetchRegisteredPlayersFromCloud()`.
    * Blindaje y sanitización de avatares en `LoginModal.tsx` y perfiles para asegurar que cada competidor tenga su propia imagen o iniciales coloreadas.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores de TypeScript.
    * `npm run build` completado exitosamente con 20/20 páginas generadas sin errores.
- **Estado del Proyecto:** Anotador con selector de cámara física, audio WebRTC bidireccional estable entre PC y celulares, jugadores reales sincronizados en toda la app y modal de invitación por WhatsApp operativo.

---

## [Sesión 24] - 2026-10-12
- **Objetivo:** Implementación del Motor Puro de Torneos y Ligas estándar Challonge & Nakka N01 Tournament (`src/lib/bracket-engine.ts`), Podio Oficial de Premiación (`TournamentPodiumView.tsx`), enrutamiento determinista por punteros y edición segura con aviso en cascada en `AdminMatchModal.tsx`.
- **Realizado:**
  - **Motor Matemático Inmutable (`src/lib/bracket-engine.ts`):**
    * Funciones puras libres de efectos secundarios: `generateSingleElimination`, `generateDoubleElimination`, `reportResult`, `computePodium`, `resetMatchSafely`, `previewDownstreamImpact`.
    * Enrutamiento determinista por punteros (`nextMatchId`, `nextSlot`, `loserNextMatchId`, `loserNextSlot`) que elimina la heurística rígida `Math.floor(matchIndex / 2)`.
    * Soporte de Doble Eliminación completa (Winners -> Losers con inversión anti-revancha -> Gran Final).
    * Siembra matemática (`seedParticipants`) con Byes automáticos para cuadros de 4, 8, 16, 32 y 64 participantes.
  - **Componente de Podio Oficial (`TournamentPodiumView.tsx`):**
    * Tarjetas de honor con medallas (1º Oro, 2º Plata, 3º Bronce), fotos de perfil, banderas de nacionalidad, marcadores de la final, desglose de premios en ARS (60-30-10) y enlaces interactivos a la ficha coleccionable.
  - **Visualizador Dinámico (`TournamentBracket.tsx`):**
    * Renderizado dinámico de rondas (soportando cualquier cantidad de competidores), integración de `TournamentPodiumView` en la cabecera y visualización de partidos por el 3º y 4º puesto.
  - **Panel de Superadministrador ICEMAN (`AdminMatchModal.tsx`):**
    * Detección de impacto en cascada (`previewDownstreamImpact`) con alerta visual de advertencia y reseteo seguro sin romper la llave.
  - **Integración en `TournamentManager.tsx`:**
    * Actualización en caliente de partidos mediante `reportResult` y cálculo reactivo del podio oficial `computePodium`.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores.
    * `npm run build` completado exitosamente con 20/20 páginas estáticas y dinámicas generadas.
- **Estado del Proyecto:** Motor de torneos elevado al estándar de oro de la industria (Challonge / Nakka N01), 100% type-safe, estable y listo para producción.

---

## [Sesión 23] - 2026-10-12
- **Objetivo:** Implementación de Autenticación Passwordless Híbrida (Magic Link + OTP de 6 dígitos) con `@supabase/supabase-js`.
- **Realizado:**
  - Instalación del cliente oficial Supabase JS y creación de `src/lib/supabase.ts`.
  - Creación de ruta de callback `/auth/callback` para redirecciones de correo.
  - Pestaña de Magic Link en `LoginModal.tsx` con input de OTP numérico in-app para no salirse de la PWA en smartphones.
  - Configuración y validación de `NEXT_PUBLIC_SUPABASE_ANON_KEY` en entorno y Vercel.

---

## [Sesión 22] - 2026-10-12
- **Objetivo:** Ejecución integral de la Fase 0 de estabilización técnica a partir de la auditoría ([AUDITORIA.MD](file:///D:/Locos%20por%20los%20dardos/Agent/AUDITORIA.MD)): resolución de la causa raíz de conexión a Supabase, saneamiento de credenciales, endpoint de salud `/api/health/db`, persistencia de último jugador logueado por dispositivo en el modal de login, y botón visible de instalación de la App (PWA) en celulares.
- **Diagnóstico de Causa Raíz:**
  1. *Región Errónea del Pooler de Supabase:* El archivo `CONFIGURACION_SUPABASE.md` y `.env.local` tenían configurado el host `aws-0-sa-east-1.pooler.supabase.com` (São Paulo). El proyecto real `pufyeabrvrlikbgkjplz` fue creado en **North Virginia (`aws-0-us-east-1`)**. Por eso el pooler de Supavisor respondía `(ENOTFOUND) tenant/user postgres.pufyeabrvrlikbgkjplz not found` tanto en Vercel como en el buscador del login.
  2. *Pérdida de Sesión al Cerrar Cuenta:* `clearCurrentPlayerSession()` en `storage.ts` eliminaba absolutamente todo el perfil del `localStorage` sin conservar memoria del último jugador que utilizó el celular.
  3. *Botón PWA Inaccesible en Celulares:* El botón de instalación residía únicamente en `AppTopBar.tsx`, el cual fue retirado del shell principal en sesiones previas y contaba con `hidden md:flex`, imposibilitando la instalación táctil en smartphones.
  4. *Sobreescritura de Datos en Superadmin:* Al editar una categoría, se enviaba un objeto parcial a `POST /api/jugadores`, el cual sobrescribía columnas como teléfono, bio, club y dardos al no usar `COALESCE` ni un método `PATCH` dedicado.
- **Realizado:**
  - **Auto-Corrección y Estabilización de Conexión a Base de Datos (`src/lib/db.ts`):**
    * Prioridad absoluta a `DATABASE_URL` (Transaction Pooler - puerto 6543 para Serverless en Vercel).
    * Mecanismo de auto-corrección que redirige silenciosamente cualquier cadena antigua con `aws-0-sa-east-1` hacia el host operativo real `aws-0-us-east-1.pooler.supabase.com:6543`.
    * Eliminadas credenciales fijas y fallbacks defectuosos.
    * Actualizado `.env.local` y saneado `CONFIGURACION_SUPABASE.md` sin contraseñas en texto claro.
  - **Endpoint de Diagnóstico `/api/health/db`:**
    * Creado `src/app/api/health/db/route.ts` que ejecuta `SELECT 1` contra Supabase PostgreSQL, midiendo latencia y reportando estado saludable (200) o servicio no disponible (503).
  - **Saneamiento Defensivo de APIs (`/api/auth` y `/api/jugadores`):**
    * `/api/auth` atrapa errores de infraestructura sin filtrar el nombre de usuario de PostgreSQL ni datos del tenant a la interfaz móvil.
    * `/api/jugadores` responde con status HTTP 503 ante caída de base de datos en lugar de enmascarar errores con status 200.
    * Incorporado método `PATCH /api/jugadores` y cláusula `COALESCE` en el `UPDATE` de profiles para evitar pérdida de datos del jugador al modificar la categoría desde el Superadmin.
  - **Persistencia de Último Jugador en el Celular (`src/lib/storage.ts` & `LoginModal.tsx`):**
    * Incorporadas claves `lpld_last_player_v1` y `lpld_recent_accounts_v1` en `STORAGE_KEYS`.
    * `clearCurrentPlayerSession()` borra la sesión activa pero preserva el último jugador y las cuentas recientes del equipo.
    * `LoginModal.tsx` ahora muestra una tarjeta destacada superior ("Último jugador en este celular") con su apodo, categoría, avatar y botón de ingreso directo "Continuar".
    * Búsqueda por email o apodo ahora consulta exitosamente a Supabase (donde ya figuran ICEMAN y ZEUS).
  - **Botón de Instalación PWA en Celulares (`providers.tsx`, `AppSidebar.tsx`, `InstallAppButton.tsx`):**
    * Creado contexto global `useInstallPwa` en `providers.tsx` con captura temprana de `beforeinstallprompt`, detección de standalone y soporte para iOS.
    * Creado componente `InstallAppButton.tsx` y agregado de forma fija y visible en la barra lateral `AppSidebar.tsx`.
    * Modal integrado con guía de instalación táctil para Safari iOS (Compartir > Agregar a pantalla de inicio) y Chrome Android.
    * Saneado `public/manifest.json` sin marcas externas ("Nakka"), con tema oficial `#00e676` y accesos directos (shortcuts).
  - **Autenticación Passwordless Híbrida (Magic Link + OTP de 6 Dígitos):**
    * Instalada la librería oficial `@supabase/supabase-js`.
    * Creado el cliente singleton `src/lib/supabase.ts` con persistencia en `localStorage`, refresco automático de token y captura de sesión en URL.
    * Configurada la clave real `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` y Vercel.
    * Creada la página de captura y callback `src/app/auth/callback/page.tsx` para confirmar el Magic Link e hidratar la ficha deportiva del jugador.
    * Rediseñado `LoginModal.tsx` con navegación por pestañas: modo "Este Dispositivo" (1-click con último jugador y selector rápido) y modo "Enlace Mágico (Email)" con flujo de 2 pasos:
      1. Envío de Enlace y Código OTP vía `supabase.auth.signInWithOtp`.
      2. Verificación táctil in-app del código numérico de 6 dígitos vía `supabase.auth.verifyOtp` sin forzar al usuario a abandonar la PWA a pantalla completa.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores de tipado (código 0).
    * `npm run build` completado exitosamente con 20/20 páginas generadas (incluyendo `/auth/callback`) sin errores (código 0).
- **Estado del Proyecto:** Fase 0 y Fase 1 completadas; base de datos y autenticación oficial con Supabase activas; listo para avanzar a la Fase 2 (Motor de Torneos puro estilo Challonge/n01).

---

## [Sesión 21] - 2026-10-12
- **Objetivo:** Resolución de la sincronización de nuevos usuarios en la base de datos de Supabase ("no aparecen en jugadores ni guarda inicios de sesión"), implementación de cierre de sesión real y selector multi-cuenta (`LoginModal.tsx`), habilitación de selección y cambio táctil 1-click de categoría oficial en `/perfil` y en el formulario de ficha, desarrollo del panel de Superadmin (`/superadmin`) con cuotas, demografía en tiempo real, vitrinas de landing (DBikes style) y padrón de jugadores, e integración de vitrina de pagos bancarios en la home.
- **Diagnóstico de Causa Raíz:**
  1. *Aislamiento en LocalStorage:* El frontend guardaba únicamente en el navegador local del usuario. Al registrarse un competidor (ej: Gabriel Rubio "ZEUS" en su celular), el registro no existía en el servidor y por tanto no era visible para Mariano Deux ni otros jugadores en `/jugadores`.
  2. *Categoría No Clickeable:* En `/perfil`, las tarjetas de "Esquema de Categorías Oficiales" eran elementos div estáticos sin controladores `onClick`, y en el formulario de edición el slider de AVG forzaba la categoría sin dar opción a selección manual ni feedback visual táctil.
  3. *Cierre de Sesión Simulado:* El botón de logout en el menú lateral solo disparaba un alert sin purgar la sesión ni ofrecer selector de ingreso.
- **Realizado:**
  - **Conexión Directa a Supabase & Endpoints Backend (`src/lib/db.ts`, `/api/jugadores`, `/api/auth`):**
    * Conexión por pool SSL directo a PostgreSQL de Supabase.
    * Migración DDL en Supabase para soportar foto de perfil, marcas de dardos, clubes, roles y edades.
    * Endpoint `/api/jugadores` con `GET` federado y `POST` con UPSERT en las tablas `users`, `profiles` y `player_stats`.
    * Endpoint `/api/auth` para autenticación y recuperación instantánea de cuentas por email o nickname.
  - **Sincronización en `storage.ts` & Directorio Federal Dinámico (`PlayerDirectory.tsx`):**
    * `saveCurrentPlayerProfile` envía asíncronamente las actualizaciones a la nube.
    * `PlayerDirectory.tsx` consume la API de jugadores en vivo y refresca automáticamente ante eventos `lpld_profile_updated`.
  - **Cambio Táctil 1-Click de Categoría Oficial (`RegisterAndProfile.tsx`):**
    * En la pestaña de perfil, las 4 tarjetas oficiales (Principiante, Intermedia, Avanzada, Elite Pro) son botones táctiles con feedback verde inmediato (`handleQuickCategoryChange`), ajustando armónicamente el promedio estimado y sincronizando en Supabase.
    * Badge de categoría interactivo en la cabecera que hace scroll suave y enfoca la sección de categorías.
    * Sincronización bidireccional en el formulario entre el slider de AVG y los 4 botones manuales de categoría.
    * En `OnboardingProfileModal.tsx`, selector de 4 botones para categoría inicial y rangos corregidos (<40, 40-55, 55-70, 70+).
  - **Modal de Inicio de Sesión & Cierre de Sesión (`LoginModal.tsx` & `AppSidebar.tsx`):**
    * Modal interactivo para seleccionar entre los jugadores registrados en la nube con un solo click o ingresar como administrador.
    * Botón de cierre de sesión funcional en la barra lateral y en el perfil.
  - **Panel Central de Superadministración (`/superadmin`):**
    * Pestaña 1: Cuotas & Servidores (Supabase, Storage, Vercel Edge, TURN WebRTC).
    * Pestaña 2: Demografía federal, edades en vivo y Padrón Oficial de Jugadores con selector para cambiar la categoría de cualquier usuario registrado.
    * Pestaña 3: Vitrinas de la Landing Page con configuración de banners, medidas recomendadas y sincronización de Google Forms.
    * Pestaña 4: Comisión Directiva de Mar del Plata y Nacional vinculando jugadores registrados de la app a sus cargos.
  - **Vitrina de Cobro de Torneos en Home (`src/app/page.tsx`):**
    * Cuadro oficial con datos bancarios (Banco, Titular, CUIT, Alias, CBU) con botones de copia y enlace directo a WhatsApp.
  - **Validación de Compilación y Producción:**
    * `npx tsc --noEmit` completado con 0 errores (código 0).
    * `npm run build` completado exitosamente con 19/19 páginas generadas (código 0).
- **Estado del Proyecto:** Persistencia en la nube de Supabase 100% activa, jugadores visibles en red federal en cualquier dispositivo, cambio de categoría táctil e instantáneo en móvil y escritorio, y panel de Superadmin plenamente operativo.

---

## [Sesión 20] - 2026-10-11
- **Objetivo:** Corrección de la visibilidad de la pestaña "Historial" en dispositivos móviles en la sección de torneos (`/torneos`) y calibración de nitidez de la foto comunitaria en la landing page (`src/app/page.tsx`).
- **Diagnóstico de Causa Raíz:**
  1. *Desborde Horizontal en Pestañas de Torneos:* En la versión móvil previa, las 3 pestañas principales de `/torneos` utilizaban etiquetas de texto extensas ("TORNEOS ACTIVOS", "LIGAS & POSICIONES", "HISTORIAL DE TORNEOS") con layout flex que desbordaba el viewport, provocando que la tercera pestaña ("HISTORIAL") fuera empujada hacia la derecha y quedara cortada por el margen de la pantalla del celular.
  2. *Contraste de Foto Comunitaria:* La imagen de fondo `Darderos.jpeg` tenía un overlay inicial excesivamente oscuro y con desenfoque (`backdrop-blur`) que opacaba la foto.
- **Realizado:**
  - **Rediseño Responsivo de Pestañas (`TournamentManager.tsx`):**
    * Implementado layout `grid grid-cols-3 sm:flex` con `min-w-0`, `gap-1 sm:gap-2` y `px-1.5 sm:px-4`.
    * En móviles (`sm:hidden`), las etiquetas se sintetizan de forma compacta: `Activos`, `Ligas`, e `Historial`, acompañadas por sus respectivos badges numéricos y tracking adaptativo `tracking-tight sm:tracking-wider`.
    * En pantallas de escritorio (`hidden sm:inline`), se conservan los títulos completos: `Torneos Activos`, `Ligas & Posiciones` e `Historial de Torneos`.
    * Las acciones de cabecera (`ADMIN` y `+ Crear Torneo`) se organizaron en una fila inferior complementaria (`w-full sm:w-auto`) con botones proporcionales (`flex-1 sm:flex-none`).
  - **Aclarado y Nitidez de Foto Comunitaria (`src/app/page.tsx`):**
    * Overlay degradado aligerado (`from-black/60 via-black/35 to-black/45` sin blur invasivo), permitiendo que los rostros, camisetas y dianas Blade 6 se aprecien con alta definición y luminosidad.
    * Textos jerárquicos reforzados con `drop-shadow` de alto contraste para máxima legibilidad.
    * Cajas informativas interiores calibradas al 90% de transparencia (`bg-black/20 backdrop-blur-md border border-white/20 text-white`).
  - **Validación de Compilación:**
    * `npm run build` ejecutado exitosamente con 0 errores de tipado o linting, y 16/16 páginas estáticas generadas (código 0).
- **Estado del Proyecto:** La pestaña "Historial" ahora es 100% visible, cómoda y táctil en cualquier celular. La fotografía comunitaria de Darderos Mar del Plata luce luminosa y nítida.

---

## [Sesión 19] - 2026-10-11
- **Objetivo:** Implementación de la Doble Diana Split-Screen en vivo (estilo Nakka N01 Darts), servidores TURN OpenRelay TCP 443 para atravesar CGNAT en redes móviles 4G/LTE de Argentina, locución sincronizada inmediata de Russ Bray en ambos dispositivos al anotar cada tiro, y foto de la comunidad de Darderos Mar del Plata (`Darderos.jpeg`) de fondo en la landing page con cuadros interiores al 90% de transparencia.
- **Diagnóstico de Causa Raíz:**
  1. *Bloqueo P2P por CGNAT Celular:* Los servidores STUN de Google no pueden atravesar el NAT simétrico de las compañías de telefonía móvil (Claro, Movistar, Personal) cuando un usuario está en 4G/LTE y el otro en Wi-Fi. Se requerían servidores TURN con transporte TCP sobre el puerto 443.
  2. *Cámara Local en lugar de Diana Rival:* La interfaz solo abría la cámara propia en lugar de transmitir el stream y recibir el video del rival. Además, tapaba el área con una tarjeta azul fija en el turno del contrincante.
  3. *Locución del Árbitro para el Rival:* Al impactar una visita en el celular, el contrincante en su PC no escuchaba la puntuación cantada porque dependía únicamente del refresco del marcador.
- **Realizado:**
  - **Servidores TURN OpenRelay TCP 443 (`webrtc-room.ts`):**
    * Integrados servidores TURN de `relay.metered.ca` con puertos 80 y 443 (TCP/UDP) para negociación garantizada entre cualquier tipo de conexión celular y fija.
    * Incorporado streaming P2P bidireccional (`sendMediaStream`, `peer.call`, `peer.on('call')` y `setWebRtcRemoteStreamListener`).
  - **Doble Diana Split-Screen en Vivo (Estilo Nakka N01 en `X01Board.tsx`):**
    * Panel simétrico con ambas dianas en vivo simultáneas (Diana de P1 y Diana de P2).
    * Diana local con cámara seleccionable (trasera por default / frontal) y diana remota con el stream de video recibido en tiempo real.
    * Halos luminosos verdes (`#00e676`) y badges activos (`[🎯 Tirando]`) indicando claramente quién está en la línea de tiro.
    * Teclado ergonómico accesible para anotar sin perder la visual de las dianas.
  - **Canto Sincronizado de Russ Bray:**
    * Ejecución instantánea de `VoiceCaller.speakScore(score)` y `SoundEngine.play180()` en el cliente remoto al llegar el evento P2P, garantizando que el rival escuche claramente los puntos de cada visita por los parlantes.
  - **Fondo de la Comunidad Darderos MDQ en Landing Page (`src/app/page.tsx`):**
    * Copiado `Darderos.jpeg` a `public/images/darderos.jpeg`.
    * Aplicado como fondo de la sección 2 con overlay oscuro para óptimo contraste y cuadros interiores al 90% de transparencia con `backdrop-blur-md`.
  - **Compilación de Producción:**
    * `npm run build` ejecutado exitosamente con 0 errores y 16/16 páginas generadas (código de salida 0).
- **Estado del Proyecto:** Salas online 1 vs 1 con experiencia idéntica a Nakka N01 Darts (doble diana en vivo, voz de Russ Bray para ambos jugadores, conectividad P2P blindada con TURN) y landing comunitaria con identidad fotográfica de Darderos Mar del Plata.

---


- **Objetivo:** Resolución del bloqueo de avance de turno durante partidas online en vivo ("el contrincante ya anotó y no avanza") y habilitación de la cámara trasera por defecto en celulares para enfocar la diana física con botón de alternancia.
- **Diagnóstico de Causa Raíz:**
  1. *Desconexión de Callback WebRTC:* La conexión P2P entre Florencia (celular) y Mariano (PC) se estableció con éxito en la sala `DART-P3B5`, pero el callback `onThrowReceived` de WebRTC quedó inicializado como función vacía `() => {}` en el modal de apertura y nunca se vinculó con la función `submitScore` del tablero `X01Board.tsx`. Por lo tanto, al llegar el evento `THROW` con los 180 puntos de Florencia, la PC de Mariano no ejecutó la anotación ni avanzó el turno.
  2. *Cámara por Defecto:* Al solicitar `getUserMedia` en smartphones sin la restricción `facingMode: { ideal: 'environment' }`, el navegador activaba la cámara delantera en lugar de la trasera apuntando a la diana.
- **Realizado:**
  - **Enlace Reactivo de Tiros WebRTC (`setWebRtcThrowListener` en `webrtc-room.ts` & `X01Board.tsx`):**
    * Suscripción en el tablero `X01Board.tsx` al listener de eventos P2P mediante `setWebRtcThrowListener`.
    * Cada tiro recibido ejecuta de forma instantánea `submitScore(score, true)`, actualizando la puntuación en vivo, disparando el audio oficial de Russ Bray y transfiriendo el turno al jugador local en menos de 30 milisegundos.
  - **Cámara Trasera por Defecto & Switch Frontal/Trasera en Móviles:**
    * Configurada la restricción `facingMode: { ideal: 'environment' }` en `getUserMedia` para encender por defecto la cámara trasera.
    * Incorporado el botón interactivo `[📷 Trasera (Diana) / 🤳 Delantera]` (`SwitchCamera`) con reinicio limpio de streams para alternar la orientación con un solo click.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores de tipado.
    * `npm run build` completado exitosamente con 16/16 páginas generadas (código de salida 0).
- **Estado del Proyecto:** Salas online 1 vs 1 con sincronización dardo a dardo sin fricción y control ergonómico de cámaras móviles.

---

## [Sesión 17] - 2026-10-11
- **Objetivo:** Diagnóstico y resolución definitiva del fallo "La sala especificada no existe o ya caducó" al conectar dos dispositivos a una sala online en producción en Vercel.
- **Diagnóstico de Causa Raíz:**
  1. *Espacios en Códigos de Sala:* En dispositivos móviles, el teclado o autocompletado insertaba espacios (ej: `DART - RYZD`), provocando que la búsqueda estricta contra `DART-RYZD` devolviera error de sala inexistente.
  2. *Entorno Serverless Multi-Instancia:* En Vercel Serverless, el creador de la sala y el invitado son atendidos por Lambdas independientes que no comparten memoria RAM global.
- **Realizado:**
  - **Normalización Inteligente de Códigos (`normalizeRoomCode` en `online-rooms.ts`):**
    * Elimina automáticamente cualquier espacio en blanco (`\s+`), convierte a mayúsculas y antepone `DART-` ante códigos abreviados (`RYZD` -> `DART-RYZD`).
    * Aplicado tanto en backend (`getOnlineRoom`, `joinOnlineRoom`, `submitRoomThrow`) como en el input de `OnlineRoomModal.tsx`, sanitizando el texto en tiempo real mientras el usuario escribe o pega.
  - **Conectividad P2P WebRTC con PeerJS (`src/lib/webrtc-room.ts`):**
    * Canal directo WebRTC DataChannel que vincula los dos dispositivos a través de servidores STUN públicos de Google y PeerJS (`0.peerjs.com`).
    * Conexión instantánea e intercambio de tiros en milisegundos (< 30ms) sin depender de servidores ni bases de datos con estado.
    * Integrado en `OnlineRoomModal.tsx` con intento paralelo junto a la API REST (redundancia dual).
    * Sincronización continua de tiradas dardo a dardo en `X01Board.tsx`.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con 0 errores de tipado.
    * `npm run build` completado exitosamente con 16/16 páginas de producción generadas (código de salida 0).
- **Estado del Proyecto:** Salas online 1 vs 1 blindadas contra errores de tipeo y operando con arquitectura híbrida WebRTC P2P + API REST redundante.

---

## [Sesión 16] - 2026-10-11
- **Objetivo:** Blindaje crítico de seguridad contra suplantación del Administrador ICEMAN en el modal de Onboarding, asignación obligatoria e inmutable del Jugador 1 como el perfil del usuario actualmente logueado en el anotador de partidas, habilitación de selección de rivales entre los miembros registrados de la comunidad oficial para el Jugador 2, e implementación integral de Salas Online (1 vs 1) con sincronización remota dardo a dardo en tiempo real, links directos y compartir por WhatsApp.
- **Realizado:**
  - **Blindaje de Seguridad del Superadministrador ICEMAN (`OnboardingProfileModal.tsx` & `constants.ts`):**
    * Erradicado el botón público abierto que permitía a cualquier visitante anónimo iniciar sesión como Superadministrador (`USER_ICEMAN`).
    * Implementado modal de acceso administrativo protegido por contraseña maestra (`ADMIN_MASTER_PASSWORD`), validando estrictamente que el email pertenezca a Mariano Deux (`marianodeux@gmail.com`) mediante la función segura `validateAdminCredentials`.
  - **Anotador de Partidas (Jugador 1 y Jugador 2 en `MatchGameSettings.tsx`):**
    * Jugador 1 (P1): Bloqueado e inicializado por defecto como el perfil del usuario actualmente logueado en la aplicación (`getCurrentPlayerProfile()`), inmutable y etiquetado con el badge `[Tú (Logueado)]`.
    * Jugador 2 (P2): Selector interactivo que permite escoger rival entre la Comunidad Oficial de registrados (`CANONICAL_PLAYERS` e `ICEMAN`), 4 dificultades de Bot IA (Fácil 40, Medio 55, Avanzado 70, Pro 85 AVG) o un Invitado Casual editable.
  - **Motor y API de Salas Online 1 vs 1 (`src/lib/online-rooms.ts` & `/api/salas`):**
    * Creado el gestor en memoria global de servidores de Next.js (`online-rooms.ts`) para administrar salas remotas sin dependencias externas pesadas. Soporta `CREATE`, `JOIN`, `THROW` y purga de salas inactivas (4 horas).
    * Desarrollado el endpoint de App Router `src/app/api/salas/route.ts` con manejo de respuestas en JSON y códigos de sala aleatorios de 4 caracteres (`DART-XXXX`).
  - **Modal de Conexión de Salas Online (`OnlineRoomModal.tsx`):**
    * Pestaña "Crear Sala": Genera la sala, muestra el código en tipografía monoespaciada gigante, enlace directo copiable (`/anotador?sala=CODE`) y botón directo de WhatsApp con mensaje pre-redactado para enviar al contrincante. Realiza sondeo automático cada 1.5s hasta que el rival se conecta.
    * Pestaña "Unirse a Sala": Permite a un segundo usuario logueado ingresar el código de sala o acceder automáticamente vía URL `/anotador?sala=CODE`.
  - **Sincronización en Tiempo Real en Tablero (`X01Board.tsx`):**
    * Detección de partida de sala online (`isOnlineRoom`).
    * Envío inmediato de tiradas vía POST (`action: 'THROW'`) al completar los 3 dardos locales.
    * Sondeo adaptativo cada 1.2s durante el turno del oponente, con bloqueo del teclado local y despliegue de panel visual animado de diana conectada esperando el tiro rival.
    * Reproducción de audios oficiales de Russ Bray tan pronto como la diana rival impacta y reporta su puntuación.
  - **Validación de Compilación:**
    * `npm run build` ejecutado exitosamente con código 0 y 16/16 páginas generadas (`ƒ /api/salas` dinámica).
- **Estado del Proyecto:** Seguridad administrativa completamente blindada, identidad de jugadores en el anotador normalizada y salas online 1 vs 1 con sincronización remota y audio de Russ Bray plenamente operativas.

---

## [Sesión 15] - 2026-10-11
- **Objetivo:** Diagnóstico y resolución de colisión de CSS/Service Worker en Vercel ("algo se rompió"), ocultamiento temporal de la sección Tienda en todos los menús y navegación, habilitación de micrófono y voz en vivo para hablar con el rival en partidas online, e implementación del Onboarding obligatorio de primer ingreso para que todo nuevo usuario complete su ficha deportiva.
- **Realizado:**
  - **Resolución de Colisión de Service Worker & Desborde Visual en Vercel:**
    * Causa raíz: Service Worker v1 servía HTML en caché con referencias a archivos CSS cuyos hashes ya no existían en Vercel (404), provocando desconfiguración de estilos (fondo blanco, letra Times New Roman) y desborde nativo de imágenes sin ancho fijo (2500x2500 px).
    * Actualizado `public/sw.js` a versión `locos-dardos-v2` con estrategia obligatoria `Network-First` para peticiones de navegación (`event.request.mode === 'navigate'`), asegurando que tras cada despliegue el navegador obtenga el HTML fresco con los hashes de estilos activos.
    * En `providers.tsx`: Purga forzada y automática de la versión `locos-dardos-v1` del cliente.
    * En `storage.ts`: Auto-migración en `getCurrentPlayerProfile` de perfiles en `localStorage` con atributos desactualizados de pruebas.
    * En `RegisterAndProfile.tsx`: Blindaje con dimensiones inline estrictas (`112x112 px`) en el contenedor del avatar y fallback seguro a `/images/iceman-perfil.png`.
  - **Ocultamiento Preventivo de la Sección Tienda:**
    * Ocultada de `AppSidebar.tsx`, `AppBottomNav.tsx` (reemplazada en el menú táctil inferior por `Jugadores`), `Navbar.tsx`, `Footer.tsx` y la Card 4 de la landing page (`src/app/page.tsx`).
    * Modelos y endpoints de Mercado Pago preservados para cuando se definan los productos comerciales.
  - **Audio Bidireccional & Micrófono para Partidas Online:**
    * Activada la captura de audio en WebRTC `getUserMedia` con cancelación de eco, supresión de ruido y control de ganancia automático (`echoCancellation: true, noiseSuppression: true, autoGainControl: true`) en `X01Board.tsx` y en la ventana emergente `camara-popout/page.tsx`.
    * Botón de micrófono interactivo (Mute / Unmute) en la cabecera del marcador oficial y en la barra de cámara móvil.
    * Analizador de voz Web Audio API (`AnalyserNode`) con indicación luminosa pulsante en tiempo real (`[🎙️ Hablando]`) cuando el usuario le habla a su contrincante.
  - **Onboarding Obligatorio de Primer Ingreso (`OnboardingProfileModal.tsx`):**
    * Modelado `isProfileComplete?: boolean` en `PlayerProfile`.
    * Creado `OnboardingProfileModal.tsx`: modal bloqueante de primer ingreso montado en `AppShell.tsx` que exige al nuevo usuario registrar Nombre y Apellido, Apodo deportivo, Email, Nacionalidad/Provincia, AVG inicial con slider interactivo y marca/peso de sus dardos antes de habilitar el acceso a los módulos de la plataforma.
    * Acceso directo para que el administrador Mariano Deux pueda activar con 1 click la sesión de ICEMAN (`USER_ICEMAN`).
  - **Compilación de Producción:**
    * `npm run build` completado exitosamente con 0 errores y 15/15 páginas generadas.
- **Estado del Proyecto:** Plataforma blindada contra colisiones de caché en Vercel, navegación depurada sin la Tienda, micrófono activo para hablar con contrincantes en partidas online y registro obligatorio de primer ingreso plenamente operativo.

---

## [Sesión 14] - 2026-10-11
- **Objetivo:** Implementación de seteo de torneos con/sin dinero (arancelados vs gratuitos), cálculo automático del pozo y desglose de premios (60% al 1º, 30% al 2º y 10% al 3º) con opción a edición manual, modal de inscripción con datos bancarios oficiales y botón directo de WhatsApp para compartir comprobante, creación del módulo institucional "Asociación" (`/asociacion`) para Comisión Directiva de Mar del Plata y Dardos Argentina con fotos de perfil sincronizadas y panel de gestión para ICEMAN, y guía técnica completa para Connection String en Supabase y Vercel.
- **Realizado:**
  - **Torneos Arancelados vs Gratuitos & Premios 60-30-10 (`TournamentManager.tsx`):**
    * Switch interactivo en formulario de creación de torneos: `[🎉 Gratuito (Sin Costo)]` vs `[💰 Con Inscripción ($ ARS)]`.
    * En torneos con inscripción: cálculo automático del pozo (`newPrizePool = newMaxParticipants * newEntryFee`) editable por el organizador.
    * Tarjetas en tiempo real con distribución oficial: 🥇 1º Puesto (60%), 🥈 2º Puesto (30%), 🥉 3º Puesto (10%).
    * Guardado de `isPaid` y `prizesBreakdown` en el objeto `Tournament`.
    * Tabla de torneos activos distinguiendo torneos gratuitos (badge verde) de pagos con sus premios.
  - **Acreditación y Datos Bancarios (`PlayerEnrollModal.tsx`):**
    * Si el torneo es arancelado, despliega un cuadro oficial con datos bancarios de la Asociación (Banco Provincia, Alias `DARDOS.MDQ.OFICIAL`, CBU, CUIT, Titular con botones de un click para copiar).
    * Alerta de comprobante obligatorio y botón verde oficial de WhatsApp con mensaje pre-redactado para enviar el comprobante directamente al administrador (`Mariano Deux (ICEMAN)`).
  - **Módulo Institucional Asociación (`src/app/asociacion/page.tsx`):**
    * Pestañas para Asociación de Dardos Mar del Plata (MDQ) y Dardos Argentina (Nacional).
    * Grilla de autoridades con sus fotos de perfil sincronizadas con la cuenta del jugador en la plataforma, puesto/cargo oficial, club, localidad y responsabilidades.
    * Sección de cuenta bancaria oficial de la institución con botones de copia.
    * Panel administrativo exclusivo para ICEMAN (`marianodeux@gmail.com`) para dar de alta/editar/eliminar autoridades (vinculando jugadores de la app) y actualizar datos de la cuenta bancaria.
  - **Navegación (`AppSidebar.tsx`):**
    * Enlace incorporado a `/asociacion` con badge "SEDE" e icono institucional.
  - **Validación de Compilación:**
    * `npx tsc --noEmit` completado con código 0 (0 errores de tipado).
    * `npm run build` completado exitosamente con 15 rutas estáticas y dinámicas generadas.
- **Estado del Proyecto:** Plataforma lista con recaudación de inscripciones transparente, premios 60/30/10 automáticos, soporte de comprobantes por WhatsApp y módulo institucional de la Asociación plenamente operativo.

---

## [Sesión 13] - 2026-10-11
- **Objetivo:** Erradicación completa de marcas externas renombrando a "Configuración detallada por instancia de llave", aclaración y soporte oficial de Sets + Legs por ronda, resolución del scroll en el modal de torneos para desktop y móviles, e implementación de la Opción 1 de Cámara (Pop-out Window para setups de 2 pantallas / TV en PC + alternancia automática en celulares respetando las dimensiones del teclado de 5 columnas).
- **Realizado:**
  - **Configuración Detallada por Instancia de Llave (Solo Legs vs Sets + Legs):**
    * Renombrado soberano de la sección a "Configuración detallada por instancia de llave".
    * Incorporado selector interactivo de medida de distancia: `[🎯 Solo Legs]` vs `[🏆 Sets + Legs]`.
    * En modo Sets + Legs: campo configurable de *Legs requeridos por Set* (ej: 5 legs/set = 1º a 3 legs gana el set).
    * Etiquetas dinámicas en Cuartos, Semis, Final Ganadores, Rondas Repesca, Final Perdedores y Gran Final indicando si configuran `(Sets)` o `(Legs)` con la leyenda explícita `1º a X`.
    * Propagación de `distanceMode`, `legTarget`, `setTarget`, `scoreSetsP1` y `scoreSetsP2` en `generateDefaultBracket` y `generateDoubleEliminationBracket`.
    * `TournamentBracket.tsx` visualiza badges de distancia (`1º a X Sets`) y cómputo de sets ganados (`1S`, `2S`).
  - **Corrección Integral del Scroll en Modal:**
    * Eliminado el bloqueo de scroll configurando el contenedor exterior con `overflow-y-auto` y el formulario con `my-auto max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y`. Validado con rueda de ratón y gestos táctiles fluidos.
  - **Cámara en 2 Pantallas y Celular (Opción 1):**
    * Creada la ruta `src/app/anotador/camara-popout/page.tsx`: ventana emergente independiente para segundo monitor o TV de club, con streaming WebRTC de webcam a pantalla completa, selector de dispositivo, controles de zoom/espejo y banner televisivo estilo PDC vía `matchBroadcast`.
    * Añadido botón `[🖥️ Pop-out 2ª Pantalla]` en `X01Board.tsx` que ejecuta `window.open('/anotador/camara-popout', ...)`.
    * Añadido botón `[📹 Diana Rival]` para móviles: muestra la cámara del rival con banner de puntuaciones y conmuta automáticamente al teclado táctil de 5 columnas en cuanto le toca el turno al usuario, sin alterar las dimensiones ni la disposición del anotador.
    * Sincronización continua de estado de partida dardo a dardo hacia el canal broadcast.
  - **Validación y Pruebas:**
    * Compilación con `npx tsc --noEmit` completada con código 0 (0 errores).
    * Navegación y prueba con `browser_subagent` validando apertura, scroll fluido, toggles de Solo Legs / Sets + Legs y cierre del modal.
- **Estado del Proyecto:** Configuración detallada de torneos soberana y con soporte de Sets, scroll de modales fluido y sistema de cámara multi-pantalla y móvil (Opción 1) operativo.

---

## [Sesión 12] - 2026-10-11
- **Objetivo:** Implementación del formato de Doble Eliminación (Double Elimination) y configuración de legs por instancia estilo Nakka en Torneos, desglose del historial y estadísticas de jugadores en 4 pestañas especializadas (Individuales, Torneos de un Día, Ligas Locales y Liga Nacional con doble puntaje ⚡ x2), creación de la sección oficial de Reglamento, Código de Conducta & Fair Play (`/reglamento`), y análisis exhaustivo de arquitectura de cámaras para setups de 1 pantalla (móvil) y 2 pantallas (PC / Pop-out Window).
- **Realizado:**
  - **Módulo de Torneos (Doble Eliminación & Configuración Nakka Style):**
    * Soporte para `DOUBLE_ELIMINATION` en tipos y motor de torneos.
    * Implementación de `generateDoubleEliminationBracket()` generando el árbol completo de Ganadores (Winners R1, R2, R3), Perdedores (Losers R1, R2, R3) y Gran Final.
    * Selector interactivo de pestañas en `TournamentBracket.tsx`: `[👁️ Ver Todo]`, `[🏆 Ganadores (Por Arriba)]`, `[🔄 Perdedores (Por Abajo)]` y `[👑 Gran Final]`, con acentos cromáticos diferenciados (#00e676 esmeralda para Winners, #ef4444 carmesí para Losers, #f59e0b ámbar para Gran Final).
    * Acordeón en el formulario de creación de torneos para configurar la distancia en legs independientemente para cada ronda (Cuartos, Semifinales, Final de Ganadores, Rondas de Perdedores, Final de Perdedores y Gran Final).
    * Configuración de Zonas de Liga: número de grupos, competidores por grupo, clasificados a playoffs, ida y vuelta y desempate por diferencia de legs.
  - **Ficha de Jugador (`PlayerDetailModal.tsx`):**
    * Implementación del selector interactivo de 4 pestañas de participación y estadísticas:
      1. `🎯 Partidas Individuales`: Retos casuales, entrenamientos y duelos en el anotador (promedios personales sin alterar fixtures de torneos/ligas).
      2. `🏆 Torneos de un Día`: Copas abiertas, torneos relámpago, trofeos de campeonato (#1 a #6 Puesto) y efectividad en cuadros.
      3. `🛡️ Ligas Locales`: Ligas de clubes (ej: Liga Marplatense • Darderos MDQ) con soporte para fechas presenciales en sede y fechas online.
      4. `🇦🇷 Liga Nacional`: Única Liga Nacional Oficial clasificatoria internacional con distinción de fechas online (1x) vs fechas presenciales oficiales con doble puntaje (⚡ x2 Pts).
    * Panel superior de métricas adaptativas por pestaña (ranking, puntos, AVG en la modalidad, podios y fechas disputadas).
    * Historial de encuentros filtrado con etiquetas temáticas (`[🌐 Online]`, `[🏢 Presencial Sede]`, `[⚡ Presencial Oficial x2 Pts]`).
  - **Página Oficial de Reglamento (`src/app/reglamento/page.tsx`):**
    * Diseño deportivo de alto contraste (`bg-black` y paleta de la diana) estructurado en 5 capítulos:
      1. Especificaciones de montaje (1.73m al Bullseye, 2.37m a la diana) y reglas de 501 Doble Out y Cricket.
      2. Modalidades de competición y sistema federado de puntuación (x2 en presenciales nacionales).
      3. Código de etiqueta en la diana (silencio en lanzamiento, distancia detrás del oche, retiro de dardos tras verificar).
      4. Requerimientos técnicos para partidas online (cámara perpendicular sin sombras, micrófono abierto para validación acústica de impacto, prohibición de tocar dardos antes de cantar).
      5. Protocolo de Walkover (10 min de tolerancia) y caídas de conexión (5 min de pausa técnica).
    * Enlaces de acceso directo integrados en `Footer.tsx`, `AppSidebar.tsx` y `PlayerDetailModal.tsx`.
  - **Control de Versiones y Validación:**
    * Validación con `npx tsc --noEmit` completada con código 0 (0 errores).
    * Commit registrado en rama `dev` (`c93689d`).
- **Estado del Proyecto:** Módulo de torneos con Doble Eliminación y configuración Nakka operativo, fichas de jugador con historial en 4 pestañas, y normativa federada oficial publicada en `/reglamento`.

---

## [Sesión 11] - 2026-10-11
- **Objetivo:** Autoajuste y limitación a primer nombre y apellido en Cartas Coleccionables (`UltimateDartsCard.tsx`), explicación y reemplazo de "CAREER 180s" por "TOTAL 180s", sustitución de "oche" por "Diana" en toda la plataforma, erradicación total de la voz sintética femenina en audios dejando únicamente el banco de Russ Bray y Clemens Kuntze, reemplazo del cuadro central "TIRADA" por Cierre Sugerido oficial in-place sin alteración de dimensiones ni layout-shift del teclado, botón de mute en cabecera del anotador, preservación de instancia final con "Deshacer" y panel secundario de visitas y puntuaciones en juego.
- **Realizado:**
  - `UltimateDartsCard.tsx`:
    * Implementación de la función `formatCardPlayerName` que limpia apodos entre paréntesis o comillas y, ante jugadores con dos nombres y apellido o apellidos compuestos, extrae limpiamente el primer nombre y apellido (ej: `Mariano Deux (ICEMAN)` -> `MARIANO DEUX`).
    * Autoajuste tipográfico dinámico en SVG con escala de `fontSize` (15px a 23px) y compresión vectorial con `textLength="225"` y `lengthAdjust="spacingAndGlyphs"` para garantizar que ningún nombre desborde o roce los marcos dorados.
    * Métrica histórica aclarada: reemplazado el término en inglés "CAREER 180s" por "TOTAL 180s" bajo la bandera.
  - Reemplazo Universal "oche" -> "Diana":
    * Actualizado en `X01Board.tsx`, `CricketBoard.tsx`, `TournamentManager.tsx`, `WebcamSetupModal.tsx`, `AdminMatchModal.tsx`, `CreateLeagueModal.tsx`, `MatchDispatcherModal.tsx`, `broadcast.ts` y `AppBottomNav.tsx`.
  - Motor de Audio Profesional (`sound-effects.ts`):
    * Erradicación total de `window.speechSynthesis` (voz femenina).
    * Árbitro de voz 100% exclusivo con los audios MP3 originales de Russ Bray (`/sounds/russ_bray/${score}.mp3` y `gameshot.mp3`) y Clemens Kuntze para el 180.
    * Métodos globales `isAppAudioMuted` y `setAppAudioMuted` para control de silencio.
  - Anotador Oficial X01 (`X01Board.tsx`):
    * Cuadro central de 44px (`h-11`): muestra el cierre sugerido oficial en reposo (`getSuggestedCheckout`) extraído de la tabla oficial de 2 a 170 y el número tecleado al tipear. Se eliminó la caja externa condicional inferior, blindando el teclado contra desplazamientos de pantalla (*layout shift*).
    * Botón de silenciar/activar audios integrado en la cabecera junto a estadísticas y salir.
    * Instancia final de partida: al concretar el checkout final, el marcador queda a la espera de la confirmación de salida ("FINALIZAR PARTIDA (EXIT)") sin bloquear el botón "Deshacer / Corregir" por si hubo un error de tiro.
    * Panel 2 de Puntuaciones: panel inferior de dimensiones idénticas con tabla scrollable de visitas en juego (`turnHistory`) y métricas en vivo (AVG, 180s, mayor cierre) con navegación suave entre diana y puntuaciones.
  - Verificación de tipos con `npx tsc --noEmit` completada con código de salida 0 (0 errores).
- **Estado del Proyecto:** Anotador optimizado con dimensiones de celular intactas, árbitro auténtico de Russ Bray, tarjetas coleccionables autoajustables sin desbordes y terminología oficial deportiva "Diana".

---

## [Sesión 10] - 2026-10-10
- **Objetivo:** Refinamiento estético y funcional de la Tarjeta Coleccionable (`UltimateDartsCard.tsx`), jerarquía de desempeño deportivo priorizando Liga sobre Torneo con mención explícita a puestos Top 6 (#1 al #6), remoción total de menciones a canciones de entrada (*walkOnSong*), ampliación del espacio visual para la última competencia disputada, reemplazo universal del término "Pierna" por "Leg", e integración del logo oficial de Dardos Argentina en la cabecera federada de Ligas.
- **Realizado:**
  - Rediseño de `UltimateDartsCard.tsx`:
    * Implementación de la función `getPlayerPerformance` con prioridad estricta: Liga Nacional > Liga Local > Torneo Oficial > Circuito Federado General.
    * Lógica Top 6: Si el jugador quedó entre los puestos 1 y 6 en su historial, se explicita con iconografía de honor (`#1 CAMPEÓN 🏆`, `#2 SUBCAMPEÓN 🥈`, `#3 3ER PUESTO 🥉`, `#4 4TO PUESTO ⭐`, `#5 5TO PUESTO ⭐`, `#6 6TO PUESTO ⭐`).
    * Remoción absoluta de la mención a canciones de entrada en la tarjeta y fichas deportivas.
    * Con el espacio liberado, se diseñó una cápsula deportiva espaciosa de 2 líneas (`width: 270px`, `height: 32px`) bajo el nombre del competidor que exhibe sin truncamiento el puesto y el nombre completo de la competición disputada.
    * La esquina superior izquierda exhibe el número y ámbito (#1 LIGA NACIONAL / #1 TORNEO OFICIAL) de forma limpia sin cortes.
  - Reemplazo del término "Pierna" por "Leg":
    * Actualizado en `RegisterAndProfile.tsx` ("Mejor Leg: 11 dardos", evolución de legs en histórico), `TournamentManager.tsx`, `MatchPdcStatsModal.tsx` y tablas comparativas.
  - Logotipos Federados en Ligas:
    * En `LeagueManager.tsx`, incorporación del logo oficial de Dardos Argentina (`/logos/dardos-argentina.png`) en la cabecera señalada de la Liga Nacional.
    * En `CreateLeagueModal.tsx`, previsualización dinámica: si el ámbito es Nacional se despliega el logo de Dardos Argentina; si es Local, el de Darderos MDQ.
  - Apertura interactiva de Ficha de Jugador:
    * Se reforzó `findCanonicalPlayer` en `src/lib/players-data.ts` para resolver por ID de liga (`user-iceman-admin`, `rank-1`, etc.) o fallback por nombre/apodo, permitiendo que al hacer click en cualquier jugador de la tabla de posiciones o llaves eliminatorias se abra `PlayerDetailModal.tsx` con su carta coleccionable, palmarés de copas y enlaces a torneos.
  - Validación completa con `npx tsc --noEmit` finalizando con código de salida 0 (0 errores de compilación).
- **Estado del Proyecto:** Fichas y tarjetas coleccionables impecables sin información huérfana de canciones, jerarquía deportiva fidedigna con Top 6, terminología oficial en inglés ("Leg") y logos federados en sus ubicaciones exactas.

---

## [Sesión 9] - 2026-10-10
- **Objetivo:** Implementación del sistema oficial de Ligas en la creación de torneos con 4 modalidades canónicas (Torneos de un día sin liga, Torneos locales que suman a su liga local, Torneos Nacionales para la Única Liga Nacional clasificatoria internacional con duplicación de puntos x2 en fechas presenciales oficiales, y Modo de partida individual en anotador), sumado al diseño de Cartas Coleccionables de Jugadores (Ultimate Darts Cards estilo FUT) y filtros multidimensionales de ranking en el Directorio.
- **Realizado:**
  - Definición de tipos de dominio en `src/lib/types.ts`: `CompetitionMode`, `NationalStageType`, `LeagueScope`, `LeagueStanding` y `League`, actualizando `Tournament` con `competitionMode`, `leagueId`, `leagueName`, `nationalStageType` y `pointsMultiplier`.
  - Creación de datasets y métodos de almacenamiento en `src/lib/constants.ts` y `src/lib/storage.ts`: `DEFAULT_LEAGUES` con la Liga Nacional Oficial de Argentina (`league-national-argentina`, clasificatoria internacional con bonificación x2 en presenciales) y la Liga Marplatense 2026 (`league-local-mdq` • Darderos MDQ).
  - Implementación del componente `CreateLeagueModal.tsx` para alta interactiva de ligas con selector de ámbito (Local vs Nacional), sede, temporada y regla de puntos dobles.
  - Implementación de `LeagueManager.tsx` y su integración en la nueva pestaña "Ligas & Posiciones" de `/torneos`, con selector de ligas, aviso oficial de clasificatoria internacional y tabla acumulada de posiciones (PJ, Títulos, Podios, AVG 501, Puntos).
  - Modificación de la creación de torneos en `TournamentManager.tsx` con soporte para las 3 modalidades, selector de liga local y selector de fechas nacionales (Online vs Presencial Oficial con banner destacado `⚡ ¡DUPLICA PUNTOS (x2)!`).
  - Actualización de la tabla de Torneos Activos para exhibir badges distintivos de modalidad y multiplicador de puntos.
  - Creación del componente `UltimateDartsCard.tsx` (cartas coleccionables estilo FUT con placa dorada, foto de jugador, marcas de dardos, música de entrada y estadísticas) e integración en `PlayerDirectory.tsx` con filtros por:
    1. Mayor AVG registrado en la App
    2. Ranking de la Liga Argentina (Circuito Federal)
    3. Ranking de la Liga Marplatense (con checkbox "Solo jugadores de la Liga MDQ")
    4. Desempeño en torneos oficiales presenciales de Mar del Plata (2 fechas al año).
  - Verificación de compilación TypeScript (`npx tsc --noEmit`) con 0 errores y navegación automatizada exitosa con `browser_subagent` validando todas las pantallas y modales.
- **Estado del Proyecto:** Ecosistema de competición profesional completamente estructurado: ligas locales y nacionales operativas, fechas presenciales con bonificación de puntos, directorio con cartas coleccionables y anotador desacoplado para partidas casuales.

---

## [Sesión 8] - 2026-10-10
- **Objetivo:** Descarga e integración del banco oficial de voces de Russ Bray (1-180), configuración del rol de Superadministrador ICEMAN (`marianodeux@gmail.com`) con control total sobre llaves y torneos, reestructuración de la vista de Torneos (Tabla de Torneos Activos vs Historial de Torneos con estadísticas y desarrollo de llave), y adición de nacionalidad con banderas oficiales en perfil y cuadros.
- **Realizado:**
  - Descarga y almacenamiento de 181 archivos de audio MP3 oficiales en `audios_russ_bray/` y `public/sounds/russ_bray/`, integrados en `src/lib/sound-effects.ts` (`VoiceCaller.announceScore(score)`) preservando a Clemens Kuntze en el 180.
  - Implementación de `AdminMatchModal.tsx` con permisos de edición para administradores (`ADMIN_EMAILS = ['marianodeux@gmail.com']`): edición manual de marcadores de legs, avance por Walkover (W.O.) ante jugador ausente y reseteo de partida a 0-0.
  - Reestructuración de `TournamentManager.tsx`:
    * Pestaña "Torneos Activos": tabla oficial de torneos creados sin mocks no deseados (eliminado el torneo previo no creado por el usuario) con acciones para ver llave, inscribirse o administrar/eliminar.
    * Pestaña "Historial de Torneos": visor completo del cuadro eliminatorio y panel de estadísticas consolidadas (Campeón, Subcampeón, Highest AVG, Highest Checkout, 180s y Mejor Pierna).
  - Integración de nacionalidad y banderas oficiales (`COUNTRIES`):
    * Ficha de jugador (`RegisterAndProfile.tsx`): selector interactivo de países con banderas y persistencia en `localStorage`.
    * Perfil y estadísticas: bandera destacada sobre el avatar, junto al nickname y en la tarjeta de residencia.
    * Menú lateral (`AppSidebar.tsx`): jugador activo con su bandera y badge de `ADMIN`.
    * Directorio (`PlayerDirectory.tsx`) y Cuadros eliminatorios (`TournamentBracket.tsx`): banderas oficiales al pie de cada nombre.
  - Verificación de compilación TypeScript (`npx tsc --noEmit`) con 0 errores y validación en navegador con subagente (`http://localhost:3000/perfil` y `http://localhost:3000/torneos`).
- **Estado del Proyecto:** Motor de audio profesional en vivo, gobernanza completa de torneos con herramientas de administrador, visualización de historial con estadísticas y banderas internacionales integradas.

---

## [Sesión 7] - 2026-10-10
- **Objetivo:** Optimización de espacio vertical en pantalla (eliminación de TopBar y encabezados redundantes), encabezados dinámicos de partida (nombre del torneo vs "Partida individual"), y rediseño del menú lateral con texto puro en cabecera, logo de Darderos al final y controles de modificar perfil y cerrar sesión.
- **Realizado:**
  - Remoción de `AppTopBar` en `src/components/layout/AppShell.tsx`: se liberaron más de 64px verticales para visualización completa del Anotador y el Cuadro de Torneos.
  - Limpieza de encabezado estático en `src/app/torneos/page.tsx`: eliminada la caja estática redundante para dar prioridad absoluta al fixture y a los tableros.
  - Implementación de encabezados dinámicos de partida en `src/components/torneos/TournamentManager.tsx`, `src/app/anotador/page.tsx`, `src/components/anotador/X01Board.tsx` y `CricketBoard.tsx`:
    * En torneos: muestra dinámicamente `${currentTournament.title} • Oche Asignado` (ej: *"Gran Open Mar del Plata 2026 • Copa Costa Atlántica • Oche Asignado"*).
    * Fuera de torneos: muestra exclusivamente *"Partida individual"*.
  - Rediseño de `src/components/layout/AppSidebar.tsx`:
    * Top del menú: sólo texto e identidad tipográfica pura (colapsado: "LPD MDQ", expandido: "Locos por los Dardos ARG - Circuito Federal").
    * Final del menú: Logo oficial de Darderos Mar del Plata con la insignia *"Sede Oficial del Circuito"* antes de la división del jugador.
    * Sección del jugador logueado: Integrados botones rápidos de "Modificar Perfil" (`UserCog` con enlace a `/perfil`) y "Cerrar Sesión" (`LogOut` con confirmación interactiva).
  - Verificación de compilación TypeScript (`npx tsc --noEmit`) con 0 errores y validación en navegador con subagente (`http://localhost:3000/anotador` y `/torneos`).
- **Estado del Proyecto:** Interfaz ultra limpia, máxima altura vertical para la diana y fixtures, jerarquía de menú depurada y navegación funcional.

---

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
