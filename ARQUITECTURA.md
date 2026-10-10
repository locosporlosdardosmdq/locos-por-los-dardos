# 🎯 Locos por los Dardos • Plataforma Integral PWA Argentina
### Desarrollada en conjunto con **Darderos Mar del Plata**

Plataforma deportiva y comunitaria de dardos construida como una **Progressive Web App (PWA)** de alto rendimiento, optimizada para dispositivos móviles (mobile-first) y escritorio, con soporte offline, referee de voz, gestión de torneos estilo Nakka n01 y tienda integrada con Mercado Pago.

---

## 🏛️ Identidad de Marca y Preponderancia
Tal como fue requerido en los lineamientos de diseño:
* **Darderos Mar del Plata (`/logos/logo-mdq.png`):** Posee **+25% de preponderancia visual** en dimensiones, jerarquía y destacados respecto a la marca nacional.
* **Locos por los Dardos Argentina (`/logos/dardos-argentina.png`):** Identidad complementaria de la comunidad federal.
* **Componente `BrandLogo`:** Gestiona dinámicamente esta proporción en variantes `sm`, `md`, `lg` y `hero`.

---

## 📱 Módulos Desarrollados

### 1. Módulo de Registro y Perfil de Jugador
* **Ubicación Federal:** Selector dinámico con las 24 provincias de Argentina y ciudades (Mar del Plata, CABA, Rosario, Córdoba, Mendoza, etc.).
* **Estimación de AVG y Categorización Automática:**
  * El jugador introduce o desliza su promedio esperado en 501.
  * El sistema calcula y asigna automáticamente en tiempo real su categoría oficial:
    * **Principiante:** `< 40.0 AVG`
    * **Intermedia:** `40.0 - 54.9 AVG`
    * **Avanzada:** `55.0 - 69.9 AVG`
    * **Elite Pro:** `≥ 70.0 AVG`
* **Dashboard Estadístico:** Visualización de métricas avanzadas: First 9 AVG, porcentaje de dobles, mayor cierre (highest checkout), conteo de 180s y 140s, historial de evolución por fecha y partidos ganados/perdidos.

### 2. Módulo de Anotador en Vivo (Estilo "My Dart Training")
* **Teclado Táctil de Doble Modo:**
  * **Modo Puntuación Total:** Display digital gigante para visualización desde la línea de tiro (oche), teclado numérico 0-9, accesos rápidos (26, 41, 45, 60, 81, 85, 100, 140, 180) y botones `CLR` (Borrar) y `OK` (Confirmar).
  * **Modo Dardo x Dardo (3 Dardos):** Registro tiro a tiro con multiplicadores (Simple, Doble, Triple), números del 1 al 20, Diana (Bullseye 25/50) y Fuera (Miss 0).
* **Modos de Juego:**
  * **X01:** 170, 301, 501, 701 con opciones de *Single Out, Double Out* y *Master Out*.
  * **Cricket:** Tablero digital para targets 15, 16, 17, 18, 19, 20 y Bull con marcas tradicionales (`/`, `✕`, `⨂`) y cálculo automático de puntos por desborde.
  * **Práctica vs CPU / Bot AI:** 4 niveles calibrados (*Principiante ~40 AVG, Intermedio ~55 AVG, Avanzado ~70 AVG, Pro ~85+ AVG*).
* **Guía Interactiva de Cierre (Checkout Routes):** Cálculo de rutas recomendadas en territorio de cierre (≤ 170) con detección de puntuaciones *bogey* (169, 168, etc.).
* **Referee / Caller de Voz & Audio FX:**
  * Síntesis de voz con Web Speech API para cantar puntuaciones, llamado icónico de *"ONE HUNDRED AND EIGHTY!"*, *"Game shot!"*, *"Requiere 40"* y aviso de *"Bust!"*.
  * Sintetizador de audio Web Audio API (impacto en sisal, buzzer de bust, campana de bullseye y fanfarria).
  * Celebración con confeti animado (`canvas-confetti`) y clip especial de victoria.

