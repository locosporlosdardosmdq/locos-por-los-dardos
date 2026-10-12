# AUDITORÍA TÉCNICA — Locos por los Dardos

> **Fecha:** 2026-10-12 · **Tipo:** auditoría de SOLO LECTURA (no se modificó código fuente).
> **Destinatario:** agente de desarrollo que implementará los cambios.
> **Stack:** Next.js 15 (App Router) + React 19 + TS + Tailwind · PWA · Supabase PostgreSQL vía `pg` · Vercel · rama de trabajo `dev`.
> **Regla del proyecto:** nunca merge/push a `main` automáticamente; dar comandos al usuario.
> **Nota de seguridad:** en este documento los secretos figuran como `<REDACTED>`. No copiarlos a ningún archivo versionado.

---

## 0. RESUMEN EJECUTIVO

| # | Problema | Severidad | Causa raíz |
|---|----------|-----------|------------|
| 1 | Solo aparece ICEMAN; los nuevos registros no se ven; buscador del login falla con `(ENOTFOUND) tenant/user postgres.<ref> not found` | 🔴 Crítico | Cadena de conexión a Supabase incorrecta en Vercel (pooler/región/usuario) + fallos silenciosos que ocultan el error |
| 2 | Contraseña de BD hardcodeada y versionada en Git | 🔴 Crítico | `src/lib/db.ts` y `CONFIGURACION_SUPABASE.md` |
| 3 | No existe autenticación real; privilegios de admin se otorgan por email/rol guardados en el cliente; las APIs no validan permisos | 🔴 Crítico | Diseño actual (localStorage + `NEXT_PUBLIC_*`) |
| 4 | Registro "exitoso" local que nunca llega a la BD (sin aviso) | 🔴 Crítico | `saveCurrentPlayerProfile` no verifica `res.ok` |
| 5 | Modal de login no muestra el último jugador del dispositivo | 🟠 Alto | `clearCurrentPlayerSession` borra todo; no hay "último jugador" |
| 6 | No hay botón de instalar la app en celular | 🟠 Alto | El único botón estaba en `AppTopBar` (oculto en móvil y removido del shell) |
| 7 | Torneos y ligas 100 % en `localStorage`, llave fija de 8, bugs de avance de llave | 🔴 Crítico | `TournamentManager.tsx` monolítico (~2400 líneas) sin motor de llaves |
| 8 | Panel admin de partidos limitado; no puede editar toda la llave de forma segura | 🟠 Alto | `AdminMatchModal.tsx` solo edita legs/ganador/W.O. |
| 9 | Cambiar categoría desde superadmin pisa datos del jugador | 🟠 Alto | Se envía objeto resumido al `POST /api/jugadores` (upsert) |
| 10 | Datos de Superadmin (demografía, infraestructura, vitrinas, autoridades, cuenta de pago) estáticos o en localStorage | 🟠 Alto | `community-analytics.ts` mock; configuración guardada por dispositivo |
| 11 | Múltiples componentes leen jugadores de listas estáticas (solo ICEMAN) | 🟠 Alto | `CANONICAL_PLAYERS`, `MOCK_RANKINGS` |
| 12 | Deuda técnica menor (manifest, limpieza, tests, CRLF/LF) | 🟡 Medio | — |

### Decisiones que necesita el usuario (preguntar antes de implementar)
1. **Autenticación:** ¿Supabase Auth (magic link/OTP por email, recomendado) o PIN por jugador con hash + cookie de sesión firmada (más simple, menos seguro)?
2. **Rotar la contraseña de la BD ya mismo** (necesario; la actual está expuesta en el repo en GitHub).
3. **Tiempo real de llaves:** ¿Supabase Realtime o polling cada 5–10 s? (Recomendado: polling primero, Realtime luego.)
4. **Tamaños de llave a soportar:** 4/8/16/32/64 con byes (recomendado) y formatos SE, DE, Round Robin, grupos + llave.

---

## 1. 🔴 CONEXIÓN A BASE DE DATOS — Error `(ENOTFOUND) tenant/user postgres.pufyeabrvrlikbgkjplz not found`

### 1.1 Diagnóstico
- Ese mensaje lo emite **Supavisor** (pooler de Supabase), no la app. Significa: *"el usuario `postgres.<project-ref>` no existe en el pooler al que te conectaste"*. Es decir, **host/región del pooler incorrecto** (ej. `aws-0-sa-east-1` vs `aws-1-sa-east-1`) o proyecto en otra región.
- `src/lib/db.ts` resuelve `process.env.DIRECT_URL || process.env.DATABASE_URL || <cadena hardcodeada>`. En Vercel, `DIRECT_URL` tiene prioridad y apunta a un pooler (según `CONFIGURACION_SUPABASE.md`: `aws-0-sa-east-1...:5432`) cuya región/prefijo probablemente no coincide con el del proyecto.
- La conexión directa `db.<ref>.supabase.co:5432` funciona en local pero es **solo IPv6** → **no funciona en Vercel serverless**. Por eso en local anda y en producción no.
- `.env.local` **no se despliega**: las variables deben estar cargadas en *Vercel → Settings → Environment Variables* (Production + Preview).

