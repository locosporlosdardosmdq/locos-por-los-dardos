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
