---
id: 7001
estado: Revision
autor: Naim Guarino
fecha: 2026-05-03
titulo: Registro de Deportes (Sport)
---

# TDD-7001: Registro de Deportes (Sport)

## Contexto de Negocio (PRD)

### Objetivo

Centralizar el catálogo de deportes que el club ofrece a los socios, con cupo máximo, precio adicional y reglas de certificado médico, de modo que las futuras inscripciones (`Enrollment`) referencien un `Sport` bien definido y con restricciones alineadas al DER y al TP integrador.

### User Persona

- Nombre: Coordinación deportiva / administrativo del club.
- Necesidad: Dar de alta actividades con datos claros (cupo, costo extra, si exige certificado) sin duplicar nombres ni cargar cupos inválidos, para evitar conflictos al inscribir socios.

### Criterios de Aceptación

- El sistema debe validar que `max_capacity` sea un entero estrictamente mayor que cero (regla de negocio del PRD de la actividad).
- El sistema debe validar que `name` no esté vacío (tras normalizar espacios) y sea **único entre deportes activos** (`deleted_at` nulo), coherente con el UK del DER y el borrado lógico (TDD-7003).
- El sistema debe validar que `additional_price`, si se informa, no sea negativo; si no se informa, debe asumirse cero según convención del API.
- El sistema debe persistir `requires_medical_certificate` (booleano; por defecto `false` si no se envía).
- Al finalizar, el sistema debe devolver el deporte creado con su `id` (UUID) y los campos guardados.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Sport` y su relación conceptual con `Enrollment` (el alta de Sport no crea inscripciones; solo habilita que `Enrollment.sport_id` apunte a este registro en otros casos de uso).

Propiedades de `Sport` según DER:

- `id`: Identificador único universal (UUID), clave primaria.
- `name`: Cadena de texto, obligatoria, no vacía; única en toda la tabla (UK).
- `description`: Cadena de texto opcional o nulable según decisión de implementación.
- `max_capacity`: Entero, mayor que cero.
- `additional_price`: Número (float / decimal según Prisma), mayor o igual que cero.
- `requires_medical_certificate`: Booleano; indica si el deporte exige certificado médico para inscribirse.
- `deleted_at`: Fecha/hora de baja lógica; `null` en el alta y mientras el deporte esté activo en catálogo (ver TDD-7003).

Relación con el DER: un `Sport` tiene cero o muchas `Enrollment`; cada `Enrollment` tiene exactamente un `sport_id` hacia `Sport.id` (relación «offers»).

**Unicidad de `name`:** el UK del DER aplica entre deportes **activos** (`deleted_at IS NULL`); ver migración índice único parcial en TDD-7003.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización entre frontend y backend:

- Endpoint: `POST /api/v1/sports`
- Request Body (CreateSportRequest):

```ts
{
    name: string;
    description?: string | null;
    max_capacity: number;
    additional_price?: number;
    requires_medical_certificate?: boolean;
}
```

- Respuesta exitosa: `201 Created` con el cuerpo del `Sport` persistido (incluye `id` generado).

### Componentes de Arquitectura Hexagonal

1. **Puerto:** `SportRepository` (interfaz en dominio: `create`, opcionalmente `findByNameNormalized` para detectar duplicados antes del insert).
2. **Caso de uso:** `CreateSportUseCase` (valida reglas de negocio, valores por defecto y delega en el repositorio; mapea violación de unicidad de base a `409`).
3. **Servicio de dominio (opcional):** `SportValidator` si se prefiere concentrar validaciones de cupo, precio y nombre.
4. **Adaptador de salida:** `PostgresSportRepository` (Prisma; constraint `@unique` en `name`).
5. **Adaptador de entrada:** `SportController` (ruta HTTP POST, mapeo de errores a códigos HTTP).

## Casos de Borde y Errores


| Escenario                                           | Resultado esperado                                   | Código HTTP               |
| --------------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| `max_capacity` menor o igual a cero o no entero     | Mensaje: "El cupo máximo debe ser mayor a cero"      | 400 Bad Request           |
| `name` vacío o solo espacios                        | Mensaje: "El nombre del deporte es obligatorio"      | 400 Bad Request           |
| `name` ya registrado (UK)                           | Mensaje: "Ya existe un deporte con ese nombre"       | 409 Conflict              |
| `additional_price` negativo o no numérico           | Mensaje: "El precio adicional no puede ser negativo" | 400 Bad Request           |
| `requires_medical_certificate` con tipo inválido    | Mensaje de validación de tipo                        | 400 Bad Request           |
| Faltan campos obligatorios (`name`, `max_capacity`) | Mensaje indicando campos requeridos                  | 400 Bad Request           |
| Error de conexión a DB                              | Mensaje: "Error interno, reintente más tarde"        | 500 Internal Server Error |


## Plan de Implementación

1. Agregar modelo `Sport` en Prisma (campos alineados al DER, `deleted_at` opcional, unicidad de `name` entre activos según índice parcial acordado, relación `enrollments` hacia `Enrollment` cuando exista el modelo) y ejecutar migración.
2. Definir `CreateSportRequest` y DTO de respuesta en `@alentapp/shared`.
3. Declarar el puerto `SportRepository` en dominio e implementar `PostgresSportRepository`.
4. Implementar `CreateSportUseCase` con validaciones y manejo de conflicto por nombre duplicado.
5. Exponer `POST /api/v1/sports` en `SportController` y registrar la ruta en `app.ts`.
6. Crear o extender pantalla/servicio en el frontend para consumir el alta y mostrar confirmación de éxito.

