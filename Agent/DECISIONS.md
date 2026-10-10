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
  * **Colapso en PC (Desktop):** Se integraron botones de colapso/expansión claros (`PanelLeftClose` y `PanelLeftOpen`) tanto en la cabecera superior del Sidebar como en la barra superior (`AppTopBar`), permitiendo alternar entre 256px y 72px con un solo clic.
  * **Navegación Móvil (Celulares/Tablets):** Se implementó `AppBottomNav.tsx` fija en el pie de pantalla con 5 accesos táctiles, destacando el botón central de Anotador en verde neón elevado (`w-13 h-13`) para tiro rápido, y un drawer lateral fluido para opciones adicionales sin robar espacio horizontal durante el juego.
- **Motivo:** Máxima ergonomía en el mundo real (pantallas móviles en torneos presenciales) y control total del espacio de visualización en monitores de PC.