### 1.2 Cambios sugeridos
1. En Supabase → botón **Connect** → copiar **exactamente** la cadena *Transaction pooler* (puerto **6543**, `?pgbouncer=true`) para `DATABASE_URL` y *Session pooler* (5432) para migraciones (`DIRECT_URL`) **solo si se usan migraciones**.
2. Cargar en Vercel `DATABASE_URL` (pooled). Redeploy.
3. En `src/lib/db.ts`:
   - Usar **`DATABASE_URL` primero**, `DIRECT_URL` solo en scripts locales.
   - **Eliminar** el fallback con credenciales hardcodeadas (líneas ~7 y ~17).
   - **Eliminar** el hack de reemplazo de host (líneas ~15–18).
   - Si falta la variable: lanzar error claro en server (`throw new Error('DATABASE_URL no configurada')`), no usar valores por defecto.
   - Configurar `Pool` con `max` bajo (3–5) para serverless, `ssl: { rejectUnauthorized: false }` si el pooler lo requiere, `connectionTimeoutMillis` ≈ 5000.
4. Crear endpoint de diagnóstico **protegido** (solo admin) `GET /api/health/db` que ejecute `SELECT 1` y devuelva `{ ok, latencyMs }` (sin exponer el mensaje crudo).
5. **No devolver `err.message` crudo** al cliente en `/api/auth` y `/api/jugadores` (fuga de información interna: usuario, ref del proyecto). Devolver `503 { error: 'SERVICIO_NO_DISPONIBLE' }` y loguear en servidor.

---

## 2. 🔴 SEGURIDAD

### 2.1 Secretos expuestos
- Contraseña de BD `<REDACTED>` en:
  - `src/lib/db.ts` (líneas ~7 y ~17),
  - `CONFIGURACION_SUPABASE.md` (líneas ~13, 26, 32, 94, 95) — **archivo versionado en GitHub**.
- `Agent/DECISIONS.md` (ADR) también registra la cadena de conexión: **verificar y redactar**.
- `ADMIN_MASTER_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PIN || 'ICEMAN2026!'` en `src/lib/constants.ts` (~L298): `NEXT_PUBLIC_*` se **incluye en el bundle del navegador** y además tiene valor por defecto hardcodeado. Cualquiera puede leerlo desde DevTools.

**Acciones:**
1. **Rotar contraseña de BD** en Supabase (Project Settings → Database → Reset password) y actualizar Vercel.
2. Quitar secretos de código y docs (usar placeholders). Considerar limpiar historial (`git filter-repo` / BFG) — decisión del usuario; mínimo, asumir el secreto comprometido.
3. Eliminar `ADMIN_MASTER_PASSWORD` del cliente. La verificación de admin debe ocurrir **en servidor**.
4. Agregar `CONFIGURACION_SUPABASE.md` a `.gitignore` o sanitizarlo.

### 2.2 Sin autenticación real / escalada de privilegios
- El login (`/api/auth`) es solo por **email o apodo**: cualquiera puede "entrar" como cualquier jugador.
- `isUserAdmin(email)` (`constants.ts` ~L306) y `isAdmin = isUserAdmin(currentUser.email) || role === 'ADMIN'` se evalúan **en el cliente** (`TournamentManager.tsx` ~L210, `asociacion/page.tsx` ~L61, `superadmin/page.tsx` ~L88–90). El estado vive en localStorage, editable por cualquiera.
- `RegisterAndProfile.tsx` (~L185) asigna `role: 'ADMIN'` si `isUserAdmin(email)`: **registrarse con el email del admin otorga privilegios**.
- `POST /api/jugadores` hace upsert buscando por `user_id` o `LOWER(nickname)`: **cualquiera puede sobrescribir el perfil de ICEMAN o de otro jugador** y crear `users.role = 'ADMIN'`.
- **Ningún endpoint API valida identidad ni rol.**

### 2.3 Cambios sugeridos (modelo objetivo)
- **Opción A (recomendada): Supabase Auth** (email OTP / magic link). Tabla `users` enlazada a `auth.users.id`. Rol (`ADMIN`, `ORGANIZER`, `PLAYER`) **solo en BD**, nunca derivado del email en cliente.
- **Opción B: PIN por jugador** (4–6 dígitos, hash `bcrypt/argon2` en `users.pin_hash`) + sesión por **cookie httpOnly firmada (JWT/`iron-session`)**, rate-limit por IP+apodo (5 intentos/15 min).
- Helper server `requireSession()` / `requireRole('ADMIN')` usado en **todas** las rutas de escritura (`/api/jugadores`, torneos, ligas, superadmin, configuraciones).
- `POST /api/jugadores` solo permite editar **el propio perfil** (id de la sesión) salvo ADMIN. Campos sensibles (`role`, `category` forzada, etc.) solo modificables por ADMIN.
- Bootstrap del admin: variable de entorno server `ADMIN_EMAILS=marianodeux@gmail.com` verificada **en servidor tras autenticación por email** (no al registrarse sin verificar).
- Políticas RLS en Supabase para tablas expuestas (si se usa el cliente supabase-js); con `pg` directo desde server, basta con validar en API.
- Agregar validación de payloads (Zod) en todas las rutas.

