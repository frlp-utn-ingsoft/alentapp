---
id: 0054
estado: Propuesto
autor: Tomas
fecha: 2026-05-01
titulo: Consulta de Sanciones Disciplinarias
---

# TDD-0054: Consulta de Sanciones Disciplinarias

## Contexto de Negocio (PRD)

### Objetivo

Permitir consultar sanciones disciplinarias y determinar si un socio se encuentra actualmente suspendido.

Este TDD cubre la necesidad del sistema de responder si una sancion esta activa al momento de la consulta. Una sancion se considera activa cuando la fecha actual esta dentro del periodo de vigencia.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Consultar el historial disciplinario de un socio y saber si tiene una suspension total activa antes de permitir acciones sensibles como inscripciones o ingreso al club.

### Criterios de Aceptación

- El sistema debe permitir consultar una sancion por su identificador.
- El sistema debe permitir consultar todas las sanciones de un socio.
- El sistema debe validar que el socio exista antes de consultar sus sanciones.
- El sistema debe indicar si el socio tiene una suspension total activa.
- Una suspension se considera activa si `startDate <= now && now < endDate`.
- Si el socio no tiene suspension total activa, debe devolver `isSuspended = false`.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `GET /api/v1/disciplines/:id`
- Response (`DisciplineResponse`):

```ts
{
    id: string;
    reason: string;
    startDate: string;
    endDate: string;
    isTotalSuspension: boolean;
    memberId: string;
}
```

- Endpoint: `GET /api/v1/members/:memberId/disciplines`
- Response:

```ts
DisciplineResponse[]
```

- Endpoint: `GET /api/v1/members/:memberId/discipline-status`
- Response (`MemberDisciplineStatusResponse`):

```ts
{
    memberId: string;
    isSuspended: boolean;
    activeTotalSuspension?: DisciplineResponse;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Metodos `findById(id)`, `findByMemberId(memberId)` y `findActiveTotalSuspensionByMemberId(memberId, at)`).
2. **Puerto**: `MemberRepository` (Metodo `findById(id)` para validar la existencia del socio).
3. **Caso de Uso**: `GetDisciplineUseCase` (Consulta una sancion por ID).
4. **Caso de Uso**: `ListMemberDisciplinesUseCase` (Consulta sanciones asociadas a un socio).
5. **Caso de Uso**: `GetMemberDisciplineStatusUseCase` (Determina si hay suspension total activa).
6. **Adaptador de Salida**: `PostgresDisciplineRepository` (Consultas usando Prisma).
7. **Adaptador de Entrada**: `DisciplineController` (Rutas HTTP de consulta).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                             | Código HTTP actual        |
| -------------------------- | ---------------------------------------------- | ------------------------- |
| ID invalido                | Mensaje: "El id informado no es valido"       | 400 Bad Request           |
| Sancion inexistente        | Mensaje: "La sancion no existe"               | 404 Not Found             |
| Socio inexistente          | Mensaje: "El socio especificado no existe"    | 404 Not Found             |
| Socio sin sanciones        | Lista vacia                                    | 200 OK                    |
| Sin suspension activa      | `isSuspended: false`                           | 200 OK                    |
| Suspension total activa    | `isSuspended: true` y sancion activa asociada  | 200 OK                    |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Definir `DisciplineResponse` y `MemberDisciplineStatusResponse` en `@alentapp/shared`.
2. Ampliar `DisciplineRepository` con los metodos de consulta necesarios.
3. Implementar `GetDisciplineUseCase`.
4. Implementar `ListMemberDisciplinesUseCase`.
5. Implementar `GetMemberDisciplineStatusUseCase`.
6. Implementar las consultas en `PostgresDisciplineRepository`.
7. Crear los endpoints `GET /api/v1/disciplines/:id`, `GET /api/v1/members/:memberId/disciplines` y `GET /api/v1/members/:memberId/discipline-status`.
8. Agregar la vista o seccion de consulta de sanciones en el Frontend.
9. Agregar tests unitarios de los casos de uso y tests de integracion de los endpoints.
