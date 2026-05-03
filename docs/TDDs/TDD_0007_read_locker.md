---
id: 0007
estado: Propuesto
autor: Joaquin Rodriguez
fecha: 2026-04-30
titulo: Consulta de Lockers
---

# TDD-0007: Consulta de Lockers

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos visualizar el listado completo de lockers del club, así como acceder al detalle de un locker específico, para poder gestionar el inventario y las asignaciones a socios desde el panel de administración.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Ver de un vistazo todos los lockers del club, su estado actual y a qué socio están asignados, para tomar decisiones rápidas (asignar uno libre, identificar lockers en mantenimiento, ubicar el locker de un socio puntual). También necesita poder consultar un locker individual para precargar el formulario de edición.

### Criterios de Aceptación

- El sistema debe devolver el listado completo de lockers existentes en la base de datos.
- El sistema debe permitir consultar un locker por su `id`.
- Si el locker solicitado no existe, debe devolver un error claro.
- La respuesta debe incluir todos los atributos del locker, incluido el `miembro_id` (que puede ser `null` si no está asignado).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Se exponen dos endpoints de lectura: uno para el listado completo y otro para el detalle individual.

- **Endpoint (listado)**: `GET /api/v1/lockers`
- **Response 200 OK** (`LockerResponse[]`):

- **Endpoint (detalle)**: `GET /api/v1/lockers/:id`
- **Response 200 OK** (`LockerResponse`):


### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Métodos `findAll()` y `findById(id)`).
2. **Caso de Uso**: `GetLockersUseCase` (Devuelve el listado completo) y `GetLockerByIdUseCase` (Comprueba existencia y devuelve el detalle).
3. **Adaptador de Salida**: `PostgresLockerRepository` (Lectura usando los métodos `findMany` y `findUnique` de Prisma).
4. **Adaptador de Entrada**: `LockerController` (Rutas HTTP que devuelven los resultados serializados).

## Casos de Borde y Errores

| Escenario                                | Resultado Esperado                            | Código HTTP actual        |
| ---------------------------------------- | --------------------------------------------- | ------------------------- |
| Listado sin lockers cargados             | Array vacío `[]`                              | 200 OK                    |
| Consulta exitosa de listado              | Array con todos los lockers                   | 200 OK                    |
| Consulta exitosa por `id`                | Objeto con los datos del locker               | 200 OK                    |
| Locker inexistente al consultar por `id` | Mensaje: "El locker no existe"                | 404 Not Found             |
| Error de conexión a DB                   | Mensaje: error del motor de base de datos     | 500 Internal Server Error |

## Plan de Implementación

1. Ampliar el `LockerRepository` y `PostgresLockerRepository` con los métodos `findAll` y `findById`.
2. Crear la lógica de los casos de uso `GetLockersUseCase` y `GetLockerByIdUseCase`.
3. Crear los endpoints `GET /api/v1/lockers` y `GET /api/v1/lockers/:id` en el `LockerController` y registrarlos en `app.ts`.
4. Añadir los métodos `getAll` y `getById` al servicio Frontend (`lockers.ts`).
5. Conectar la tabla principal en `LockersView.tsx` para que consuma `getAll` al montarse y al refrescar después de cada operación de ABM.