---

## 3. 🔴 REGISTRO DE JUGADORES / MÓDULO JUGADORES — por qué sólo aparece ICEMAN

### 3.1 Cadena de fallos (todos encadenados)
1. La BD no conecta en Vercel (§1).
2. `GET /api/jugadores`, ante error, devuelve `{ success:false, players:[ICEMAN] }` con **HTTP 200**.
3. `PlayerDirectory.tsx` usa `data.players` **sin chequear `success`** → muestra solo ICEMAN.
4. `fetchRegisteredPlayersFromCloud` devuelve `[]` si `!success` y `LoginModal` cae a `[USER_ICEMAN]` hardcodeado → "Perfiles registrados (1)".
5. `saveCurrentPlayerProfile` (`storage.ts` ~L150–168) hace `fetch POST /api/jugadores` con un `.catch` de red **sin chequear `res.ok`** → el usuario se registra localmente (ej. "Prueba", 40.0 AVG INTERMEDIA visto en sidebar móvil) pero **nunca llega a la BD**, sin aviso.
6. El id local (`player-${Date.now()}`) **no se reconcilia** con el UUID devuelto por la BD → duplicados potenciales cuando la BD vuelva.
7. `queueForSync` existe pero **no se usa** para perfiles (no hay reintento).

### 3.2 Cambios sugeridos
- **API:** devolver códigos HTTP correctos (`503` si BD caída, `4xx` validación). Eliminar el fallback "solo ICEMAN" en producción (solo en `NODE_ENV=development` si se desea).
- **Cliente:** crear `fetchJson()` central que lance error si `!res.ok || !data.success`. Mostrar toast/estado de error visible ("No pudimos conectar con el servidor — reintentar") en directorio, login y registro.
- **Registro:** flujo *server-first*: crear en BD → recibir `id` real → recién entonces guardar sesión local. Si falla, **no** dar por completado el registro; ofrecer reintentar. Si se mantiene modo offline, usar `queueForSync` con reconciliación de ids.
- **Unicidad:** índices únicos `users.email` (lowercase) y `players.nickname` (lowercase); responder `409` con mensaje claro.
- **Un solo origen de verdad de jugadores:** crear hook/contexto `usePlayers()` (caché + revalidación, SWR o React Query) que consuma `/api/jugadores` y reemplace las listas estáticas (ver 3.3).
- Migración/diagnóstico: query SQL para listar usuarios existentes en BD y contrastar con los registrados (los tres usuarios que el admin dice haber visto registrarse probablemente solo existen en localStorage de cada dispositivo).

### 3.3 Fuentes estáticas que ignoran la nube (solo muestran ICEMAN)
| Archivo | Problema |
|---------|----------|
| `MatchGameSettings.tsx` | Selector de Jugador 2 usa `CANONICAL_PLAYERS` |
| `NationalRankings.tsx` | `MOCK_RANKINGS` |
| `PlayerEnrollModal.tsx` | `MOCK_RANKINGS` |
| `asociacion/page.tsx` | `MOCK_RANKINGS` en selector de autoridades de Comisión Directiva |
| `TournamentManager.tsx` (~L233) | `MOCK_RANKINGS` |
| `DartScorer.tsx` | lista estática |
| `PlayerDirectory.tsx` | estado inicial `getCurrentPlayerProfile(null)` y dedupe frágil por nickname/id |
| `players-data.ts` → `findCanonicalPlayer` | solo resuelve ICEMAN y hace fallback a `CANONICAL_PLAYERS[0]` → **abre la ficha equivocada** para otros jugadores |

**Cambio:** todos deben consumir `usePlayers()`; `findCanonicalPlayer` debe devolver `null` si no encuentra (nunca un jugador por defecto).

### 3.4 Bug: cambio de categoría desde Superadmin pisa datos
- `handleUpdatePlayerCategoryFromAdmin` (`superadmin/page.tsx`) envía el objeto **resumido** de `availablePlayers` (`name`, sin `fullName`, `phone`, `bio`…) a `POST /api/jugadores`. El endpoint usa defaults: `full_name = nickname`, `province='Buenos Aires'`, `nationality='Argentina'`, `dart_brand='TARGET 90%'`, `preferred_dart_weight_g=24`, `phone/bio=null` → **pérdida de datos**.
- **Fix:** endpoint dedicado `PATCH /api/jugadores/[id]/categoria` (`requireRole('ADMIN')`) que haga `UPDATE players SET category = $1 WHERE id = $2`. Además cambiar el `upsert` general a **actualización parcial** (`COALESCE($n, columna)`) para no sobreescribir con defaults.

---

## 4. 🟠 MODAL DE LOGIN / CIERRE DE SESIÓN

### 4.1 Estado actual
- `clearCurrentPlayerSession` (`storage.ts` ~L170) borra `CURRENT_PLAYER` y no conserva ningún "último jugador".
- `LoginModal.tsx`: lista perfiles de la nube (o `[USER_ICEMAN]` si vacío), buscador por email/apodo. El buscador muestra el error crudo del pooler (§1).
- `handleSelectPlayer` guarda el perfil devuelto **sin verificar identidad**.
- ICEMAN pide contraseña **en el cliente** (insegura, §2).

