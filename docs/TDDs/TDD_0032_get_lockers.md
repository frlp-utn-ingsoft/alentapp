---
id: "0032"
estado: Propuesto
autor: Mariano
fecha: 2026-05-02
titulo: Listado de lockers
---


# TDD-0032: Listado de lockers


## Contexto de Negocio (PRD)


### Objetivo
Permitir consultar el listado completo de lockers del club, conociendo su estado actual y, en caso de estar ocupados, los datos básicos del socio asignado.


### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo) o Recepcionista
*   **Necesidad**: Visualizar rápidamente que casilleros están libres para ofrecerlos a los socios, o consultar quien es el dueño actual de un casillero especifico.


### Criterios de Aceptación
*   CA 1 - El sistema debe retornar un arreglo con todos los lockers registrados en la base de datos
*   CA 2 - Si un locker se encuentra en estado `Occupied`, el sistema debe adjuntar los datos básicos del socio que lo tiene asignado.
*   CA 3 - El sistema debe permitir filtrar el listado por estado (mediante un query param por ejemplo `?status=Available`). Si el estado enviado no es válido, debe ignorarse o retornar error.
*   CA 4 - Si no hay lockers registrados, el sistema debe retornar un arreglo vacío, no un error.


## Diseño Técnico (RFC)


### Modelo de Datos
No hay cambios ni agregados en el esquema de la base de datos para este caso de uso. El sistema consultará la entidad `Locker` existente y utilizará la relación `member` (Foreign Key `member_id`) para obtener los datos del socio asignado, en caso de tenerlo.


### Contrato de API (@alentapp/shared)
*   **Endpoint**: `GET /api/v1/lockers`
*   **Query Parameters (Opcional)**: `?status=Available|Maintenance|Occupied`
*   **Response Body (LockerListResponse)**:
```ts
{
    export type LockerItemResponse = {
        id: string;
        number: number;
        location: string;
        status: LockerStatus; // Available | Maintenance | Occupied
        member: Member | null;
    }


    export type LockerListResponse = LockerItemResponse[];
}
```


### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Método `findAll(status?:LockerStatus)`.
*   **Caso de uso**: `GetLockersUseCase` Recibe el filtro opcional, orquesta la llamada al repositorio y formatea la salida.
*   **Adaptador de salida**: `PostgresLockerRepository` Consulta a la base de datos usando el método `findMany` de Prisma, utilizando `include: { member: true }` para hacer el JOIN.
*   **Adaptador de entrada**: `LockerController` Ruta HTTP GET que extrae el query param, llama al caso de uso y devuelve el array con código 200.


## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Se envía un query parameter `status` con un valor inválido (ej. `?status=Roto)`     | El sistema rechaza la petición indicando que el filtro no es válido       | 400 Bad Request              |
| La base de datos no tiene ningún locker registrado| El sistema devuelve una lista vacía `[]` sin lanzar error              | 200 OK           |


## Plan de Implementación
1. Definir los tipos `LockerItemResponse` y `LockerListResponse` en `@alentapp/shared`.


2. Actualizar el puerto `LockerRepository` agregando la firma del método `findAll(status?: LockerStatus)`.


3. Implementar la consulta en `PostgresLockerRepository` utilizando `prisma.locker.findMany` incluyendo la relación del socio.


4. Implementar `GetLockersUseCase` para procesar y mapear la lista.


5. Crear el endpoint `GET /api/v1/lockers` en el `LockerController`.


6. Agregar la vista de listado en el Frontend (React) que consuma este endpoint y muestre una tabla o grilla.


7. Escribir test unitarios para el caso de uso y test de integración para el endpoint GET verificando el funcionamiento del filtro.
