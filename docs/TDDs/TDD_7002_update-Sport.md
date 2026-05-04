---

## id: 7002
estado: Revision
autor: Naim Guarino
fecha: 2026-05-03
titulo: Actualización de Deportes (Sport)

# TDD-7002: Actualización de Deportes (Sport)

## Contexto de Negocio (PRD)

### Objetivo

Permitir corregir o ajustar los datos operativos de un deporte ya registrado (descripción, cupo máximo, precio adicional y exigencia de certificado médico) sin cambiar su nombre.

### User Persona

- Nombre: Coordinación deportiva / administrativo del club.
- Necesidad: Actualizar cupos o aranceles cuando cambian las instalaciones o la normativa, sin renombrar el deporte para no desalinear reportes, comunicaciones ni inscripciones existentes.

### Criterios de Aceptación

- El sistema debe rechazar cualquier payload que incluya la propiedad `name` (inmutabilidad explícita del nombre).
- El sistema debe permitir actualizar uno, varios o todos los campos permitidos: `description`, `max_capacity`, `additional_price`, `requires_medical_certificate` (actualización parcial a nivel de negocio).
- El sistema debe validar que, si se envía `max_capacity`, sea entero estrictamente mayor que cero.
- El sistema debe validar que, si se envía `additional_price`, sea mayor o igual que cero.
- El sistema debe validar que el deporte exista y esté **activo** (`deleted_at` nulo) antes de persistir cambios; los dados de baja lógica no se editan por este endpoint.
- Si la edición es correcta, debe retornar los datos del deporte actualizados.

## Diseño Técnico (RFC)

### Modelo de Datos

Sin cambios estructurales respecto al alta (TDD-7001): se actualizan columnas existentes de `Sport`. El campo `name` no se modifica por este flujo. La entidad `Enrollment` no se altera; las filas siguen referenciando el mismo `sport_id`.

### Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido para definir el cuerpo de la petición. Todos los campos del body son opcionales: se trata de una **actualización parcial a nivel de negocio** con **PUT**, igual que en socios (`PUT /api/v1/socios/:id`): el cliente envía solo lo que quiere cambiar y el servidor fusiona sobre el registro existente sin modificar `name` ni `deleted_at` (la baja lógica es solo vía TDD-7003).

- Endpoint: `PUT /api/v1/sports/:id`
- Request Body (UpdateSportRequest):

```ts
{
    description?: string | null;
    max_capacity?: number;
    additional_price?: number;
    requires_medical_certificate?: boolean;
}
```

La propiedad `name` no debe enviarse. Si el cliente la incluye (aunque repita el valor actual), el sistema responde con error de validación (tabla siguiente).

### Componentes de Arquitectura Hexagonal

1. **Puerto:** `SportRepository` (métodos `findActiveById` / `findById` excluyendo `deleted_at` seteado, y `update`).
2. **Servicio de dominio (opcional):** `SportValidator` (reutilizar reglas de cupo > 0 y precio >= 0).
3. **Caso de uso:** `UpdateSportUseCase` (comprueba existencia, rechaza `name` en body, aplica merge parcial y persiste).
4. **Adaptador de salida:** `PostgresSportRepository` (actualización con Prisma sin tocar `name`).
5. **Adaptador de entrada:** `SportController` (extrae `id` de la URL, mapea excepciones a códigos HTTP).

## Casos de Borde y Errores


| Escenario                                           | Resultado esperado                                    | Código HTTP               |
| --------------------------------------------------- | ----------------------------------------------------- | ------------------------- |
| Deporte inexistente o dado de baja lógica           | Mensaje: "No existe un deporte con ese ID"            | 404 Not Found             |
| Cuerpo incluye `name`                               | Mensaje: "El nombre del deporte no puede modificarse" | 400 Bad Request           |
| `max_capacity` menor o igual a cero cuando se envía | Mensaje: "El cupo máximo debe ser mayor a cero"       | 400 Bad Request           |
| `additional_price` negativo cuando se envía         | Mensaje: "El precio adicional no puede ser negativo"  | 400 Bad Request           |
| Ningún campo actualizable enviado                   | Mensaje: "No hay datos para actualizar"               | 400 Bad Request           |
| `id` con formato inválido                           | Mensaje de validación acorde                          | 400 Bad Request           |
| Error de conexión a DB                              | Mensaje: "Error interno, reintente más tarde"         | 500 Internal Server Error |


## Plan de Implementación

1. Definir `UpdateSportRequest` en `@alentapp/shared`.
2. Ampliar `SportRepository` y `PostgresSportRepository` con `update` (solo columnas permitidas).
3. Implementar `UpdateSportUseCase` reutilizando validaciones del dominio donde existan.
4. Crear ruta `PUT /api/v1/sports/:id` en `SportController` y registrarla en `app.ts`.
5. Consumir el endpoint desde el servicio del frontend y reutilizar o adaptar el formulario de alta para edición.

