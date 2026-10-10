# Encargos del Arquitecto (Opus) al Ejecutor (Gemini)

## 2026-07-27 — Refactor API Terminales y Promociones — Estado: hecho

**Encargo dado a Gemini:**

Refactorizar las rutas API de Terminales de Pago y Promociones Bancarias para que validen el `tenantId` desde el servidor en lugar de recibirlo del body del cliente, al igual que hicimos con Recuento.

**Contexto:** Los módulos de Terminales y Promociones (en Configuración > POS y Ventas) "no hacen nada" al intentar guardar. El motivo de fondo es que la migración SQL `014_pos_y_config.sql` aún no fue ejecutada en producción (las tablas no existen y devuelven 500). Sin embargo, aprovecharemos para mejorar la seguridad y la UX de estos módulos.

**Implementación requerida:**

A) **En las API routes** (`src/app/api/configuracion/terminales/route.ts` y `src/app/api/configuracion/promociones/route.ts`):
   - Refactorizar para usar `getTenantId()` del lado del servidor (importado de una función local o usando `adminClient` y `supabase.auth.getUser()`).
   - No recibir más el `tenantId` desde el body o la query del cliente (POST, PUT, DELETE, GET). 
   - Mantener la respuesta `[]` silenciosa si la tabla no existe (`error.code === '42P01'`) en el GET. En POST/PUT, devolver 500 si falla.

B) **En los componentes** (`src/components/configuracion/TerminalesPagoSection.tsx` y `src/components/configuracion/PromocionesBancariasSection.tsx`):
   - Eliminar el uso de la prop `tenantId` en las llamadas a `fetch`.
   - Agregar manejo de errores: si `!res.ok`, mostrar un `alert` (o toast) con el mensaje de error para que no falle silenciosamente.

**Qué SÍ tocar:**
- `src/app/api/configuracion/terminales/route.ts`
- `src/app/api/configuracion/promociones/route.ts`
- `src/components/configuracion/TerminalesPagoSection.tsx`
- `src/components/configuracion/PromocionesBancariasSection.tsx`

**Qué NO tocar:**
Agregar filtros a la página de movimientos de inventario (`src/app/dashboard/inventario/movimientos/page.tsx`) y su API route (`src/app/api/inventario/movimientos/route.ts`).

**Resultado:** Hecho. Se agregaron los filtros a la API y a la página. Se corrigió el bug de `sku` a `codigo`. Se sumó el dropdown de proveedores.

## 2026-07-27 — Preferencias Globales del Tenant — Estado: hecho

**Encargo dado a Gemini:**
Implementar la tabla `tenant_preferencias`, la API y la UI en Configuración para 'Preferencias de Ventas' y 'Parámetros de Stock'.

**Qué tocar:**
- Migración SQL (`023_preferencias_tenant.sql`)
- API `src/app/api/configuracion/preferencias/route.ts`
- UI en `src/components/configuracion/` (nuevos componentes de Preferencias)
- UI en `src/app/dashboard/configuracion/page.tsx`

**Resultado:** Hecho. Se creó la tabla `tenant_preferencias` con sus endpoints GET/PUT y componentes UI en la página de Configuración. Migración ya ejecutada en producción por el usuario.

## 2026-07-29 — FIX CRÍTICO: Dropdown Proveedores en Compras + Ventas POS vacío — Estado: hecho

**Encargo dado a Gemini:**

Corregir dos bugs críticos en producción. Ambos impiden usar los módulos de Compras y Ventas.

### Contexto previo obligatorio

Lee `Agent/DECISIONS.md`, entrada del 2026-07-28 sobre `adminClient` a nivel módulo vs `getAdminClient()`. Esa es una decisión clave: **siempre** usar `function getAdminClient()` dentro del handler, nunca `const adminClient = ...` a nivel módulo.

### Problema 0: Ramas desincronizadas

