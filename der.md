# Documentación de Clases y Tablas

## Usuario
Representa a cualquier usuario del sistema: administrador, árbitro u organización.

**Tabla:** `usuarios`

**Campos:**
- `id` (int, PK): Identificador único.
- `nombre` (string): Nombre completo del usuario.
- `email` (string, único): Correo electrónico.
- `hashed_password` (string): Contraseña encriptada.
- `rol` (enum): Rol del usuario (`admin`, `arbitro`, `organizacion`).
- `ubicacion_lat` (string, opcional): Latitud de la ubicación.
- `ubicacion_lng` (string, opcional): Longitud de la ubicación.

---

## Torneo
Contiene la información de los torneos deportivos.

**Tabla:** `torneos`

**Campos:**
- `id` (int, PK): Identificador único.
- `nombre` (string): Nombre del torneo.
- `descripcion` (text): Descripción del torneo.
- `fecha_inicio` (date): Fecha de inicio.
- `fecha_fin` (date): Fecha de finalización.
- `organizacion_id` (int, FK -> usuarios.id): Organización que crea el torneo.
- `activo` (boolean): Indica si el torneo está activo.

**Relaciones:**
- Un **Usuario** (organización) puede crear varios torneos.

---

## Partido
Contiene los partidos de cada torneo.

**Tabla:** `partidos`

**Campos:**
- `id` (int, PK): Identificador único.
- `torneo_id` (int, FK -> torneos.id): Torneo al que pertenece.
- `fecha_hora` (datetime): Fecha y hora del partido.
- `cancha` (string): Nombre de la cancha.
- `cantidad_arbitros` (int): Número de árbitros requeridos.
- `cantidad_asistentes` (int): Número de asistentes requeridos.
- `modalidad_pago` (string): Forma de pago (`en_cancha` o `administrador`).
- `valor_arbitro` (int): Valor a pagar a cada árbitro.
- `valor_asistente` (int): Valor a pagar a cada asistente.

**Relaciones:**
- Un **Torneo** contiene múltiples **Partidos**.

---

## Notas Generales
- Las relaciones entre tablas son claves foráneas (`FK`) para mantener la integridad referencial.
- Los roles de usuario (`rol`) controlan permisos dentro de la aplicación:
  - `admin` → control total.
  - `arbitro` → puede ver y registrar partidos.
  - `organizacion` → puede cargar torneos y partidos.
