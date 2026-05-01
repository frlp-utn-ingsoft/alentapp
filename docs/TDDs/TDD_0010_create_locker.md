---
id: 0010
estado: Propuesto
autor: Jesus Vergara
fecha: 2026-04-30
titulo: Crear Casillero
---

# TDD-0010: Crear Casillero

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre un nuevo casillero en el sistema del club, garantizando que el número de casillero sea único y que el estado inicial sea válido.

### User Persona

- **Nombre**: Administrativo del club.
- **Necesidad**: Registrar nuevos casilleros de forma digital para poder asignarlos a socios posteriormente. Necesita que el sistema le impida cargar un número de casillero ya existente, ya que un duplicado generaría conflictos en la gestión del vestuario.

### Criterios de Aceptación

- El sistema debe validar que el campo `number` sea único. Si ya existe un casillero con ese número, debe rechazar la operación con un error claro.
- El campo `status` por defecto debe ser `Available`.
- El campo `member_id` debe quedar en `null` al momento de la creación.
- Al finalizar con éxito, el sistema debe retornar el casillero creado con su `id` generado.

---

## Diseño Técnico (RFC)

### Modelo de Datos

Se define la entidad `Locker` en `packages/api/prisma/schema.prisma`:

- `id`: String, UUID generado automáticamente.
- `number`: Int, número del casillero. Único. Requerido.
- `location`: String, ubicación del casillero. Requerido.
- `status`: String, estado del casillero. Valores posibles: `Available`, `Occupied`, `Maintenance`. Default `Available`.
- `member_id`: String, clave foránea que referencia a `Member`. Nullable.

```prisma
model Locker {
    id        String  @id @default(uuid())
    number    Int     @unique
    location  String
    status    String  @default("Available")
    member_id String?
    member    Member? @relation(fields: [member_id], references: [id])

    @@map("lockers")
}
```

> También se debe agregar la relación inversa en el modelo `Member`:
> ```prisma
> lockers Locker[]
> ```

La migración se genera con:
```bash
cd packages/api
npx prisma migrate dev --name create_lockers_table
```

### Contrato de API (@alentapp/shared)

- **Endpoint**: `POST /api/v1/lockers`
- **Request Body** (`CreateLockerRequest`):

```ts
{
    number: number;
    location: string;
    status?: "Available" | "Occupied" | "Maintenance";
}
```

- **Response** (`LockerResponse`):

```ts
{
    id: string;
    number: number;
    location: string;
    status: string;
    member_id: string | null;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**:
  - Entidad `Locker` con sus campos y tipos.
  - Puerto `LockerRepository` (interface) con método `create`.
  - Regla de negocio: unicidad del campo `number`.

- **Application**:
  - `CreateLockerUseCase`: verifica que no exista un casillero con el mismo `number` via `LockerRepository`, y persiste via `LockerRepository.create`.

- **Infrastructure**:
  - `PostgresLockerRepository`: implementación de `LockerRepository` usando Prisma.
  - `LockerController`: registra la ruta `POST /api/v1/lockers` en Fastify y delega al caso de uso.

---

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| `number` duplicado | Error: "Ya existe un casillero con ese número" | 409 Conflict |
| Campos requeridos ausentes en el body | Error de validación de schema | 400 Bad Request |
| Error de conexión a la base de datos | Error: "Error interno, reintente más tarde" | 500 Internal Server Error |

---

## Plan de Implementación

1. Agregar modelo `Locker` en `schema.prisma` y relación inversa en `Member`.
2. Ejecutar `npx prisma migrate dev --name create_lockers_table`.
3. Definir `CreateLockerRequest` y `LockerResponse` en `@alentapp/shared`.
4. Crear puerto `LockerRepository` en el Dominio.
5. Implementar `CreateLockerUseCase` en Aplicación.
6. Implementar `PostgresLockerRepository` en Infraestructura.
7. Implementar ruta `POST` en `LockerController`.