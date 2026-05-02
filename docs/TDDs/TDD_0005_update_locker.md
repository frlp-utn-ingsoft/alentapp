---
id: 0005
estado: Propuesto
autor: Joaquin Rodriguez
fecha: 2026-04-30
titulo: Actualización de Lockers Existentes
---

# TDD-0005: Actualización de Lockers Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos corregir o modificar la información de un locker existente en el sistema, como su estado, locacion o id de socio.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Modificar datos de los lockers rápidamente desde la tabla del panel de administración. Por ejemplo, actualizar a un socio que alquilo el locker y asignandole a ese locker el id del socio, o cambiar el estado del locker a Mantenimiento.

### Criterios de Aceptación

- El sistema debe permitir actualizar uno, varios o todos los campos del locker.
- El sistema debe validar que, si se cambia el numero, este no pertenezca ya a otro locker.
- El sistema debe validar que el estado no sea 'Mantenimiento' cuando se quiere modificar un miembro_id.
- Si la edición es correcta, debe retornar los nuevos datos del locker  actualizados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido para definir el cuerpo de la petición. Todos los campos son opcionales ya que se trata de una actualización parcial (PATCH a nivel de negocio, aunque el endpoint implemente PUT).

- Endpoint: `PUT /api/v1/lockers/:id`
- Request Body (UpdateLockerRequest):

```ts
{
    numero?: number;
    locacion?: string;
    estado?: 'Disponible' | 'Ocupado' | 'Mantenimiento'
    miembro_id?: string | null;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `LockerValidator` (Encargado de reutilizar validaciones de number y si el estado es 'Mantenimiento' y se quiere agregar un miembro).
3. **Caso de Uso**: `UpdateLockerUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresLockerRepository` (Actualización usando el método `update` de Prisma).
5. **Adaptador de Entrada**: `LockerController` (Ruta HTTP que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                                         | Resultado Esperado                                                  | Código HTTP               |
| ------------------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| Locker inexistente (`id` no encontrado)           | Mensaje: "El locker solicitado no existe"                           | 404 Not Found             |
| `numero` ya pertenece a otro locker               | Mensaje: "Ya existe un locker con ese número"                       | 409 Conflict              |
| Asignar `miembro_id` a un locker en "Mantenimiento" | Mensaje: "No se puede asignar un socio a un locker en mantenimiento" | 409 Conflict           |
| Body sin ningún campo válido                      | Mensaje: "Debe enviar al menos un campo a actualizar"               | 400 Bad Request           |
| Error de conexión a DB                            | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar las interfaces en el paquete `@alentapp/shared` agregando `UpdateLockerRequest`.
2. Ampliar el `LockerRepository` con el método `update`.
3. Implementar la lógica en `UpdateLockerUseCase` utilizando el `LockerValidator` centralizado.
4. Crear la ruta `PUT /api/v1/lockers/:id` en el controlador y enlazarla a la aplicación.
5. Consumir el endpoint desde el frontend y reutilizar el modal de creación para permitir la edición.