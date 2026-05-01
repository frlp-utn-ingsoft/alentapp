---
id: 0015
estado: Pendiente
autor: [Tu Nombre]
fecha: 2026-04-30
titulo: Eliminación de Deportes Existentes
---

# TDD-0015: Eliminación de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos eliminar permanentemente un deporte del sistema cuando este deja de ser ofrecido por el club, manteniendo el catálogo de actividades limpio y actualizado.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Dar de baja un deporte que fue cargado por error o que el club dejó de ofrecer. Necesita una advertencia antes de confirmar el borrado para evitar eliminaciones accidentales, ya que la operación es irreversible.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita (advertencia visual) antes de proceder con el borrado.
- El sistema debe validar que el deporte exista antes de intentar eliminarlo.
- El sistema debe realizar un borrado físico del registro en la base de datos (hard delete).
- Si el borrado es exitoso, la tabla del panel de administración debe actualizarse automáticamente.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere el identificador del recurso, no se envía cuerpo en la petición HTTP.

- **Endpoint**: `DELETE /api/v1/sports/:id`
- **Request Body**: `None`
- **Response**: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `SportRepository` extendida con método `delete(id)`. Reutiliza `findById(id)` ya definido en TDD-0005 para verificar existencia previa.
- **Application**: Caso de uso `DeleteSportUseCase`. Verifica existencia del deporte via `findById` y lanza excepción de dominio si no existe. Delega la eliminación al repositorio.
- **Infrastructure**: `PostgresSportRepository` (implementación del método `delete` usando el método `delete` de Prisma). `SportController` (ruta HTTP `DELETE /api/v1/sports/:id` que extrae el `id` de la URL y retorna un status `204 No Content`).

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                        | Código HTTP actual        |
| -------------------------------- | --------------------------------------------------------- | ------------------------- |
| Deporte inexistente              | Mensaje: "El deporte no existe"                           | 404 Not Found             |
| Eliminación exitosa              | Respuesta vacía                                           | 204 No Content            |
| Error de conexión a DB           | Mensaje: error del motor de base de datos                 | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar la interfaz `SportRepository` en el Dominio con el método `delete(id)`.
2. Implementar el método `delete` en `PostgresSportRepository` usando Prisma.
3. Crear la lógica de negocio en `DeleteSportUseCase` con verificación de existencia previa.
4. Crear el endpoint `DELETE /api/v1/sports/:id` en `SportController` y registrarlo en `app.ts`.
5. Añadir el método `deleteSport` al servicio del Frontend (`sports.ts`).
6. Enlazar el botón de eliminación en la vista de administración (`SportsView.tsx`) agregando confirmación (`window.confirm`) antes de ejecutar la llamada al backend.
