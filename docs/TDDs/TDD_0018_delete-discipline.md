---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Eliminación de Disciplina
---

# TDD-0018: Eliminación de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo elimine una sanción registrada por error, manteniendo la integridad del historial disciplinario del club.

### User Persona

- **Nombre**: administrativo
- **Necesidad**: Poder borrar una disciplina cargada incorrectamente. Necesita confirmación de que la operación fue exitosa.

### Criterios de Aceptación

- El sistema debe eliminar el registro de disciplina correspondiente al `id` indicado.
- Si la disciplina no existe, el sistema debe retornar un error claro.
- Al finalizar, el sistema debe confirmar la eliminación.

## Diseño Técnico (RFC)

### Modelo de Datos

No se requieren cambios en el modelo. Se utiliza la entidad `Discipline` definida en TDD-0016.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/disciplines/:id`
- **Request Body**: No aplica.
- **Response Body**:

```ts
{
    message: "Disciplina eliminada correctamente";
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `DisciplineRepository` con método `delete`.
- **Application**: Caso de uso `DeleteDiscipline` que verifica existencia del registro y ejecuta la eliminación.
- **Infrastructure**: `DisciplineRepositoryPrisma`, `DisciplineController` con ruta HTTP DELETE.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `id` de disciplina inexistente | Mensaje: "La disciplina no existe" | 404 Not Found |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Agregar método `delete` a `DisciplineRepository` e implementar en `DisciplineRepositoryPrisma`.
2. Implementar caso de uso `DeleteDiscipline`.
3. Agregar ruta `DELETE /api/v1/disciplines/:id` en `DisciplineController`.
