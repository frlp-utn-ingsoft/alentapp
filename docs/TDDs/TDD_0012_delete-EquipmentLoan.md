---
id: 0012
estado: En revisión
autor: Juan Bautista Flores
fecha: 2026-05-03
titulo: Eliminación de Préstamos de Equipamiento
---

# TDD-0012: Eliminación de Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir al personal encargado del pañol dar de baja permanentemente un registro de préstamo del sistema, eliminándolo de la base de datos para mantener el historial de utilería libre de registros duplicados o cargados por error humano.

### User Persona

- Nombre: Martin (Encargado de Pañol / Utilería).
- Necesidad: Borrar un préstamo que fue cargado por error (por ejemplo, si le asignó el material al socio equivocado) de forma rápida desde la tabla principal. Necesita una advertencia antes de borrar para no cometer equivocaciones irreversibles y perder el rastro del equipamiento.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita (advertencia visual) antes de proceder con el borrado.
- El sistema debe validar que el registro del préstamo exista antes de intentar borrarlo.
- El sistema debe realizar un borrado físico de la base de datos (hard delete).
- Si el borrado es exitoso, la tabla de gestión de préstamos debe actualizarse automáticamente.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/equipment-loans/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Método `delete(id)`).
2. **Caso de Uso**: `DeleteEquipmentLoanUseCase` (Comprueba existencia previa vía `findById` y delega la eliminación).
3. **Adaptador de Salida**: `PostgresEquipmentLoanRepository` (Eliminación usando el método `delete` del ORM configurado, como Prisma).
4. **Adaptador de Entrada**: `EquipmentLoanController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Préstamo inexistente       | Mensaje: "El préstamo referenciado no existe" | 404 Not Found             |
| Error de conexión a DB     | Mensaje: error del motor de base de datos     | 500 Internal Server Error |
| Eliminación exitosa        | Respuesta vacía                               | 204 No Content            |

## Plan de Implementación

1. Ampliar el `EquipmentLoanRepository` y el adaptador de base de datos con el método `delete`.
2. Crear la lógica de negocio en `DeleteEquipmentLoanUseCase` asegurando que el préstamo exista antes de intentar el borrado.
3. Crear el endpoint `DELETE /api/v1/equipment-loans/:id` en el `EquipmentLoanController` y registrar la ruta.
4. Añadir el método `delete` al servicio correspondiente en el Frontend.
5. Enlazar el botón de eliminación en la vista de inventario/préstamos agregando la confirmación del navegador (`window.confirm`) antes de hacer la llamada.