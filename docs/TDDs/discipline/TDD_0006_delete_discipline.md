---
id: 0006
estado: Propuesto
autor: Santiago Gonzalez D'Angelo
fecha: 2026-05-01
titulo: Eliminación de Sanciones Disciplinarias
---

# TDD-0006: Eliminación de Sanciones Disciplinarias

## 1. Contexto de Negocio 

### 1.1. Objetivo

Permitir a los administradores eliminar sanciones disciplinarias, manteniendo actualizada la información disciplinaria de los socios del club.

### 1.2. User Persona
*   **Rol**: Administrador
*   **Necesidad**: Eliminar una sanción disciplinaria creada por error, liberando al socio para participar de actividades en el club.

### 1.3. Criterios de Aceptación

*   Como administrador, quiero eliminar una sanción para no suspender incorrectamente a un socio.
    - Escenario de éxito: "Si el usuario elimina una sanción existente, el sistema debe marcarla como eliminada y notificar al usuario".
    - Escenario de fallo: "Si el usuario intenta eliminar una sanción inexistente, el sistema debe cancelar la acción y notificar al usuario".
    - Escenario de fallo: "Si ocurre un error de conexión con la base de datos, el sistema debe informar un error interno".

## 2. Diseño Técnico 

### 2.1. Modelo de Dominio

La entidad de dominio `Discipline` mantiene los mismos campos definidos para el alta.

*   `id`: Identificador único universal (UUID).
*   `reason`: Cadena de texto, obligatoria.
*   `start_date`: Fecha, obligatoria.
*   `end_date`: Fecha, obligatoria.
*   `is_total_suspension`: Booleano, obligatorio.
*   `deleted_at`: Fecha de eliminación lógica, opcional. Si es `null`, la sanción está activa en el sistema.
*   `member_id`: Identificador del socio sancionado, obligatorio.


### 2.2. Contrato de API (@alentapp/shared)

*   **Endpoint**: `DELETE /api/v1/disciplines/:id`
*   **Request Body**: No aplica.


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

*   **Puerto (Domain)**: `DisciplineRepository` con métodos `findById(id)` y `softDelete(id)`.
*   **Adaptador de Entrada (Delivery)**: `DisciplineController`, recibe el parámetro `id` desde la URL y delega al caso de uso.
*   **Adaptador de Salida (Infrastructure)**: `PostgresDisciplineRepository`, implementa los métodos `findById` y `softDelete`.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `DeleteDisciplineUseCase`.

1. Recibir el `id` de la sanción a eliminar.
2. Buscar la sanción por `id`.
3. Notificar el error en caso de que no exista una sanción con ese id.
4. Marcar la sanción como eliminada, asignando la fecha actual a `deleted_at`.
5. Retornar respuesta de éxito vacía.

## 4. Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Sanción inexistente     | "La sanción no existe"       | 404 Not Found              |
| ID con formato inválido | "Formato de ID inválido" | 400 Bad Request |
| Sanción ya eliminada | "La sanción ya fue eliminada" | 409 Conflict |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |

## 5. Plan de Implementación

1. Ampliar el puerto `DisciplineRepository` con los métodos `findById(id)` y `softDelete(id)`.
2. Implementar el caso de uso `DeleteDisciplineUseCase`.
3. Implementar la eliminación lógica en `PostgresDisciplineRepository`.
4. Crear la ruta `DELETE /api/v1/disciplines/:id` en `DisciplineController`.
5. Conectar la funcionalidad en el frontend agregando confirmación previa a la eliminación.

## 6. Observaciones Adicionales

* Antes de eliminar, el frontend debería mostrar una confirmación al usuario para evitar borrados accidentales.
* Esta operación realiza un borrado lógico: la sanción no se elimina físicamente de la base de datos, sino que se marca con `deleted_at`.
* `deleted_at`: Fecha de eliminación lógica, opcional. Si es `null`, la sanción está activa en el sistema. Cuando se asigna, se guarda como `DateTime` en formato ISO 8601 datetime.
* Las operaciones sobre sanciones deben verse reflejadas en el estado disciplinario del socio.
* El estado del socio debe recalcularse en función de las sanciones activas.