**ANTES de tocar cualquier código**, hay que sincronizar `dev` con `main`. La rama `main` tiene fixes que `dev` perdió por un merge mal resuelto. El archivo `src/app/api/proveedores/route.ts` en `dev` todavía tiene `const adminClient = ...` a nivel módulo, mientras que `main` ya tiene `getAdminClient()`. Corré estos comandos:

```bash
git checkout dev
git merge main
# Si hay conflictos: resolver manteniendo siempre getAdminClient() (nunca const adminClient)
git push origin dev
```

### BUG 1: Proveedores no aparecen en el dropdown de Nueva Compra

**Síntoma:** El usuario cargó un proveedor "Javi" (visible en `/dashboard/proveedores`). Pero al ir a `/dashboard/compras/nuevo`, el dropdown "Seleccione un proveedor..." muestra vacío (solo la opción placeholder).

**Causa raíz:** La página `src/app/dashboard/compras/nuevo/page.tsx` (líneas 42-70) es un componente `'use client'` que hace queries directas usando `createClient()` (el Supabase browser client). El browser client pasa por RLS y las policies usan `get_tenant_id_for_user(auth.uid())`. Esto **debería funcionar** si la función está configurada correctamente. Sin embargo, es posible que haya un fallo silencioso (la query devuelve `[]` sin error) posiblemente por un desync del token o porque alguna policy tiene conflicto.

**Solución requerida:** Convertir la carga de proveedores y productos a una API route server-side, igual que hacen el resto de los módulos. Esto es más robusto y consistente:

A) Modificar `src/app/dashboard/compras/nuevo/page.tsx`:
   - En el `useEffect` de carga (líneas 42-70), reemplazar las queries directas a Supabase por llamadas a `fetch('/api/proveedores')` y `fetch('/api/inventario/productos')`.
   - Para proveedores: `const res = await fetch('/api/proveedores'); const json = await res.json(); setProveedores(json.data || [])`.
   - Para productos: `const res = await fetch('/api/inventario/productos'); const json = await res.json(); setProductos(json.data || [])`.
   - Eliminar la dependencia de `createClient` y de `tenantId` en el frontend para la carga de datos. El `tenantId` se sigue necesitando para el POST de la compra, así que mantené el `setTenantId` pero obteniéndolo del response o dejando que la API de compras lo derive server-side.
   - **IMPORTANTE:** La API `/api/proveedores` ya devuelve TODOS los proveedores (activos e inactivos). Para filtrar solo activos, el frontend debe filtrar `json.data.filter(p => p.activo !== false)`.

B) Verificar que la API `/api/inventario/productos/route.ts` (GET) existe y funciona correctamente para devolver la lista de productos del tenant. Verificar que usa `getAdminClient()` (no `const adminClient`). Si no existe un GET que devuelva la lista, crearlo siguiendo el patrón de `src/app/api/proveedores/route.ts`.

### BUG 2: Ventas POS — no se ven productos

**Síntoma:** Al ir a `/dashboard/ventas`, la grilla de productos muestra "No se encontraron productos" aunque hay productos cargados en el inventario.

**Causa raíz:** La página `src/app/dashboard/ventas/page.tsx` es un **server component** que usa `createAdminClient` (línea 13) instanciado dentro del componente async (no a nivel módulo). Esto debería funcionar. El problema probablemente es que:
1. La query filtra por `.eq('activo', true)` (línea 38) — verificar si los productos del tenant están marcados como `activo = true` en la BD.
2. O hay un error de build/cache en Vercel.

**Solución requerida:**
- Verificar en la BD (con una query SQL rápida en Supabase Dashboard): `SELECT id, nombre, activo, stock_actual FROM productos WHERE tenant_id = '<el-tenant-id>' LIMIT 10;`
- Si los productos tienen `activo IS NULL` (no `true`), el filtro `.eq('activo', true)` los excluye. Cambiar el filtro en `page.tsx` de `.eq('activo', true)` a `.neq('activo', false)` para incluir `NULL` y `true`.
- Aplicar el mismo cambio en la API `/api/inventario/productos/route.ts` si tiene ese filtro.