### 4.2 Cambios sugeridos
1. **Persistencia de dispositivo:** al iniciar sesión guardar `lpld_last_player` (id, apodo, avatar, categoría, avg, país) y `lpld_recent_accounts` (máx. 3–5). **`clearCurrentPlayerSession` NO debe borrarlos**; solo borra la sesión activa.
2. **UI del modal:**
   - Tarjeta destacada superior: **"Continuar como <último jugador>"** (avatar, apodo, categoría) con botón primario.
   - Debajo: "Otras cuentas usadas en este dispositivo" (recientes).
   - El listado completo de la nube pasa a un segundo plano (colapsable o solo vía buscador) — evita exponer todos los perfiles y la lista falsa de 1.
   - Botón "Olvidar este dispositivo" por cuenta.
3. **Buscador:** `GET /api/auth?q=` con `ILIKE` por apodo/email, devuelve **solo campos públicos** (id, apodo, avatar, categoría, país), **nunca email completo/teléfono**. Diferenciar estados: *cargando*, *sin resultados* ("No encontramos ese jugador — ¿Registrar ficha?"), *error de servicio* ("Servicio no disponible, reintentá en unos minutos") — **sin mostrar `err.message`**.
4. Verificación de identidad según la opción elegida en §2.3 (OTP por email o PIN) antes de abrir sesión. Para continuar como último jugador con sesión válida (cookie vigente) no pedir nada; si la sesión expiró, pedir PIN/OTP.
5. Quitar el fallback `USER_ICEMAN` hardcodeado.

---

## 5. 🟠 INSTALAR LA APP EN EL CELULAR (PWA)

### 5.1 Hallazgos
- `public/manifest.json` existe, pero:
  - Íconos 192 y 512 apuntan **al mismo** `/logos/logo-mdq.png` (no son tamaños reales; faltan íconos `maskable` y `apple-touch-icon`).
  - Descripción menciona **"Torneos Nakka" y "Tienda oficial"** (marca externa que se decidió erradicar).
  - `screenshots: []` (Chrome Android muestra el diálogo enriquecido solo con screenshots).
- `sw.js` v2 es válido (fetch handler, network-first en navegación). `providers.tsx` registra el SW.
- Botón "Instalar App" existe en `AppTopBar.tsx` (usa `beforeinstallprompt`) y `Navbar.tsx`, **pero** `AppTopBar` fue removido de `AppShell` (ADR‑013) y el botón era `hidden md:flex` → **en el celular no hay ningún acceso**.

### 5.2 Cambios sugeridos
1. Crear contexto/hook global `useInstallPrompt()` en `providers.tsx` que capture `beforeinstallprompt` **temprano** (guardar el evento, `preventDefault()`), exponga `canInstall`, `isInstalled`, `isIOS`, `promptInstall()`; escuchar `appinstalled`; detectar `display-mode: standalone` / `navigator.standalone`.
2. Componente `InstallAppButton` reutilizable, ubicado en:
   - **Sidebar móvil** (arriba de "Anotar partida" o en el pie, junto al perfil),
   - **Home** (CTA/banner dismissible con persistencia de "no volver a mostrar" X días),
   - **/perfil** y menú de configuración.
3. **iOS (Safari):** no existe `beforeinstallprompt`. Mostrar modal con instrucciones: *Compartir → Agregar a pantalla de inicio* (con ilustración). Detectar iOS Safari y mostrar el botón siempre (si no está en standalone).
4. **Android sin evento (Firefox/Samsung/ya descartado):** mostrar instrucciones "Menú ⋮ → Instalar aplicación".
5. **Manifest:** generar `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180); `id`, `start_url: "/?source=pwa"`, `scope`, `lang: "es-AR"`, `theme_color` y `background_color` coherentes (`#07090e`), `display: "standalone"`, `shortcuts` (Anotar partida, Torneos), `screenshots` (móvil y ancho). Limpiar descripción (sin Nakka/Tienda).
6. `layout.tsx`: `<link rel="apple-touch-icon">`, `<meta name="apple-mobile-web-app-capable">`, `viewport-fit=cover`.
7. Verificar con Lighthouse (PWA installable) y probar en Chrome Android + Safari iOS.

---

## 6. 🔴 MÓDULO DE TORNEOS Y LIGAS (`src/components/torneos/*`, `TournamentManager.tsx`)

> Objetivo: replicar la experiencia de **n01darts.com/n01/tournament** y **Challonge** (llaves Winners/Losers, rondas etiquetadas, Gran Final, "Resultados Finales" con podio 1º/2º/3º, vista pública, edición total por el organizador) **sin comprometer la estabilidad**.

### 6.1 Problemas actuales (con ubicación)

**Persistencia**
- 100 % `localStorage` (`getStoredTournaments/History/Leagues`, claves `lpld_tournaments_active_v2` etc.). Torneos, llaves, ligas y resultados **no se comparten entre dispositivos**: un jugador en su celular no ve el torneo del organizador.
- Las tablas `tournaments`, `tournament_registrations`, `tournament_bracket_matches` existen en `db-schema.sql`/Prisma pero **no se usan**. No hay tabla de ligas ni de grupos.

