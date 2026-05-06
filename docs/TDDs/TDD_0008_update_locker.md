---
id: 0008
estado: pendiente
autor: Cesar Huari
fecha: 2026-05-01
titulo: Actualizacion de locker existentes
---

# TDD-0008: Actualizacion de locker existentes

## Contexto de Negocio (PRD)

### Objetivo
Permitir a los administrativos corregir o modificar la información de un locker  existente en el sistema, como su estado o locacion.


### User Persona
- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Modificar datos de los locker rápidamente desde la tabla del panel de administración. Por ejemplo, actualizar estado de un locker en mantenimiento  pasando a un estado "maintenance"o de Occupied a Available


### Criterios de Aceptación
- El sistema debe permitir actualizar uno, varios o todos los campos del locker.
- El sistema debe validar que, si se cambia el numero, este no pertenezca ya a otro locker.
- El sistema debe validar que el numero sea mayor a cero en caso de que este sea modificado.
- El sistema no debe permitir que se asigne un socio si el status del casillero es Maintenance.
- El sistema debe validar que exista un casillero con esa id.
- Si la edición es correcta, debe retornar los nuevos datos del locker actualizados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/locker/:id`
- Request Body (`UpdateLockerRequest`):

```ts
{
    number?: number;
    location?: string;
    status?: `Available`,`Occupied`,`Maintenance`;
    location?: string;
    member_id?: member_id;
}
```
### Componentes de Arquitectura Hexagonal
1.Domain: Entidad `Locker` con regla de negocio que impide que se dupliquen los numeros.
2.Application: caso de uso `UpdateLockerCaseUse` encargado de verificar existencia y aplicar las validaciones antes de actualizar.
3.Puerto: `LockerRepository`, con metodos `findbyid(id)` y `update(id,data)`.
4.Infraestructura: `PostgresLockerRespository`, encargado de actualizar los campos en base de datos.
5.Adaptador de Entrada: `LockerController`,encargado de extraer el `id` de la url y mapear execipciones a codigos http.
6.Frontend: modal o formulario de edicion que permita modificar los campos de la entidad 


## Casos de Borde y Errores
| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| locker inexistente.        | Mensaje: "El locker no existe"                | 400 Bad Request           |
| numero de locker ya creado.| Mensaje: "Ya existe un locker con ese numero" | 409 Conflict              |
| Modificar member_id a casillero con status Maintenance.| Mensaje: "No se puede asignar un casillero en mantenimiento" | 409 Conflict              |
| Error de conexión a DB.    | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación
1.Definir el tipo `UpdateLockerRequest` en `@alentapp/shared`.
2.Ampliar el `LockerRepository`con los metodos `findById` y `update`.
3.Implementar `UpdateLockerUseCase` validando la existencia del Locker.
4.crear el endpoint `PUT /api/v1/locker/:id` en `LockerController`.
5.implementar el metodo de actualizacion en el servicio frontend de locker.
6.Reutilizar formulario  de edicion que muestre como mensaje que no se podra modificar el estado a mantenimiento  de un locker si ya esta reservado.