### Qué SÍ tocar:
- `src/app/dashboard/compras/nuevo/page.tsx` — refactorizar carga de datos a fetch de APIs
- `src/app/dashboard/ventas/page.tsx` — fix del filtro `activo`
- `src/app/api/inventario/productos/route.ts` — verificar que existe un GET y que usa `getAdminClient()`
- Cualquier API route que aún tenga `const adminClient = createAdminClient(...)` a nivel módulo → refactorizar a `getAdminClient()`

### Qué NO tocar:
- La estructura de tablas en Supabase (no crear migraciones).
- Los componentes de Ventas POS (`POSClient.tsx`, `ProductGrid.tsx`, `Cart.tsx`, `PaymentModal.tsx`) — solo tocar el `page.tsx` que les pasa los datos.
- `Agent/INDEX.md`, `Agent/DECISIONS.md`, `Agent/TODO.md` — eso lo actualiza Opus.

### Patrones a seguir:
- Ver `DECISIONS.md` entrada 2026-07-28 sobre `getAdminClient()`.
- Ver `src/app/api/configuracion/preferencias/route.ts` como ejemplo reciente del patrón correcto.

### Verificación:
1. Hacer `npm run build` localmente para verificar que no hay errores de compilación.
2. Commitear TODO a `dev` y pushear. 
3. **No pushear a `main`.** El usuario promocionará cuando verifique en el Preview Deployment de Vercel.

### Auditoría extra (si queda tiempo):
Buscar en todo `src/app/api/` cualquier archivo que todavía tenga `const adminClient = createAdminClient(` a nivel módulo (fuera de una función) y refactorizarlo a `getAdminClient()`. Esto previene futuros 500 en Vercel. Comando para encontrarlos:
```bash
git grep "^const adminClient" src/app/api/
```

**Resultado:** Hecho. Se sincronizaron las ramas, se reemplazaron las queries por fetch a la API en compras/nuevo, se corrigió el filtro de productos a .neq('activo', false), y se refactorizó adminClient a nivel global en 8 archivos.

## 2026-07-29 — FIX CRÍTICO: Despliegue de Dev a Main — Estado: hecho

**Encargo dado a Gemini / Opus:**
Terminar el trabajo de Gemini y asegurar que esté en producción. Gemini arregló los bugs en `dev` y el usuario empujó a `dev`, pero la URL de Vercel (producción) lee desde `main` y por ende seguía teniendo la versión rota del código con el error "No tenant found".

**Resultado:** Hecho (por Opus). Se identificó que la falla se debía a la diferencia de versiones entre las ramas de entorno. Se unificó la rama `dev` en `main` y se hizo push a `main` para que Vercel despliegue el arreglo en el sitio de producción.

---

## 2026-08-11 — MÓDULO 1/3: Layout responsivo del carrito POS — Estado: hecho
## 2026-08-11 — MÓDULO 2/3: Mostrar imágenes de productos en el POS — Estado: hecho
## 2026-08-11 — MÓDULO 3/3: Ordenar productos por código en toda la app — Estado: hecho

**Encargo dado a Gemini:**

Los productos deben aparecer ordenados por código (`codigo`) en todas las secciones de la app que los listen. Actualmente se ordenan por `nombre` o no tienen orden explícito.

### Contexto previo obligatorio

Lee `Agent/INDEX.md`.

### Problema

El campo `codigo` es un campo `text` que contiene códigos numéricos (ej: "001", "100", "101", "103", "105", "107") y alfanuméricos (ej: "1061410030", "1062753009"). El usuario espera ver los productos siempre en orden ascendente por este campo.

### Cambios requeridos

Hay **4 archivos** donde se listan productos y se debe cambiar el ordenamiento:

**A) `src/app/dashboard/ventas/page.tsx` (POS):**

Después de la línea `.neq('activo', false)` (línea 39), agregar:
```
.order('codigo', { ascending: true, nullsFirst: false })
```

**B) `src/app/api/inventario/productos/route.ts` (API de productos):**

Línea 51, cambiar:
```
.order('nombre')
```
por:
```
.order('codigo', { ascending: true, nullsFirst: false })
```

