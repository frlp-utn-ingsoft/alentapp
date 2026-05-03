---
id: 0011
estado: Propuesto
autor: Juan Ignacio Piazza
fecha: 2026-05-03
titulo: Actualización de Deportes Existentes
---

# TDD-0011: Actualización de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos corregir o modificar la descripción y/o cupo máximo de un deporte existente en el sistema, en caso que hayan cambiado o se hayan ingresado incorrectamente.

### User Persona

- Nombre: Jorge (Administrativo).
- Necesidad: Modificar datos de los deportes rápidamente desde la tabla del panel de administración. Por ejemplo, actualizar la descripción o corregir el cupo máximo de un deporte mal tipeado.

### Criterios de Aceptación

- Como administrativo quiero poder editar la descripción y/o cupo máximo de los deportes ofrecidos por el club.
- El sistema no debe permitir editar el nombre, precio adicional o requerimiento de certificado médico de un deporte una vez creado.

### Escenario de Exito

- Si el usuario edita el deporte con los datos válidos, el sistema debe actualizarlo correctamente e informar al usuario mediante un mensaje de exito.

### Escenario de Fallo

- Si el usuario ingresa un valor menor o igual a cero en el cupo máximo o una descripción vacía, el sistema debe rechazar la modificación e informarlo mediante un mensaje de error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/sports/:id`
- Request Body (UpdateSportRequest):

```ts
{
    description?: string;
    max_capacity?: number;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `SportValidator`
3. **Caso de Uso**: `UpdateSportUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresSportRepository` (Actualización usando el método `update` de Prisma).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Deporte inexistente        | Mensaje: "El deporte no existe"               | 400 Bad Request           |
| Descripción vacía          | Mensaje: "Descripción de deporte inválida"    | 400 Bad Request        |
| Capacidad máxima menor o igual a cero | Mensaje: "Capacidad máxima inválida"| 400 Bad Request        |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar las interfaces en el paquete `@alentapp/shared` (`UpdateSportRequest`).
2. Ampliar el `SportRepository` con el método `update`.
3. Implementar la lógica en `UpdateSportUseCase` utilizando el `SportValidator` centralizado.
4. Crear la ruta `PUT` en el controlador y enlazarla a la app de Fastify.
5. Consumir el endpoint desde el servicio de Frontend y reutilizar el modal de creación para permitir la edición.
