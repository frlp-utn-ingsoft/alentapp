---
id: 0018
estado: Propuesto
autor: Facundo Devida
fecha: 2026-05-02
titulo: Eliminacion de Prestamo de equipamiento
---

# TDD-0018: Eliminacion de Prestamo de equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir la anulación o baja lógica de un registro de préstamo para mantener la limpieza del sistema frente a errores de carga garantizando al mismo tiempo que no se pierda la trazabilidad histórica y de auditoría.

### User Persona

- **Nombre**: Administrativo
- **Necesidad**: Poder dar de baja rápidamente préstamos que fueron cargados por duplicado, asignados al socio equivocado por error de tipeo, o cancelados por el socio antes de retirar físicamente el material. El administrativo necesita que esta eliminación sea segura (lógica) para evitar la pérdida permanente de información en caso de un clic accidental.

### Criterios de Aceptación

- Si se intenta eliminar un prestamo que no existe en el sistema o que ya fue eliminado logicamente, el sistema debe devolver un error indicando que el recurso no fue encontrado
- Al ejecutar la eliminacion el sistema no debe borrar fisicamente el registo de la base de datos, sino que debe registrar la fecha y hora de la operacion en el campo `deleted_at`.
- Una vez que un préstamo ha sido dado de baja (posee un valor en `deleted_at`), el sistema debe ocultarlo de los listados generales y bloquear cualquier intento de actualización
- Al finalizar, el sistema debe mostrar un mensaje de exito confirmando la baja logica.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/equipment-loans/:id`
- **Request Body**:`none`

### Componentes de Arquitectura Hexagonal

- **Domain**:
    - La estructura de la entidad `EquipmentLoan` y el Value Object `EquipmentLoanStatus` son idénticos a los definidos en el documento base de creación.
    - Comportamiento: La entidad `EquipmentLoan` es responsable de gestionar su propia baja. Posee un comportamiento interno que asienta la fecha actual en `deleted_at` y valida que no se pueda eliminar si ya estaba eliminado.
- **Application**:
    - Caso de Uso: `DeleteEquipmentLoan` (Busca el prestamo validando su existencia, delega a la entidad el cambio del campo `deleted_at` de `null` a la fecha de eliminacion y persiste la entidad modificada utilizando `EquipmentLoanRepository`)
    - Puertos de Salida: `EquipmentLoanRepository` (Interface de dominio, de la cual necesitamos el metodo `findById()` y `update()` para registrar la fecha y hora de la eliminacion)
- **Infrastructure**:
    - Adaptadores de entrada: `EquipmentLoanController` utilizando su ruta `DELETE /api/v1/equipment-loans/:id`
    - Adaptadores de salida: DB persistence adapter (Se reutiliza la implementacion definida en el Alta)

## Casos de Borde y Errores

| **Escenario** | **Resultado Esperado** | **Código HTTP** |
| --- | --- | --- |
| **Préstamo inexistente (ID no existe)** | Mensaje: "El préstamo que intenta eliminar no se encuentra registrado." | 404 Not Found |
| **Préstamo ya eliminado previamente** | Mensaje: "El préstamo que intenta eliminar no se encuentra registrado." | 404 Not Found |
| **Formato de ID inválido** | Mensaje: "El formato del ID provisto en la URL no es válido." | 400 Bad Request |
| **Error de conexión a DB** | Mensaje: "Error interno del servidor al procesar la baja, reintente más tarde." | 500 Internal Server Error |

## Plan de Implementación

1. Crear el método interno dentro de la entidad, el cual se encargará de asignar la fecha/hora actual y validar internamente que el registro no haya sido eliminado previamente.
2. Desarrollar el `DeleteEquipmentLoan`
3. Modificar las consultas de lectura en el `PostgresEquipmentLoanRepository` (como `findById`) para que siempre agreguen el filtro que excluye los registros eliminados.
4. Agregar el endpoint `DELETE /api/v1/equipment-loans/:id` en el `EquipmentLoanController`.