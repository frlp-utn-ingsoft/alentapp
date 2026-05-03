---
id: "0031"
estado: Propuesto
autor: Mariano
fecha: 2026-05-02
titulo: Alta de nuevo Locker
---

# TDD-[0031]: Alta de nuevo Locker

## Contexto de Negocio (PRD)

### Objetivo
Permitir registrar un nuevo locker en el sistema.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo).
*   **Necesidad**: A medida que se vayan adquiriendo nuevos lockers, un administrativo del club puede registrarlos en el sistema.

### Criterios de Aceptación
* CA 1 - El sistema debe validar que el numero de locker `number` ingresado no exista previamente en la base de datos.
* CA 2 - El sistema debe validar que el campo `number` sea de tipo entero y estrictamente mayor a 0.
* CA 3 - Si al enviar los datos de creación no se especifica un estado `status`, el locker debe ser creado en estado `Available`.
* CA 4 - Si el usuario especifica un estado `status` al crear el locker, el sistema debe validar que el valor sea únicamente  `Available` o `Maintenance`. Si se envia el estado `Occupied` el sistema debe rechazar la peticion con un error, ya que un locker no puede ser nacer ocupado.
* CA 5 - El sistema debe validar que el campo `location`: sea enviado en la peticion, sea de tipo string y que no se encuentre vacío.
* CA 6 - La creación del locker no debe procesar ni aceptar la vinculación de un socio. El sistema debe forzar que el campo `member_id` se guarde siempre como nulo en la base de datos al momento del alta. La asignación de un locker a un socio `Occupied + member_id` debe manejarse en un caso de uso separado.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`:
*   `id`: uuid, primary key
*   `number`: int, unique, not null
*   `location`: string, not null
*   `status`: Enumeración `LockerStatus`: [`Available`, `Maintenance`, `Occupied`], default value `Available`, not null.
*   `member_id`: uuid, foreign key to `Member`, nullable

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `POST /api/v1/lockers`
*   **Request Body (CreateLockerRequest)**:
```ts
{
    number: number;
    location: string;
    status?: 'Available' | 'Maintenance'; // default 'Available'
}
```

*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Available' | 'Maintenance' | 'Occupied';
    memberId: string | null;
}
```

### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Metodos: 
    * `existsByNumber(number)`
    * `save(data)`
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el número sea mayor a cero, la ubicación no esté vacía y el estado inicial sea válido
*   **Caso de uso**: `CreateLockerUseCase` Orquesta la validación, verifica la unicidad del número y llama al repositorio forzando que `member_id` sea nulo
*   **Adaptador de salida**: `PostgresLockerRepository` Creación en base de datos usando el método *create* de Prisma
*   **Adaptador de entrada**: `LockerController` Ruta HTTP POST, extrae el request body y devuelve la respuesta con su codigo HTTP correspondiente

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Se envia un `number` que ya existe en la BD     | El número de locker ingresado ya se encuentra registrado       | 409 Conflict              |
| Se envia un `number` menor o igual a 0, nulo, o de un tipo de dato incorrecto | El número de locker debe ser un valor entero mayor a cero | 400 Bad Request           |
| Se envia en el body el estado `Occupied` | Estado inválido. Un locker nuevo solo puede crearse como Disponible o En Mantenimiento | 400 Bad Request |
| Se omite el campo `location` o se envia un string vacio `""` | La ubicacion del locker es un campo obligatorio | 400 Bad Request |
| Se envia en el body el campo `member_id` |  El controlador debe ignorar este campo del payload entrante, garantizando que el caso de uso siempre persista el `member_id` como nulo | 201 Created |

## Plan de Implementación
1. Definir `CreateLockerRequest` y `LockerResponse` en el paquete `@alentapp/shared`.
2. Definir el esquema de persistencia para `Locker` en Prisma incluyendo el enum `LockerStatus` y correr la migración.
3. Crear el servicio de dominio `LockerValidator` para validar las reglas de negocio.
4. Crear el puerto `LockerRepository` y su implementación `PostgresLockerRepository`.
5. Implementar `CreateLockerUseCase` forzando `member_id` a null.
6. Crear el endpoint `POST /api/v1/lockers` en el `LockerController` y registrar la ruta en `app.ts`.
7. Agregar el formulario de alta de lockers en el frontend y conectarlo con el endpoint.
8. Agregar test unitarios del caso de uso y test de integración del endpoint.