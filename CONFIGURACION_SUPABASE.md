# 📘 Guía Maestra • Configuración Oficial de Supabase & Vercel
**Proyecto:** Locos por los Dardos • Argentina & Darderos Mar del Plata  
**Plataforma:** Supabase (Dashboard Versión 2025/2026) + Vercel Deployment

---

## 📌 1. Credenciales y Datos Oficiales del Proyecto

| Parámetro | Valor |
| :--- | :--- |
| **Nombre del Proyecto** | `locosporlosdardosmdq's Project` |
| **Project Reference ID** | `pufyeabrvrlikbgkjplz` |
| **Contraseña de Base de Datos** | `D25SJh5t2oMiHa2K` |
| **Motor de Base de Datos** | PostgreSQL 17 (Supabase Managed) |
| **Región de Hosting** | São Paulo (`aws-0-sa-east-1`) / South America |

---

## 🔑 2. Cadenas de Conexión (Connection Strings)

Estas son las cadenas de conexión armadas y listas para usar tanto en `.env.local` como en las variables de entorno de **Vercel**:

### A. Para `DATABASE_URL` (Modo Transacción / Pooler - Puerto 6543)
> **Uso:** Conexión para Vercel Serverless Functions y consultas del servidor web en producción con pooling de conexiones (evita agotar límites de conexiones concurrentes).
```text
postgresql://postgres.pufyeabrvrlikbgkjplz:D25SJh5t2oMiHa2K@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### B. Para `DIRECT_URL` (Modo Sesión / Directo - Puerto 5432)
> **Uso:** Conexión directa a PostgreSQL requerida por Prisma ORM para ejecutar migraciones y comandos DDL de esquema.
```text
postgresql://postgres.pufyeabrvrlikbgkjplz:D25SJh5t2oMiHa2K@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 🗺️ 3. Mapa de Navegación en la Interfaz Moderna de Supabase (2025/2026)

Debido al rediseño del panel de Supabase, las secciones cambiaron de lugar respecto a tutoriales antiguos:

1. **Botón `Connect` (Arriba al centro/derecha):**
   - Siempre accesible en la barra superior junto al badge de `PRODUCTION`.
   - Abre el modal con las pestañas:
     - `Direct (Connection string)`: Cadena simple.
     - `ORM > Prisma`: Te entrega directamente `DATABASE_URL` (6543) y `DIRECT_URL` (5432) juntas.
2. **Ícono de `Database` (Barra negra de la izquierda):**
   - **Ya no está adentro de Project Settings.**
   - Está en la tira negra vertical de la izquierda de todo: es el **4º ícono contando desde arriba** (forma de barril/cilindro).
   - Para cambiar contraseña: URL directa `.../database/settings#database-password`.
3. **Buscador Universal (`Ctrl + K`):**
   - Arriba a la derecha. Escribir `password` o `API keys` para saltar directamente a cualquier pantalla.

---

## ⚡ 4. Paso a Paso: Ejecución del Esquema en SQL Editor

### Paso A: Abrir el SQL Editor
1. En la tira negra vertical de la izquierda de Supabase, hacé click en el **3º ícono contando desde arriba**: **`SQL Editor`** (`>_`).
2. Tocá el botón verde **`+ New query`**.

### Paso B: Pegar el código SQL
1. Copiá todo el contenido del archivo `src/lib/db-schema.sql` del proyecto.
2. Pegalo en el editor de texto de la query en Supabase.
3. Hacé click en el botón verde **`Run`** (arriba a la derecha o con `Ctrl + Enter`).

### Paso C: Modal de Advertencia "Potential issue detected"
Al presionar Run, Supabase muestra una ventana emergente:
> *"This query creates tables without enabling Row Level Security. Clients using anon or authenticated keys may be able to access these tables."*

#### 👉 ¿Qué botón elegir?
> ### ✅ Hacé click en el botón verde: **`Run and enable RLS`**
- **Por qué:** Activa automáticamente la seguridad por filas (*Row Level Security*) en todas las tablas creadas, impidiendo accesos anónimos no autorizados a los datos de tus jugadores, torneos y pedidos.

---

## 🛡️ 5. Obtener las Claves API de Supabase

Una vez creado el esquema:
1. En el menú de íconos de la izquierda, andá al engranaje abajo de todo: **Project Settings (`⚙️`)**.
2. En la lista de opciones hacé click en **`API Keys`** (o **`Data API`**).
3. Copiá los siguientes valores:
   - **Project URL:** `https://pufyeabrvrlikbgkjplz.supabase.co`
   - **anon (public):** Clave pública para el cliente web.
   - **service_role (secret):** Clave secreta administrativa (para webhooks de pagos y APIs seguras del backend).

---

## 🚀 6. Configuración en Vercel (Variables de Entorno)

En tu proyecto de [Vercel](https://vercel.com) en **Settings > Environment Variables**, cargá:

```ini
# Base de Datos (Pooler y Directa)
DATABASE_URL="postgresql://postgres.pufyeabrvrlikbgkjplz:D25SJh5t2oMiHa2K@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pufyeabrvrlikbgkjplz:D25SJh5t2oMiHa2K@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://pufyeabrvrlikbgkjplz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_clave_anon_publica"
SUPABASE_SERVICE_ROLE_KEY="tu_clave_service_role_secreta"

# Dominio de la App
NEXT_PUBLIC_APP_URL="https://tu-proyecto.vercel.app"
```

---

*Documento generado y mantenido por el Agente de Arquitectura de Locos por los Dardos.*