### 3. Módulo de Gestión de Torneos (Estilo "Nakka n01")
* **Formatos y Estructuras:**
  * Presenciales y Online.
  * Eliminación Directa (*Single Elimination*), Doble Eliminación (*Double Elimination*), Fase de Grupos (*Round Robin*) e Híbrido.
  * Configuración de distancia a las piernas (*Best of Legs*).
* **Gestión en Tiempo Real:**
  * Cuadro visual interactivo (Brackets) de Cuartos, Semifinales y Gran Final con actualización de piernas ganadas y avance automático de ganadores.
  * Tablas de posiciones de fase de grupos con PJ, PG, PP, Legs +, Legs -, Diferencia y Puntos.
  * Formulario para crear y publicar nuevos torneos con arancel en ARS y premios.

### 4. Landing Page e Información de la Comunidad
* **Head / Banner Promocional (Hero Section):** Promoción destacada de los próximos torneos oficiales (ej: *Gran Open Mar del Plata 2026 • Copa Costa Atlántica*) con bolsa de premios de $450.000 ARS y botón de inscripción rápida.
* **Sección Informativa:** Fomenta la unión de los jugadores de dardos en todo el país.
* **Ranking Nacional Público:** Leaderboard con filtros combinados por categoría y provincia, podio para el Top 3 con medallas de Oro, Plata y Bronce.
* **Sedes Oficiales:** Destacando el Club Darderos Mar del Plata (Sede Central) y clubes afiliados en CABA, Rosario, Córdoba y Mendoza.

### 5. E-commerce y Tienda Integrada (Mercado Pago)
* **Catálogo Especializado:** Dardos de tungsteno al 90% (Target Luke Littler, Red Dragon Snakebite), dianas oficiales de sisal (Winmau Blade 6), plumas K-Flex, cañas Supergrip Carbon y estuches rígidos EVA Takoma.
* **Pasarela de Pagos Mercado Pago (ARS):**
  * Endpoint `/api/checkout/mercadopago` para generación de preferencias en Checkout Pro con cálculo de cuotas y medios de pago en Argentina.
  * Endpoint `/api/webhook/mercadopago` para recepción de notificaciones IPN.
* **Carrito Desplegable (`CartDrawer`):** Carrito lateral con ajuste de cantidades, cálculo de envío gratis para compras superiores a $100.000 ARS y recolección de datos de entrega en cualquier provincia argentina.

---

## 🗄️ Arquitectura de Base de Datos y Backend

El proyecto incluye dos definiciones completas para la capa de datos:
1. `src/lib/db-schema.sql`: Script DDL en PostgreSQL / Supabase con enums, índices optimizados y funciones almacenadas (`calculate_player_category`).
2. `prisma/schema.prisma`: Esquema de Prisma ORM para sincronización tipada.

### Tablas Principales:
* `users` & `profiles`: Autenticación, datos personales, provincia, ciudad, AVG estimado y categoría.
* `player_stats`: Historial de promedios, dobles, checkouts y visitas de 180.
* `matches`, `match_legs` & `dart_visits`: Anotación tiro por tiro para torneos y partidas amistosas.
* `tournaments`, `tournament_registrations` & `tournament_bracket_matches`: Brackets estilo Nakka n01 en tiempo real.
* `products`, `orders` & `order_items`: Gestión de inventario y pedidos con Mercado Pago.

---

## 🚀 PWA y Service Worker
* `public/manifest.json`: Configuración de Progressive Web App con colores corporativos (#090d16 / #10b981) e instalación en pantalla de inicio para Android e iOS.
* `public/sw.js`: Service worker con estrategia de caché *stale-while-revalidate* para garantizar funcionamiento offline del anotador en bares y clubes sin cobertura.

---

## 💻 Instrucciones para Ejecutar Localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Iniciar bundle de producción
npm start
```

La aplicación quedará disponible en `http://localhost:3000`.