**Generación de llave**
- `generateDefaultBracket` / `generateDoubleEliminationBracket` (`TournamentManager.tsx` ~L80–160): llave **fija de 8**, con **ICEMAN hardcodeado como seed 1** y placeholders "Por Acreditar #2..#8". `registeredCount: 8` hardcodeado (~L648). `maxParticipants` no cambia el tamaño. Sin byes, seeding, ni tamaños 16/32/64. No se arma desde inscriptos reales.
- `handleEnrollPlayer` (~L573): agrega a estado local con `avg: 55.0` hardcodeado; **no asigna a la llave ni persiste**.
- Formatos `ROUND_ROBIN` / `HYBRID` no generan `matches`; `TournamentGroupStage` usa datos propios desconectados.
- Torneos creados con `startDate: new Date()` (sin selector de fecha) y `bannerImageUrl` fijo.

**Bugs de avance de llave — `handleUpdateMatchScore` (~L306–355)**
1. Solo avanza `if (match.round < 3)` y busca `nextRound` / `floor(matchIndex/2)` **sin filtrar `bracketType`** → en doble eliminación el ganador de un partido LOSERS (l1/l2) puede **pisar `player1/2` de la semi WINNERS (w5/w6)** (`find` devuelve el primero del array).
2. **Los perdedores de Winners nunca caen al cuadro Losers.**
3. w7 (final winners) y l5 (final losers) **no avanzan a la Gran Final `gf1`** (round 4).
4. En single elimination **no se registra campeón/podio ni se completa el torneo**; las `stats` son manuales (`handleArchiveTournamentToHistory`).
5. Se **muta** objetos dentro del `updater` de `setTournaments` (impureza; doble ejecución en StrictMode) y se llama `saveStoredTournaments` dentro del updater.
6. Modificar un resultado ya jugado **no invalida los partidos posteriores** (sin cascada ni validación de consistencia). `handleAdminResetMatch` solo limpia la siguiente ronda (no losers ni todo el downstream).

**Otras inconsistencias**
- `handleAdminAdvanceWalkover` usa `Math.ceil(bestOfLegs/2)` en vez de `match.legTarget`/`setTarget` (ignora la config por ronda).
- `handleLaunchBracketLive` fija `distanceType:'LEGS'`, `bestOfSets:1`, `bestOfLegs: tournament.bestOfLegs` (ignora `legTarget` / `distanceMode SETS` por partido).
- `handleTournamentMatchFinished` solo procesa `type==='BRACKET'` (no GROUP), fallback de score 1‑0, `scoreSetsP1/2` nunca se actualiza.
- `League`: standings guardados en el objeto (no calculados desde resultados); `LeagueManager` no se alimenta de torneos terminados; sin tabla en BD.
- `TournamentManager.tsx` monolítico (~135 KB / 2420 líneas): difícil de mantener y propenso a regresiones.

**Panel admin — `AdminMatchModal.tsx` (261 líneas)**
- Solo edita legs de ambos, ganador, nota, W.O. y reset a 0‑0. Badge fijo "ICEMAN FULL".
- Sin validación (marcador vs `legTarget`, ganador coherente con score, `max=30`).
- Sin: edición de sets, horario (`scheduledTime`), mesa, reemplazo/intercambio de jugadores del slot, distancia del partido, descalificación/retiro, **deshacer/audit log**, recálculo seguro de rondas posteriores.
- `isAdmin` solo cliente (§2).

### 6.2 Arquitectura objetivo

#### 6.2.1 Motor puro `src/lib/bracket-engine.ts` (núcleo de estabilidad)
Funciones **puras e inmutables** (entrada → nueva salida, sin tocar React ni storage), 100 % testeables:

```ts
generateSingleElimination(participants, { seeding: 'RANKED'|'RANDOM'|'MANUAL', thirdPlace?: boolean }): Bracket
generateDoubleElimination(participants, { seeding, grandFinalReset?: boolean }): Bracket
generateRoundRobin(participants, { doubleRound?: boolean }): Match[]
generateGroupsPlusBracket(participants, { groups, advancePerGroup }): { groups, bracket }

reportResult(bracket, matchId, result): { bracket, affectedMatchIds, warnings }
editResult(bracket, matchId, newResult, { cascade: 'BLOCK'|'INVALIDATE_DOWNSTREAM' })
replaceParticipant(bracket, matchId, slot, newParticipant)
swapParticipants(bracket, matchA/slot, matchB/slot)
setWalkover(bracket, matchId, winnerSlot) / disqualify(bracket, participantId)
resetMatch(bracket, matchId, { cascade: true })
previewImpact(bracket, operation): MatchId[]     // para confirmación en UI
computePodium(bracket): { first, second, third, fourth? }
computeStandings(matches): StandingRow[]         // ligas y grupos
validateBracket(bracket): ValidationError[]      // integridad
rebuildFromResults(bracket): Bracket             // reproduce todo desde resultados
```

