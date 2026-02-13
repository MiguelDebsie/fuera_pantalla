# Documentación Técnica: Focus Buddy & Empire - Suite Familiar 🐾

**Versión:** 1.1.0 (Producción Ready)
**Fecha:** 13 de Febrero, 2026
**Autor:** Antigravity AI (en colaboración con Debsie)

## 1. Visión General del Proyecto
"Focus Buddy & Empire" es una plataforma de **gamificación de la productividad** diseñada para familias. Su objetivo es ayudar a niños y estudiantes a mantener el enfoque en sus tareas mediante el cuidado de mascotas virtuales que crecen y evolucionan con su tiempo de estudio.

El sistema funciona como una **Suite Familiar**, permitiendo a los padres gestionar múltiples perfiles, asignar tareas y monitorear el progreso, mientras que los hijos disfrutan de una experiencia lúdica y motivadora.

---

## 2. Funcionalidades Clave

### 🧠 Motor de Enfoque (Focus Engine)
-   **Temporizador Gamificado:** Sesiones de estudio configurables (5-120 min).
-   **Sistema de Recompensas:**
    -   **Incremental:** 1 moneda por cada minuto de enfoque exitoso.
    -   **Bono por Completitud:** Al terminar una sesión, se otorgan monedas extra iguales a la duración de la sesión.
-   **Detección de Distracciones:** Uso de la API `visibilitychange`. Si el usuario cambia de pestaña, la mascota se penaliza y la sesión se pausa.

### 🦁 Mascotas Virtuales (Renovadas y Nombradas)
-   **Especies:** 
    -   🐱 **Lumi** (Gato) - Energía y Luz.
    -   🐶 **Zipo** (Perro) - Velocidad y Lealtad.
    -   🦖 **Grom** (Dino) - Fuerza y Valor.
    -   💧 **Axi** (Axolote) - Calma y Agua.
    -   🦅 **Tui** (Pájaro) - Libertad y Aire.
    -   🦊 **Koda** (Zorro) - Astucia y Compañía.
    -   🐼 **Mochi** (Panda) - Ternura y Estilo.
    -   🤖 **Glitch** (Robot) - Tecnología y Futuro.
-   **Micro-Interacciones:** Cada **1 minuto** de enfoque, la mascota realiza una animación única (bostezo, burbujas, escaneo láser, etc.) para dar feedback positivo sin romper la concentración.

### 💰 Economía y Tienda
-   **Monedas:** Moneda virtual segura (validada por RPC).
-   **Tienda:** Permite comprar:
    -   **Hbitats:** Cambia el entorno SVG de la mascota.
    -   **Escudos de Racha:** Protege la racha diaria.

### 👨‍👩‍👧‍👦 Gestión Familiar
-   **Roles:** Padre (Admin) y Hijo (Usuario PIN).
-   **Control Parental:**
    -   **Monitor en Vivo:** Ver estado (Focusing/Idle/Offline) y ánimo de la mascota.
    -   **Congelamiento (Freeze):** Bloquear pantallas de hijos por tiempo definido.
    -   ** Auditoría:** Ver historial de distracciones y **Evidencias Fotográficas**.

---

## 3. Arquitectura Técnica

### Stack Tecnológico
-   **Frontend:** React 18 + TypeScript + Vite.
-   **UI:** Tailwind CSS + Lucide React.
-   **Backend:** Supabase (PostgreSQL 15).
-   **Storage:** Supabase Storage (Bucket `evidence`).

### Base de Datos Consolidada (`schema_final.sql`)
El esquema se ha unificado en un solo archivo maestro que incluye:
-   **`families` & `family_members`**: Estructura jerárquica.
-   **`profiles`**: Datos de gamificación (monedas, escudos).
-   **`pets`**: Estado de las mascotas.
-   **`tasks`**: Misiones asignadas por padres.
-   **`study_logs`**: Registro de sesiones con URL de evidencia.
-   **`distractions`**: Log de seguridad.
-   **`owned_backgrounds`**: Inventario.

### Seguridad y RLS (Row Level Security)
Implementación robusta ("Nuclear Fix"):
-   **Funciones `SECURITY DEFINER`**: Para evitar recursión infinita en políticas de familia (`get_my_family_ids`).
-   **Storage RLS**: Política flexible que permite cargas `public` al bucket `evidence` para soportar dispositivos compartidos donde el hijo no tiene sesión Auth completa.

---

## 4. Flujos Críticos

### 4.1. Autenticación Híbrida
1.  **Padre:** Login estándar (Email/Pass).
2.  **Hijo:** Login por PIN. El sistema hidrata el estado local (`AuthContext`) sin sesión Supabase Auth completa, permitiendo un acceso rápido y sin fricción en tablets compartidas.

### 4.2. Asignación de Monedas (RPC)
Para evitar trampas, el frontend no puede editar `coins` directamente. Llama a:
```sql
award_coins(user_id, amount, pin_verification)
```
Esta función valida permisos y PIN en el servidor antes de sumar saldo.

### 4.3. Subida de Evidencia
Al finalizar una sesión, el hijo puede tomar una foto. Esta se sube directamente a Supabase Storage:
-   **Bucket:** `evidence`
-   **Política:** `INSERT` permitido a `public` (necesario por el modelo de login híbrido).
-   **Referencia:** La URL pública se guarda en `study_logs`.

---

## 5. Guía de Mantenimiento

### Comandos Útiles
```bash
npm run dev      # Iniciar servidor local
```

### Restauración de Base de Datos
Si se requiere reiniciar el entorno, ejecutar el contenido de **`schema_final.sql`** en el Editor SQL de Supabase. Este script contiene **todo** lo necesario para reconstruir la DB desde cero.

---
*Documentación actualizada por Antigravity AI.*