**C) `src/app/dashboard/inventario/page.tsx` (página de inventario):**

Línea 82, cambiar:
```
.order('nombre')
```
por:
```
.order('codigo', { ascending: true, nullsFirst: false })
```

Además, en la segunda query de inventario (la "Heavy Query", líneas 148-153), después de `.in('id', paginatedIds)`, agregar:
```
.order('codigo', { ascending: true, nullsFirst: false })
```

Y en las líneas 155-157 donde se preserva el orden con el Map, el orden ya viene dado por la primera query (`statsQuery`) que ahora ordena por `codigo`, así que no hay que tocar esa lógica.

**D) `src/app/dashboard/compras/nuevo/page.tsx`:**

Buscar donde se cargan los productos (debería ser un `fetch('/api/inventario/productos')`) y verificar que no tiene un sort local que anule el orden de la API. Si lo tiene, eliminarlo o cambiarlo a sort por `codigo`.

### Qué SÍ tocar:
- `src/app/dashboard/ventas/page.tsx` — agregar `.order('codigo')` a la query
- `src/app/api/inventario/productos/route.ts` — cambiar `.order('nombre')` por `.order('codigo')`
- `src/app/dashboard/inventario/page.tsx` — cambiar `.order('nombre')` por `.order('codigo')` en ambas queries
- `src/app/dashboard/compras/nuevo/page.tsx` — verificar y ajustar si hay sort local

### Qué NO tocar:
- No tocar la estructura de la tabla (no crear migraciones).
- No tocar archivos de Agent/ — eso lo actualiza Opus.

### Verificación:
1. `npm run build` debe pasar sin errores.
2. Commit y push a `dev`.
3. **No pushear a `main`.** El usuario verificará en el Preview Deployment.


## 2026-08-11 — MÓDULO 1/4 (ARCA): Fix adminClient y Configuración Fiscal — Estado: pendiente

**Encargo dado a Gemini:**

El Arquitecto (Opus) determinó que el código actual de facturación sufre del mismo bug de `adminClient` que arreglamos el 28 de julio, y además el formulario de Configuración Fiscal está incompleto.

### Cambios requeridos

**A) Fix de `adminClient` en las APIs de facturación:**
En los siguientes 4 archivos, debes cambiar la inicialización de `adminClient` para usar la función `getAdminClient()` que exporta nuestro helper, en lugar de importar `createClient` de supabase directamente a nivel de ruta:

1. `src/app/api/facturacion/emitir/route.ts`
2. `src/app/api/facturacion/config/route.ts`
3. `src/app/api/facturacion/comprobantes/route.ts`
4. `src/lib/arca/wsaa.ts`

**Pasos exactos para cada archivo:**
1. Importar el helper: `import { getAdminClient } from '@/lib/supabase/admin'`
2. Eliminar el import directo: `import { createClient as createAdminClient } from '@supabase/supabase-js'`
3. Buscar donde se instancia el cliente:
   ```typescript
   const adminClient = createAdminClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   )
   ```
4. Reemplazar esa instanciación por `const adminClient = getAdminClient()` (Ojo, no es asíncrona, no lleva await).
5. En `wsaa.ts`, la función `getOrRefreshToken` actualmente crea el cliente normal `createClient()`. **Debes cambiarlo a `getAdminClient()`** (sin await) porque el `update` del token necesita saltarse el RLS para guardar el token nuevo en `configuracion_fiscal`. IMPORTANTE: al quitar `await createClient()`, recordá que `getAdminClient()` no devuelve una promesa.

**B) Completar Configuración Fiscal (Backend + Frontend):**

1. En `src/components/configuracion/FacturacionARCASection.tsx`, agregar 4 campos de texto nuevos al formulario:
   - CUIT (`cuit`)
   - Razón Social (`razon_social`)
   - Condición frente al IVA (`condicion_iva` - debe ser un `<select>` con opciones: "Monotributo" y "Responsable Inscripto")
   - Domicilio Fiscal (`domicilio_fiscal`)