- Tamaños 4/8/16/32/64, potencias de 2 con **byes** automáticos (los seeds altos saltan primera ronda).
- Cada match con **tabla de ruteo explícita**: `nextMatchId`, `nextSlot (1|2)`, `loserNextMatchId`, `loserNextSlot`, `bracket ('W'|'L'|'GF')`, `round`, `position`. **Se elimina la lógica `floor(matchIndex/2)` + `find` por round**; el avance se resuelve siguiendo punteros.
- Etiquetas tipo Challonge: "Ronda 1/2/3", "Semifinales", "Finales", "Perdedores de la ronda N", "Gran Final".
- **Tests (Vitest)** obligatorios: SE y DE de 4/8/16 (+ no potencia de 2 con byes), W.O., edición retroactiva con cascada, caída de perdedores a L, gran final (con y sin reset), podio, standings con desempates (puntos, diferencia de legs, enfrentamiento directo), idempotencia (`rebuildFromResults` == estado incremental).

#### 6.2.2 Modelo de datos (Supabase)
```sql
tournaments(id uuid pk, slug text unique, name, game_mode, format ('SE'|'DE'|'RR'|'GROUPS_BRACKET'),
  status ('DRAFT'|'REGISTRATION'|'LIVE'|'FINISHED'|'CANCELLED'),
  start_at timestamptz, venue, prize_pool, max_participants, distance_config jsonb,
  banner_url, created_by uuid, version int default 1, created_at, updated_at);

tournament_participants(id uuid pk, tournament_id fk, player_id fk null, display_name, seed int,
  status ('REGISTERED'|'CHECKED_IN'|'DISQUALIFIED'|'WITHDRAWN'), UNIQUE(tournament_id, player_id));

tournament_matches(id uuid pk, tournament_id fk, bracket ('W'|'L'|'GF'|'GROUP'), round int, position int,
  p1_id fk null, p2_id fk null, score_p1 int, score_p2 int, sets_p1 int, sets_p2 int,
  winner_id fk null, status ('PENDING'|'READY'|'LIVE'|'DONE'|'WALKOVER'|'VOID'),
  next_match_id uuid, next_slot smallint, loser_next_match_id uuid, loser_next_slot smallint,
  leg_target int, set_target int, distance_mode, scheduled_at timestamptz, table_no int, note text,
  version int default 1, updated_at);

tournament_audit_log(id bigserial pk, tournament_id fk, match_id fk null, actor_id fk, action text,
  before jsonb, after jsonb, created_at);       -- para "Deshacer" y trazabilidad

leagues(id, name, season, status, config jsonb);
league_rounds / league_fixtures(…)              -- standings calculados con computeStandings()
```
- Índices por `tournament_id`, `(tournament_id, round)`, `slug`.
- `version`/`updated_at` para **control de concurrencia optimista** (rechazar escritura con `409` si el cliente tiene versión vieja).

#### 6.2.3 API (con `requireRole` server-side)
- `GET /api/torneos` · `GET /api/torneos/[slug]` (público, solo lectura; incluye participantes y matches).
- `POST /api/torneos` (ADMIN/ORGANIZER) · `PATCH /api/torneos/[id]`.
- `POST /api/torneos/[id]/participantes` (inscripción: el propio jugador o admin) · `DELETE` · `PATCH` (seed, estado).
- `POST /api/torneos/[id]/generar-llave` (solo si `DRAFT/REGISTRATION`; bloquea inscripciones).
- `PATCH /api/torneos/[id]/matches/[matchId]` (reportar/editar resultado, horario, mesa, jugadores, W.O.) → ejecuta el **motor puro** en el servidor dentro de una **transacción**, valida versión, escribe cambios + `audit_log`.
- `POST /api/torneos/[id]/undo` (revierte última entrada del audit log).
- `POST /api/torneos/[id]/cerrar` (calcula podio, pasa a `FINISHED`, actualiza ranking/stats de jugadores).
- Todas las escrituras validan con Zod y rol; el cliente **nunca** calcula el avance como fuente de verdad (puede previsualizar con el mismo motor).

#### 6.2.4 Tiempo real / vista pública
- Ruta pública `/torneos/[slug]` solo lectura (compartible por WhatsApp, estilo Challonge) con llave Winners/Losers, scroll horizontal, zoom, resaltado del jugador al tocar, y bloque **"Resultados Finales"** (podio 1º/2º/3º con medallas) como en la captura de Challonge.
- Actualización por **polling** (5–10 s) con ETag/`updated_at`; luego opcional Supabase Realtime.
- Vista "En vivo" estilo n01: lista de partidos en curso, próximos, mesas.

### 6.3 Panel de Administración total (sin romper la estabilidad)

Requisitos del usuario: el admin debe poder **editar todas las instancias de la llave y resultados**. Implementación segura:

