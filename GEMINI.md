IDIOMA: solo responde en español, piensa en español ya que yo no entiendo otro idioma que no sea el español, el codigo hazlo en el lenguaje que corresponda, pero a mi respondeme en español.

Documento Maestro: Focus Buddy & Empire - Suite Familiar Pro1. Resumen EjecutivoEste sistema es un Micro-SaaS de arquitectura conductual diseñado para la gestión del enfoque académico. Utiliza Ingeniería de Comportamiento mediante mascotas virtuales y sincronización en tiempo real. El sistema opera íntegramente en un entorno web, optimizando la accesibilidad y eliminando la fricción de instalación de tiendas nativas.2. Arquitectura de Suite Familiar FlexibleEl sistema está diseñado para adaptarse a la realidad de cada hogar:Administración Adaptativa: Soporta configuraciones de uno o dos padres. La tabla de familias permite vincular hasta dos perfiles con rol parent, pero funciona de forma plenamente operativa con un solo administrador.Privacidad y Sincronización: Utiliza políticas de Row Level Security (RLS) en Supabase para asegurar que los datos familiares sean privados.Vinculación: Los hijos se conectan mediante un código de 6 dígitos generado por el administrador, facilitando el acceso en múltiples dispositivos web.3. ADN de Mascota: Geometría, Hábitats e Interacciones
Cada mascota es un componente SVG dinámico que vive en su propio ecosistema. Se ha implementado un Reloj de Micro-Interacciones que dispara una acción cada **1 minuto** de enfoque ininterrumpido.

| Mascota | Especie | Nombre | Hábitat (Fondo SVG) | Interacción (Cada 1 min) |
| :--- | :--- | :--- | :--- | :--- |
| **Lumi** | Gato | Lumi | Sala acogedora con un cojín suave. | Se estira y suelta un bostezo animado. |
| **Zipo** | Perro | Zipo | Jardín soleado con césped verde. | Mueve la cola y da un pequeño salto de alegría. |
| **Grom** | Dino | Grom | Selva prehistórica con helechos. | Da un pequeño rugido con corazones (agradecimiento). |
| **Axi** | Axolote | Axi | Acuario zen con burbujas y coral. | Lanza una ráfaga de burbujas flotantes. |
| **Tui** | Pájaro | Tui | Cielo despejado con nubes suaves. | Realiza un giro de 360° en su eje (vuelo). |
| **Koda** | Zorro | Koda | Bosque otoñal con hojas cayendo. | Mueve las orejas en busca de sonidos. |
| **Mochi** | Panda | Mochi | Bosque de bambú con neblina. | Saca una rama de bambú y da un mordisco. |
| **Glitch** | Robot | Glitch | Estación espacial con circuitos luz. | Escanea la pantalla con un rayo láser de "Foco". |

4. Funciones de Valor y Gamificación
*   **Contrato de Honor Digital:** Firma inicial de compromiso entre padre/s e hijo/s para establecer metas claras.
*   **Bitácora de Orgullo:** Espacio de reflexión post-sesión para que el hijo documente sus avances académicos.
*   **Escudo de Racha:** Protección adquirible para evitar la pérdida de niveles durante días de descanso o enfermedad.
*   **Mensajes en Tiempo Real:** Los padres pueden enviar "Ánimos" que se renderizan como burbujas de texto sobre la mascota.
*   **Aviso Familiar de Desconexión:** Función de "Pausa Familiar" que bloquea temporalmente la interfaz para fomentar la convivencia real.

5. Implementación Técnica y Limitaciones Web
Al ser un entorno web, el sistema se rige por la Integridad de la Sesión:
*   **Detección de Fuga:** Uso de la API de Visibilidad para detectar cambios de pestaña y aplicar penalizaciones automáticas.
*   **Heartbeat (Latido):** Señal enviada a Supabase cada 60 segundos para validar que el hijo sigue en la sesión de estudio.
*   **Congelamiento Lógico:** El administrador puede suspender la ganancia de XP y monedas desde su panel, dejando la mascota en "Modo Pausa".

6. Economía y Progresión Matemática
La evolución de la mascota se rige por la siguiente fórmula de crecimiento:
$$L = 0.07 \cdot \sqrt{XP}$$

7. Listado de Funciones para Programación (Checklist)

**Interfaz del Hijo:**
- [x] Ciclo de Respiración: Animación constante del SVG.
- [x] Render de Hábitat: Fondo dinámico según la especie elegida.
- [x] Temporizador de Micro-Interacción: Lógica de 1 minuto para disparar animaciones especiales.
- [x] Input de Bitácora: Formulario al finalizar la sesión y subida de Evidencia (Foto).

**Interfaz del Administrador (Padre/Madre):**
- [x] Panel Multi-Hijo: Vista de lista con el estado de cada mascota vinculada.
- [x] Dashboard Flexible: Soporte para uno o dos administradores con acceso a los mismos datos.
- [x] Control de Misiones: Interfaz para crear y validar tareas manuales.
- [x] Historial de Mensajería: Registro de los últimos ánimos enviados.
- [x] Botón Maestro de Desconexión: Disparador de evento Realtime para toda la familia.Nota para la IA:"Asegúrate de que el componente CutePet reciba ahora una propiedad adicional habitatType y lastInteractionTime para gestionar el fondo y las animaciones de 5 minutos de forma eficiente sin sobrecargar el DOM."