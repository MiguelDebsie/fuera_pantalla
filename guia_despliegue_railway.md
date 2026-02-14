# Guía de Despliegue en Railway y Configuración de Dominio (Cloudflare)

Esta guía te ayudará a eliminar tu proyecto antiguo, desplegar la nueva versión de **Focus Buddy & Empire**, y configurar tu dominio personalizado correctamente.

---

## 🚀 Parte 1: Limpieza y Nuevo Despliegue

### 1. Eliminar Proyecto Antiguo (Si es necesario)
1.  Entra a tu [Dashboard de Railway](https://railway.app/dashboard).
2.  Selecciona el proyecto antiguo que deseas eliminar.
3.  Ve a la pestaña **Settings** (Configuración) ⚙️.
4.  Baja hasta la sección **Danger Zone**.
5.  Haz clic en **Delete Project**. Escribe el nombre del proyecto para confirmar.

### 2. Desplegar Nuevo Proyecto
1.  En el Dashboard, haz clic en **New Project** → **Deploy from GitHub repo**.
2.  Selecciona tu repositorio: `fuera_pantalla`.
3.  Railway detectará automáticamente `package.json` y comenzará el build.

### 3. Configurar Variables de Entorno (Crucial)
Mientras se construye (o si falla), ve a la pestaña **Variables**:
1.  Haz clic en **New Variable**.
2.  Agrega las siguientes (copialas de tu archivo `.env` local):
    *   `VITE_SUPABASE_URL`: (Tu URL de Supabase)
    *   `VITE_SUPABASE_ANON_KEY`: (Tu clave anónima de Supabase)
    *   `PORT`: `3000` (Opcional, Railway suele asignarlo, pero `serve` lo usará).

---

## 🌐 Parte 2: Configuración de Dominio (Cloudflare)

### Paso 1: Obtener Dirección en Railway
1.  En tu proyecto de Railway, ve a **Settings** → **Networking** (o **Domains**).
2.  Haz clic en **+ Custom Domain**.
3.  Escribe tu dominio (ej: `app.midominio.com` o `midominio.com`).
4.  Railway te dará un registro DNS. **Copia el valor** (usualmente algo como `focus-buddy-production.up.railway.app`).

### Paso 2: Actualizar DNS en Cloudflare
1.  Inicia sesión en [Cloudflare](https://dash.cloudflare.com/) y selecciona tu dominio.
2.  Ve a la sección **DNS** → **Records**.
3.  Busca el registro antiguo que apuntaba a tu app anterior y **elimínalo** (bordecito de basura o editar).
4.  **Crea un nuevo registro**:
    *   **Type**: `CNAME`
    *   **Name**:
        *   Usa `@` si es tu dominio raíz (`midominio.com`).
        *   Usa el subdominio (ej: `app`) si es `app.midominio.com`.
    *   **Target** (o Content): Pega el valor que copiaste de Railway (`...railway.app`).
    *   **Proxy Status**:
        *   Opción A (Recomendada): **Proxied (Nube Naranja)** ☁️. Cloudflare te da SSL gratis y protección DDoS.
        *   Opción B (Si falla): **DNS Only (Nube Gris)** ☁️. Solo si Railway tiene problemas verificando, pero generalmente la Nube Naranja funciona bien con Railway.
5.  Haz clic en **Save**.

### Paso 3: Verificación
*   Vuelve a Railway. El estado del dominio cambiará de "Verifying" a "Active" (puede tardar unos minutos).
*   Si usaste Nube Naranja en Cloudflare, asegúrate de que en la sección **SSL/TLS** de Cloudflare esté en modo **Full** o **Full (Strict)** para evitar errores de redirección.

---

## ✅ Verificación Final
Accede a tu dominio en el navegador. Deberías ver la pantalla de carga de **Focus Buddy**.
Si ves un error 502/Bad Gateway, espera un minuto a que Railway termine de levantar el servicio.