| Acción admin | Reglas de seguridad |
|--------------|---------------------|
| Editar resultado (legs/sets) | Validar contra `legTarget`/`setTarget`; ganador derivado del score (con override explícito + nota); si ya hay partidos posteriores jugados → mostrar **previsualización de impacto** y pedir confirmación; opción "cascada" (invalida downstream) |
| Cambiar ganador manual / W.O. / DQ / retiro | Aplica a todo el recorrido del participante; propaga W.O. automáticos |
| Reemplazar jugador de un slot / intercambiar slots | Solo si el partido no está `DONE` o con cascada confirmada |
| Cambiar horario, mesa, distancia por ronda | Editable siempre; audit log |
| Reset de partido (en cascada) | Previsualización de partidos afectados, confirmación explícita |
| Regenerar llave | Solo antes de `LIVE`, o con doble confirmación + backup (audit log) |
| Bloquear/desbloquear ronda | Evita ediciones accidentales de rondas cerradas |
| Deshacer última acción | Basado en `tournament_audit_log` |
| Agregar/quitar inscriptos | Antes de generar llave; después solo por reemplazo/DQ |
| Cerrar torneo | Calcula podio, congela, actualiza rankings |
| Modo "edición avanzada" | Detrás de un interruptor + confirmación; siempre pasa por el motor + `validateBracket()`; si la validación falla, la operación se **rechaza** (nunca persiste una llave inconsistente) |

Refactor UI: dividir `TournamentManager.tsx` en `CreateTournamentModal`, `EnrollmentPanel`, `BracketView` (read-only reutilizable pública/privada), `AdminPanel`, `MatchEditorDrawer` (reemplaza `AdminMatchModal`), `GroupStageView`, `LeagueManager`, `PodiumCard`. Hooks: `useTournament(slug)`, `useTournamentMutations()`.

### 6.4 Compatibilidad con el anotador
- Al lanzar un partido en vivo, construir `MatchConfig` desde el match (`legTarget`, `setTarget`, `distanceMode`, jugadores reales) en vez de valores fijos.
- Al terminar el partido, `handleTournamentMatchFinished` debe llamar a `reportResult` (BRACKET **y** GROUP), con sets y legs reales (sin fallback 1‑0).

### 6.5 Ligas
- Tabla/fixture persistido; `computeStandings()` desde resultados (no guardar standings fijos).
- Puntos configurables (3/1/0 o por legs), desempates definidos; alimentación automática desde torneos finalizados o fechas de liga.
- Ranking nacional alimentado por resultados oficiales cerrados.

---

## 7. 🟠 SUPERADMIN (`src/app/superadmin/page.tsx`) Y DATOS ESTÁTICOS

- `community-analytics.ts` (`COMMUNITY_DEMOGRAPHICS`, `INFRASTRUCTURE_METRICS`, `MODULE_TRAFFIC_RANKING`) son **datos estáticos inventados**. → Calcular con SQL:
  - jugadores por país/provincia/localidad: `SELECT country, province, city, COUNT(*) ... GROUP BY ROLLUP(...)`,
  - edad promedio: `AVG(EXTRACT(YEAR FROM age(birth_date)))`,
  - uso de cuota/servidores: leer métricas reales (tamaño de BD con `pg_database_size`, conexiones activas, requests a APIs si se registran en una tabla `usage_events`; link a dashboards de Vercel/Supabase para lo que no sea accesible por API).
- **Vitrinas de la landing** (próximo gran torneo, comunidad, sedes/clubes, datos de pago de inscripciones), **autoridades de Comisión Directiva** y **cuenta bancaria**: guardadas en **localStorage por dispositivo** → lo que configura el admin **no lo ve nadie más**. → Persistir en BD:
  - `site_settings(key text pk, value jsonb, updated_by, updated_at)`,
  - `association_authorities(role, player_id fk, since)`,
  - `landing_showcases(slug, title, items jsonb, image_url, order)`.
  - Lectura pública cacheada (`revalidate`), escritura solo ADMIN. Imágenes en Supabase Storage con tamaños/relación recomendados por vitrina.
- La sincronización con **Google Forms** es simulada con `Math.random()` (`handleSyncGoogleForms`). → Reemplazar por lectura real (Google Sheets API vinculada al formulario, o webhook de Apps Script a un endpoint propio con token secreto) y mapear a `tournament_participants`.
- `availablePlayers` depende de `cloudPlayers`: tras corregir §1 y §3 se completará; mientras tanto el padrón solo muestra ICEMAN.
- Los cargos de la Comisión Directiva deben impactar en el perfil del jugador (campo `players.association_role`), alimentado desde `association_authorities`.

---

## 8. 🟡 DEUDA TÉCNICA Y VARIOS