2. Extraer estos valores del formulario (`formData.get(...)`) y enviarlos en el body del `fetch` (`PATCH`) junto con el resto.
3. Precargar el estado inicial de estos campos con los datos de `tenant`.
4. En `src/app/api/facturacion/config/route.ts` (método PATCH), estos campos ya están destructurados y pasados al `upsert`, así que no hace falta tocar el body parsing, **pero asegurate de que todo fluya correctamente.**

### Qué NO tocar:
- No implementes la lógica del endpoint de probar conexión todavía.
- No modifiques migraciones.

### Verificación:
1. `npm run build` debe pasar sin errores.
2. Commit y push a `dev`.
3. **Pushear a `main`** para que pase a producción, ya que nos autorizaron.




## 2026-08-11 — MÓDULO 2/5 (ARCA): Generador Automático de CSR — Estado: pendiente

**Encargo dado a Gemini:**

Para mejorar la experiencia de usuario y evitar que usen herramientas de línea de comandos, vamos a integrar un generador de solicitudes de certificado (CSR) en el frontend/backend usando `node-forge`.

### Cambios requeridos

**A) API Route (Generación de Key y CSR):**
Crear el archivo `src/app/api/facturacion/csr/route.ts` con un método POST.
1. Utilizar `node-forge` (importar dinámicamente o con import estándar si es compatible con el Edge Runtime, si no usar el Node runtime) para generar un par de claves RSA 2048.
2. Generar el CSR seteando el OID del CUIT: `{ type: '2.5.4.5', value: 'CUIT ' + cuit }`. Otros campos de Subject: C='AR', O=razon_social, CN='Sistema Facturacion'.
3. Firmar el CSR con sha256.
4. Obtener el PEM del Private Key y del CSR.
5. Usar `getAdminClient()` (sin await) para guardar el `privKeyPem` en el campo correspondiente de la tabla `configuracion_fiscal` del tenant.
6. Retornar el `csrPem` al cliente como respuesta JSON (no hace falta guardarlo en BD).

**B) UI:**
En `src/components/configuracion/FacturacionARCASection.tsx`:
1. Agregar un botón "Generar Solicitud de Certificado (CSR)".
2. Al hacer click, llamar a la nueva API (`/api/facturacion/csr`).
3. Con la respuesta de la API (el texto del CSR), desencadenar una descarga automática de un archivo de texto `.csr` (o mostrarlo en un `<textarea>` con un botón "Copiar al portapapeles" para que el usuario vaya a la página de AFIP).
4. El botón solo debe estar habilitado si el CUIT y la Razón Social están guardados.

### Verificación:
1. `npm run build` debe pasar sin errores.
2. Commit y push a `dev`.
3. **No pushear a main todavía** (a menos que el usuario lo indique explícitamente).


## 2026-08-11 — MÓDULOS 4/5 + 5/5: Implementación de ARCA Connect y Notas de Crédito — Estado: hecho

**Encargo dado a Gemini:**

El Arquitecto (Opus) diseñó la fusión de los módulos 4 y 5 de ARCA en un único encargo. Se reemplaza la UI actual de facturación por un dashboard de 4 tarjetas (widgets) inspirado en un video de YouTube, y se implementa la lógica de Notas de Crédito (anulación total).

**Decisiones de diseño relevantes (ver DECISIONS.md 2026-08-11):**
- Dashboard integrado en sidebar, no app separada.
- Notas de Crédito = anulación total, con copia de ítems individuales del comprobante original.

### Migración SQL

La migración `supabase/migrations/026_notas_credito.sql` ya fue creada por Opus. **No la toques.** El usuario la ejecutará en Supabase SQL Editor. Solo agregar `comprobante_asociado_id UUID` a `comprobantes`.

### Cambios requeridos

---

**A) Sidebar — agregar submenú "Facturación ARCA"**

