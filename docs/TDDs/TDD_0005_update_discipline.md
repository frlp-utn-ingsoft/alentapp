---
id: 0005
estado: Propuesto
autor: Santiago Gonzalez D'Angelo
fecha: 2026-05-01
titulo: Actualización de Sanciones Disciplinarias
---

# TDD-0005: Actualización de Sanciones Disciplinarias

## 1. Contexto de Negocio 

### 1.1. Objetivo

Permitir a los administradores modificar sanciones disciplinarias existentes, corrigiendo errores en el motivo, las fechas o el tipo de suspensión registrado.

### 1.2. User Persona
*   **Rol**: Administrador
*   **Necesidad**: Modificar una sanción ya existente para corregir errores en el ingreso de datos.

### 1.3. Criterios de Aceptación

*   Como administrador, quiero actualizar una sanción existente para corregir o modificar sus datos.
    - Escenario de éxito: "Si el usuario actualiza la sanción con datos válidos, el sistema debe guardar los cambios y notificar al usuario".
    - Escenario de fallo: "Si el usuario ingresa una sanción que no existe, el sistema debe notificar el error al usuario y cancelar la operación".
    - Escenario de fallo: "Si el usuario ingresa una fecha de fin menor o igual a la fecha de inicio, el sistema debe notificar que la fecha de fin debe ser estrictamente posterior a la fecha de inicio y cancelar la operación".
    - Escenario de fallo: "Si el usuario intenta actualizar una sanción eliminada, el sistema debe bloquear la acción y notificar que no se puede modificar una sanción eliminada".
    - Escenario de fallo: "Si el usuario envía una actualización sin campos modificables, el sistema debe bloquear la acción y notificar que debe enviarse al menos un campo para actualizar".
    - Escenario de fallo: "Si el usuario intenta modificar el socio asociado a la sanción, el sistema debe bloquear la acción y notificar que no se permite modificar el socio de una sanción existente".

## 2. Diseño Técnico 

### 2.1. Modelo de Dominio

La entidad de dominio `Discipline` mantiene los mismos campos definidos para el alta. En esta funcionalidad no se permite modificar `member_id`.

*   `id`: Identificador único universal (UUID).
*   `reason`: Cadena de texto, obligatoria.
*   `start_date`: Fecha, obligatoria.
*   `end_date`: Fecha, obligatoria.
*   `is_total_suspension`: Booleano, obligatorio.
*   `deleted_at`: Fecha de eliminación lógica, opcional. Si es `null`, la sanción no fue eliminada.
*   `member_id`: Identificador del socio sancionado, obligatorio.


### 2.2. Contrato de API (@alentapp/shared)

*   **Endpoint**: `PATCH /api/v1/disciplines/:id`
*   **Request Body**:
```
{
    reason: string (opcional);
    start_date: string en formato ISO 8601 datetime, (opcional)
    end_date: string en formato ISO 8601 datetime, (opcional)
    is_total_suspension: boolean (opcional);
}
```
* **Response (Success):** `200 OK`
* **Response Body:** `DisciplineResponseDTO`
```
type DisciplineResponseDTO = {
  id: string;
  reason: string;
  start_date: string; en formato ISO 8601 datetime
  end_date: string; en formato ISO 8601 datetime
  is_total_suspension: boolean;
  deleted_at: string | null; en formato ISO 8601 datetime
  member_id: string;
};

type ErrorResponse = {
  message: string;
};
```

### 2.3. Esquema de Persistencia

```prisma
model Discipline {
  id                  String   @id @default(uuid())
  reason              String
  start_date          DateTime
  end_date            DateTime
  is_total_suspension Boolean
  deleted_at          DateTime?
  member_id           String
  member              Member   @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

*   **Puerto (Domain)**: `DisciplineRepository` con métodos `findById(id)` y `update(id, data)`.
*   **Adaptador de Entrada (Delivery)**: `DisciplineController`, recibe la request HTTP, extrae params y body, y delega al caso de uso.
*   **Adaptador de Salida (Infrastructure)**: `PostgresDisciplineRepository`, implementa los métodos `findById` y `update`.


### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `UpdateDisciplineUseCase`.
1. Recibir el `id` de la sanción a actualizar.
2. Buscar la sanción por `id`.
3. Si no existe o tiene `deleted_at` distinto de null, retornar error.
4. Validar que el body contenga al menos un campo modificable.
5. Validar los datos de entrada.
6. Validar que `reason`, si se envía, no esté vacío ni compuesto solo por espacios.
7. Validar que `is_total_suspension`, si se envía, sea un valor booleano.
8. Si se modifican fechas, verificar que `end_date` sea estrictamente posterior a `start_date`.
9. Validar que `start_date` y `end_date` cumplan con el formato ISO 8601.
10. Mapear el DTO a Entidad de Dominio.
11. Persistir los cambios a través de `DisciplineRepository`.
12. Retornar la sanción actualizada.


## 4. Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Actualización exitosa | La sanción es actualizada correctamente | 200 OK |
| Sanción inexistente     | "La sanción no existe"       | 404 Not Found              |
| Body vacío o sin campos modificables | "Debe enviarse al menos un campo para actualizar" | 400 Bad Request |
| Fecha de fin menor a fecha de inicio | "La fecha de fin debe ser estrictamente posterior a la fecha de inicio" | 400 Bad Request |
| Campos con formato inválido | "Formato de datos inválido" | 400 Bad Request |
| Motivo vacío o compuesto solo por espacios | "El motivo de la sanción es obligatorio" | 400 Bad Request |
| `is_total_suspension` no booleano | "El campo is_total_suspension debe ser booleano" | 400 Bad Request |
| Intento de modificar `member_id` | "No se permite modificar el socio asociado a la sanción" | 400 Bad Request |
| Sanción eliminada | "No se puede modificar una sanción eliminada" | 409 Conflict |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |

## 5. Plan de Implementación

1. Actualizar los tipos en `@alentapp/shared`.
2. Ampliar el puerto `DisciplineRepository` con los métodos `findById(id)` y `update(id, data)`.
3. Implementar el caso de uso `UpdateDisciplineUseCase`, validando fechas y existencia de la sanción.
4. Implementar la actualización en `PostgresDisciplineRepository`.
5. Crear la ruta `PATCH /api/v1/disciplines/:id` en `DisciplineController`.
6. Conectar el formulario de edición con el endpoint del backend.
7. Ejecutar pruebas unitarias del caso de uso y pruebas de integración del endpoint `PATCH`.

## 6. Observaciones Adicionales

* La actualización debe ser parcial: solo los campos enviados en el body deben modificarse.
* No se permite modificar el `member_id` desde este endpoint para evitar reasignar sanciones entre socios.
* No se permite modificar una sanción que ya ha sido eliminada. Atributo `deleted_at` distinto de null.

