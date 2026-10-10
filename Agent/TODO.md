# Tareas del Proyecto (TODO) • Locos por los Dardos

## 🏆 Tareas Completadas
- [x] Configuración inicial del proyecto con Next.js 15, TypeScript y Tailwind CSS.
- [x] Implementación de PWA con Web App Manifest (`manifest.json`) y Service Worker (`sw.js`).
- [x] Identidad de marca unificada con +25% de preponderancia para Darderos Mar del Plata (`BrandLogo.tsx`).
- [x] Módulo 1: Formulario de Registro y Perfil con estimación de AVG y categorización automática (Principiante, Intermedia, Avanzada, Elite) en tiempo real.
- [x] Módulo 2: Anotador en Vivo táctil (My Dart Training) con X01, Cricket, Bot AI, Checkout Guide interactiva y Referee de voz.
- [x] Módulo 3: Gestor de Torneos (Nakka n01) con llaves eliminatorias en vivo y fase de grupos (Round Robin).
- [x] Módulo 4: Landing Page comunitaria con Head Banner promocional superior (Hero Torneos) y Leaderboard público.
- [x] Módulo 5: E-commerce integrado con catálogo, carrito lateral (`CartDrawer`) y API de Mercado Pago en ARS.
- [x] Definición completa del esquema relacional en PostgreSQL / Supabase (`db-schema.sql`) y Prisma (`schema.prisma`).
- [x] Rediseño integral de la paleta de colores basado 100% en la Diana de Dardos (Samurai 4) con fondo gris oscuro (`#14161f`).
- [x] Persistencia offline-first de partidas y cola de sincronización en `src/lib/storage.ts`.
- [x] Transmisión broadcast en tiempo real entre el Oche y pantallas de torneos (`src/lib/broadcast.ts` y pestaña "Tablero en Vivo" en `/torneos`).
- [x] Paleta deportiva de alto contraste con fondo negro profundo (`#07090e`), tarjetas `#0f1422` y acentos neón (#00e676, #ef4444, #0284c7) idénticos a la primera captura de referencia.
- [x] Menú lateral colapsable responsive (`AppSidebar.tsx` + `AppTopBar.tsx` + `AppShell.tsx`) con memoria de estado en `localStorage` y jerarquía oficial de 6 módulos.
- [x] Módulo Directorio Federal de Jugadores (`/jugadores` y `PlayerDirectory.tsx`) con filtros por provincia, categoría de AVG y reto directo.
- [x] Verificación de compilación limpia de producción (`npm run build`) con 0 errores de tipos y lint.

---

## ⚡ En Progreso / Siguientes Pasos Inmediatos
- [ ] **Módulo de Torneos Avanzado (Comportamiento Nakka n01):**
  * Sorteo automático de llaves y grupos estilo N01 (Single Elimination, Double Elimination, Round Robin).
  * Panel de control de árbitro de mesa y asignación de pistas de juego (Oche 1, Oche 2, Oche 3...).
  * Integración en caliente del marcador en vivo de pista con la planilla del torneo.
  * Generación y exportación de cuadros a PDF / PNG.

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