En `src/components/layout/DashboardLayoutClient.tsx`, línea 51, reemplazar:
```typescript
{ label: 'Comprobantes', href: '/dashboard/comprobantes', icon: FileText, roles: ['administrador', 'vendedor'] },
```
por:
```typescript
{ 
  label: 'Facturación ARCA', 
  icon: FileText, 
  roles: ['administrador'],
  subItems: [
    { label: 'Dashboard ARCA', href: '/dashboard/facturacion' },
    { label: 'Comprobantes', href: '/dashboard/facturacion/comprobantes' },
  ]
},
```

---

**B) Tipos ARCA — agregar `CbtesAsoc` al tipo `CbteDetalle`**

En `src/lib/arca/types.ts`, agregar al interface `CbteDetalle` (después del campo `Iva?`):
```typescript
CbtesAsoc?: {
  CbteAsoc: {
    Tipo: number;
    PtoVta: number;
    Nro: number;
    Cuit: number;
    CbteFch: string; // YYYYMMDD
  }[];
};
```

---

**C) API: Último comprobante**

Crear `src/app/api/facturacion/ultimo-comprobante/route.ts` con un método GET:
1. Autenticar usuario (patrón estándar: `createClient()` → `getUser()` → `createAdminClient()` → obtener `tenant_id`).
2. Leer query params: `tipo` (número entero, obligatorio).
3. Obtener config fiscal del tenant (`configuracion_fiscal`).
4. Llamar a `getOrRefreshToken(tenant_id)` para obtener Token/Sign/Cuit.
5. Llamar a `FECompUltimoAutorizado(auth, config.punto_venta, tipo, config.ambiente)`.
6. Retornar JSON: `{ ultimo: number, punto_venta: number }`.

---

**D) API: Consultar comprobante en ARCA**

Crear `src/app/api/facturacion/consultar/route.ts` con un método GET:
1. Autenticar usuario (patrón estándar).
2. Leer query params: `tipo`, `ptoVta`, `nro` (todos numéricos, obligatorios).
3. Obtener config fiscal, token WSAA.
4. Llamar a `FECompConsultar(auth, { CbteTipo: tipo, PtoVta: ptoVta, CbteNro: nro }, ambiente)`.
5. Retornar el `FeCompConsResponse` como JSON.

---

**E) API: Anular comprobante (emitir Nota de Crédito)**

Crear `src/app/api/facturacion/anular/route.ts` con un método POST:
1. Autenticar usuario (patrón estándar).
2. Leer body: `{ comprobante_id: string }`.
3. Buscar el comprobante original en la tabla `comprobantes` (debe estar en estado `emitido` y tener `cae`). Si no cumple, retornar error 400.
4. Determinar el tipo de Nota de Crédito según el tipo original:
   - `1` (Factura A) → `3` (NC A)
   - `6` (Factura B) → `8` (NC B)
   - `11` (Factura C) → `13` (NC C)
   - Si el tipo original ya es una NC o ND, retornar error 400 "No se puede anular una Nota de Crédito/Débito".
5. Obtener config fiscal, token WSAA.
6. Obtener último número de NC del tipo correspondiente: `FECompUltimoAutorizado(auth, config.punto_venta, tipoNC, ambiente)`.
7. Armar el `FeCAEReq`. El `FECAEDetRequest` debe tener:
   - `Concepto: 1` (Productos)
   - `DocTipo` y `DocNro` copiados del comprobante original
   - `CbteDesde` y `CbteHasta`: último + 1
   - `CbteFch`: fecha de hoy en formato YYYYMMDD
   - `ImpTotal`, `ImpNeto`, `ImpIVA`, `ImpTotConc: 0`, `ImpOpEx: comprobante.importe_exento`, `ImpTrib: 0`
   - `MonId: 'PES'`, `MonCotiz: 1`
   - Si `ImpIVA > 0`, incluir bloque `Iva` con la alícuota del 21% (Id: 5, BaseImp: importe_neto, Importe: importe_iva)
   - **CRÍTICO**: Incluir bloque `CbtesAsoc`:
     ```typescript
     CbtesAsoc: {
       CbteAsoc: [{
         Tipo: comprobante.tipo_comprobante,
         PtoVta: comprobante.punto_venta,
         Nro: comprobante.numero_comprobante,
         Cuit: Number(config.cuit.replace(/\D/g, '')),
         CbteFch: comprobante.fecha_emision.replace(/-/g, '')
       }]
     }
     ```
