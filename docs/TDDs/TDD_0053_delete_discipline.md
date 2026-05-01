---
id: 0053
estado: Propuesto
autor: Tomas
fecha: 2026-05-01
titulo: Eliminacion de Sancion Disciplinaria
---

# TDD-0053: Eliminacion de Sancion Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir eliminar una sancion disciplinaria cargada por error. La baja evita que una sancion incorrecta afecte al socio en consultas, inscripciones o controles de acceso.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Eliminar una sancion cargada por equivocacion para que no impacte injustamente en el estado disciplinario del socio.

### Criterios de Aceptación

- El sistema debe pedir una confirmacion antes de eliminar la sancion.
- El sistema debe validar que la sancion exista antes de intentar eliminarla.
- El sistema debe realizar un borrado fisico de la base de datos.
- Si el borrado es exitoso, debe responder `204 No Content`.
- Si la sancion no existe, debe responder con error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operacion destructiva que solo requiere conocer el identificador, no se envia cuerpo en la peticion HTTP.

- Endpoint: `DELETE /api/v1/disciplines/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de exito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Metodos `findById(id)` y `delete(id)`).
2. **Caso de Uso**: `DeleteDisciplineUseCase` (Comprueba existencia previa y delega la eliminacion).
3. **Adaptador de Salida**: `PostgresDisciplineRepository` (Eliminacion usando Prisma).
4. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP que extrae el `id` y devuelve status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                             | Código HTTP actual        |
| -------------------------- | ---------------------------------------------- | ------------------------- |
| ID invalido                | Mensaje: "El id de la sancion no es valido"   | 400 Bad Request           |
| Sancion inexistente        | Mensaje: "La sancion no existe"               | 404 Not Found             |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |
| Eliminacion exitosa        | Respuesta vacia                                | 204 No Content            |

## Plan de Implementación

1. Ampliar `DisciplineRepository` y `PostgresDisciplineRepository` con el metodo `delete`.
2. Crear la logica de negocio en `DeleteDisciplineUseCase`.
3. Crear el endpoint `DELETE /api/v1/disciplines/:id` en el `DisciplineController`.
4. Registrar la ruta en `app.ts`.
5. Agregar el metodo `delete` al servicio Frontend de sanciones.
6. Enlazar el boton de eliminacion en la vista correspondiente con confirmacion previa.
7. Agregar tests unitarios del caso de uso y tests de integracion del endpoint.