- `types.ts`: `PlayerCategory` incluye `'ELITE'` pero UI/BD usan "Elite Pro". Unificar. Verificar `calculateCategory` (`constants.ts` ~L32) y `CATEGORY_DETAILS`: rangos acordados `< 40`, `40–54.9`, `55–69.9`, `70+`.
- `DEFAULT_NEW_PLAYER` / `MOCK_CURRENT_USER` ("jugador invitado") pueden quedar como sesión por defecto; mostrar estado "no logueado" explícito.
- Raíz del repo: `audios_russ_bray/`, `descargar.js(.txt)` → mover o eliminar. `ARQUITECTURA.md` versionado: revisar si contiene datos sensibles.
- Sin tests automatizados: agregar Vitest (motor de llaves, `calculateCategory`, validaciones de API).
- Mezcla de finales de línea CRLF/LF: agregar `.gitattributes` (`* text=auto eol=lf`) y `.editorconfig`.
- Manejo de errores no unificado: crear `lib/api-client.ts` (fetch tipado + errores) y `lib/api-response.ts` (respuestas estándar server).
- `package.json`/lockfile con cambios sin confirmar: revisar `git status` antes de continuar.
- **Git:** el commit `4bf34d3` está en `dev` local; el `git push origin dev` no se confirmó (se colgó). Verificar con `git status -sb` y `git log origin/dev -1`.
- Revisar archivos no auditados en profundidad: `TournamentBracket.tsx` (22 KB), `TournamentGroupStage.tsx`, `LeagueManager.tsx`, `PlayerEnrollModal.tsx`, `AppSidebar.tsx` (`handleLogout` ~L55), `layout.tsx`, `asociacion/page.tsx`.

---

## 9. PLAN DE IMPLEMENTACIÓN POR FASES (orden recomendado)

### Fase 0 — Hotfix (hacer primero, 1 sesión)
1. Rotar contraseña BD; actualizar Vercel (`DATABASE_URL` pooler 6543, copiada desde Supabase → Connect).
2. Limpiar `db.ts` (sin fallback/credenciales/hack), redactar secretos en `CONFIGURACION_SUPABASE.md` y ADRs.
3. Respuestas de API con códigos HTTP correctos y mensajes genéricos; el cliente chequea `res.ok`/`success` y muestra errores.
4. Endpoint `/api/health/db` (admin).
**Aceptación:** el buscador del login encuentra "Zeus" (si existe); un registro nuevo aparece en `/jugadores` desde otro dispositivo; si la BD cae, se ve un error claro (no solo ICEMAN).

### Fase 1 — Identidad y jugadores
1. Implementar auth (Supabase Auth OTP **o** PIN+sesión) y `requireSession/requireRole`.
2. Endurecer `/api/jugadores` (propio perfil / admin), `PATCH categoría`, actualización parcial, índices únicos.
3. Hook `usePlayers()`; reemplazar todas las listas estáticas (§3.3); `findCanonicalPlayer` sin fallback.
4. Registro server-first con reconciliación de ids.
**Aceptación:** nadie puede editar el perfil de otro ni autoasignarse ADMIN; cambiar categoría no altera otros campos; todos los selectores listan jugadores reales.

### Fase 2 — Login modal + PWA
1. `lpld_last_player` / `lpld_recent_accounts`; nuevo diseño del modal (§4).
2. `useInstallPrompt` + `InstallAppButton` (sidebar móvil, home, perfil) + guía iOS + íconos y manifest corregidos (§5).
**Aceptación:** al cerrar sesión el modal muestra "Continuar como <último jugador>"; en Android aparece el botón y dispara el prompt; en iOS aparece la guía; Lighthouse PWA instalable.

### Fase 3 — Motor de torneos + persistencia
1. `bracket-engine.ts` + Vitest (SE, DE, byes, W.O., cascada, podio).
2. Migraciones SQL (§6.2.2) y rutas API (§6.2.3) con transacciones, versión y audit log.
3. Migrar `TournamentManager` a consumir API (manteniendo importación de datos locales existentes si los hay).
4. Vista pública `/torneos/[slug]` + polling.
**Aceptación:** llaves 4–64 con byes; losers y gran final correctos; campeón/podio automático; todos los dispositivos ven el mismo torneo; `validateBracket` pasa tras cada operación.

### Fase 4 — Admin total, ligas, superadmin real
1. `MatchEditorDrawer` + acciones admin de §6.3 (impacto previo, cascada, deshacer).
2. Ligas persistidas con `computeStandings`.
3. Superadmin con métricas SQL reales, vitrinas/autoridades/pago en BD, Google Forms real.
**Aceptación:** el admin edita cualquier resultado/slot/horario con previsualización y deshacer; ninguna operación deja la llave inconsistente; configuración visible en todos los dispositivos.

---

## 10. CHECKLIST DE VERIFICACIÓN FINAL

- [ ] `npx tsc --noEmit` y `npm run build` sin errores; `npm test` (Vitest) en verde.
- [ ] Sin secretos en el repo (`git grep` de contraseñas/URLs de conexión) y variables solo en Vercel.
- [ ] Registro desde un celular → aparece en `/jugadores` en otro dispositivo en < 10 s.
- [ ] Logout → modal muestra último jugador; buscador funciona o muestra error amigable.
- [ ] Botón instalar visible en móvil (Android/iOS).
- [ ] Torneo de 8 y 16 en DE: perdedores caen a Losers, Gran Final correcta, podio automático.
- [ ] Editar resultado antiguo con partidos posteriores: previsualiza impacto y no corrompe la llave.
- [ ] Un usuario sin rol ADMIN recibe `403` en cualquier endpoint de escritura administrativa.
- [ ] Documentación `Agent/` (INDEX, TODO, DECISIONS, SESSIONS) actualizada tras cada fase.
- [ ] Ningún push a `main`: entregar comandos al usuario.