8. Llamar a `FECAESolicitar(auth, req, ambiente)`.
9. Si resultado es `A`:
   a. Insertar nueva fila en `comprobantes` con:
      - `tenant_id`, `config_fiscal_id: config.id`
      - `tipo_comprobante: tipoNC`
      - `punto_venta: config.punto_venta`
      - `numero_comprobante: ultimoNC + 1`
      - `fecha_emision: hoy`
      - `doc_tipo`, `doc_nro` copiados del original
      - `importe_total`, `importe_neto`, `importe_iva`, `importe_exento` copiados del original
      - `cae: res.cae`
      - `cae_vencimiento` parseado a formato DATE
      - `resultado: 'A'`
      - `estado: 'emitido'`
      - `comprobante_asociado_id: comprobante.id` (la factura original)
      - `cliente_id` copiado del original
   b. Copiar los ítems: leer `comprobante_items` donde `comprobante_id = original.id`, insertar copias con el `comprobante_id` de la nueva NC.
   c. Marcar el comprobante original: `UPDATE comprobantes SET estado = 'anulado' WHERE id = original.id`.
10. Retornar la NC creada como JSON.

---

**F) Frontend — Dashboard ARCA (reescritura de `/dashboard/facturacion`)**

**F1) Fix de `page.tsx`:**
El archivo `src/app/dashboard/facturacion/page.tsx` tiene un bug en líneas 17-20: instancia `adminClient` con `createClient` directo de `@supabase/supabase-js` en vez de usar `createAdminClient()` de `@/lib/supabase/admin`. **Corregir esto primero** (ver DECISIONS.md 2026-07-28).

**F2) Reescribir `page.tsx`:**
Convertirlo en un server component que:
1. Importa `createAdminClient` de `@/lib/supabase/admin` (NO de `@supabase/supabase-js`).
2. Verifica usuario y obtiene tenant_id (patrón estándar).
3. Carga `configuracion_fiscal` del tenant.
4. Si no existe config fiscal, muestra el bloque de "Facturación no configurada" (ya existente).
5. Carga los últimos 10 comprobantes para "Actividad Reciente".
6. Renderiza `<ARCADashboard configFiscal={configFiscal} actividadReciente={comprobantes} />`.

**F3) Crear `src/app/dashboard/facturacion/ARCADashboard.tsx`:**

Client component (`'use client'`). Diseño inspirado en el video del YouTuber con estas especificaciones:

**Header:**
- Título: "Dashboard ARCA" con subtítulo "Gestiona tus comprobantes electrónicos".
- A la derecha: badges con el Punto de Venta (ej: `P. VENTA: 0001`) y la Condición IVA.

**Grid de 4 tarjetas** (CSS grid, 4 columnas en desktop, 2 en tablet, 1 en mobile):

Tarjeta 1 — "Último Correlativo":
- Ícono: `RefreshCw` (lucide) en color `emerald-400` con badge "sync".
- Selector dropdown de tipo de comprobante (Factura A/B/C, NC A/B/C, ND A/B/C).
- Al seleccionar, llama a `GET /api/facturacion/ultimo-comprobante?tipo=X`.
- Muestra en grande el número (`text-3xl font-bold`) y abajo `P. VENTA: X`.
- Mientras carga, spinner.

Tarjeta 2 — "Emitir Factura":
- Ícono: `Send` (lucide) en color `rose-400`.
- Descripción: "Generar una nueva factura electrónica con CAE".
- Botón: "Comenzar >" que abre un `Dialog`.
- **El Dialog contiene el formulario de emisión actual** (migrado desde `FacturacionClient.tsx`): selector de tipo, selector de cliente, selector de concepto (nuevo: Producto=1, Servicio=2, Ambos=3), input de fecha (default hoy), tabla de ítems con agregar/eliminar, total estimado, botón "Guardar Borrador". Después de guardar, ofrecer botón "Emitir a ARCA" que llama a `POST /api/facturacion/emitir`.

Tarjeta 3 — "Consultar Datos":
- Ícono: `Search` (lucide) en color `blue-400`.
- Descripción: "Ver información detallada de cualquier comprobante".
- Botón: "Buscar >" que abre un `Dialog` con 3 inputs: Tipo de Comprobante (select), Punto de Venta (number), Número (number).
- Al enviar, llama a `GET /api/facturacion/consultar?tipo=X&ptoVta=Y&nro=Z`.
- Muestra los resultados en el mismo dialog: CAE, Fecha de vencimiento, DocTipo/DocNro, Importe Total, Resultado.

Tarjeta 4 — "Anular Comprobante":
- Ícono: `Ban` (lucide) en color `red-400`.
- Descripción: "Generar nota de crédito para cancelar un comprobante".
- Botón: "Anular >" en estilo destructivo (rojo) que abre un `Dialog`.
- El dialog lista los comprobantes emitidos del tenant (solo facturas, no NC/ND) que NO estén ya anulados. Cada uno muestra: tipo, número formateado (0001-00000003), fecha, importe, cliente.
- Al seleccionar uno, mostrar confirmación: "¿Estás seguro de anular [Factura C 0001-00000003] por $X.XXX? Se emitirá una Nota de Crédito C ante ARCA."
- Al confirmar, llama a `POST /api/facturacion/anular` con `{ comprobante_id }`.
- Muestra toast de éxito con el CAE de la NC.

**Sección "Actividad Reciente"** (debajo de las tarjetas):
- Tabla simple con los últimos 10 comprobantes. Columnas: Tipo, Número, Fecha, Cliente, Total, CAE, Estado (badge color-coded).
- Enlace "Ver todos >" que lleva a `/dashboard/facturacion/comprobantes`.

**Estética obligatoria:**
- Dark mode: fondo de las tarjetas `bg-slate-900/80` con `border border-white/5`.
- Micro-animaciones: `hover:scale-[1.02] transition-all duration-200` en las tarjetas.
- Los íconos de cada tarjeta tienen un fondo circular sutil con su color (`bg-emerald-500/10 p-2 rounded-lg`).
- Los botones de acción usan `text-sm font-medium` con flecha `>` al final.
- Usar componentes shadcn/ui existentes: `Card`, `Dialog`, `Select`, `Input`, `Button`, `Badge`, `Table`.

---

**G) Mover listado de comprobantes a sub-ruta**

Crear `src/app/dashboard/facturacion/comprobantes/page.tsx`:
1. Server component que carga comprobantes y clientes (copiar la lógica actual de `page.tsx` líneas 54-67, pero usando `createAdminClient()` correctamente).
2. Renderiza el `FacturacionClient` actual.

Mover `src/app/dashboard/facturacion/FacturacionClient.tsx` a `src/app/dashboard/facturacion/comprobantes/FacturacionClient.tsx`. Actualizar el import en la nueva `page.tsx`.

Agregar en `FacturacionClient.tsx` un botón de "Anular" en la columna de acciones (al lado de "Emitir a ARCA") para comprobantes emitidos. Este botón llama a `POST /api/facturacion/anular` con toast de confirmación previo.

---

### Qué NO tocar:
- No tocar `src/lib/arca/wsaa.ts` — ya funciona.
- No modificar migraciones existentes (001-025).
- No tocar archivos de `Agent/` — eso lo actualiza Opus.
- No crear componentes UI nuevos en `src/components/ui/` — usar los existentes de shadcn.
- No tocar la lógica de sanitización de CUIT en `wsfev1.ts` — ya funciona.

### Verificación:
1. `npm run build` debe pasar sin errores.
2. Commit y push a `dev`.
3. **No pushear a `main`.** El usuario verificará en el Preview Deployment y luego promoverá manualmente.
