---
id: 0007
estado: Propuesto
autor: Franco Jimenez
fecha: 2026-05-01
titulo: Registro de Nuevos Casilleros
---

# TDD-0007: Registro de Nuevos Casilleros

## Contexto de Negocio (PRD)

### Objetivo

Reemplazar la carga manual de casilleros en planillas y permitir que un administrativo dé de alta un casillero de forma digital. El sistema valida que el número no se repita y que no se asigne un casillero fuera de servicio a un socio.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Cargar nuevos casilleros al inventario cuando se habilitan vestuarios o se reemplazan los existentes. No puede permitirse números duplicados ni asignar un casillero que está en mantenimiento.

### Criterios de Aceptación

- El sistema debe validar que el `number` sea un entero positivo y único.
- El sistema no debe permitir crear un casillero asignado a un socio (`member_id`) cuando su `status` sea "Maintenance".
- El sistema debe validar que el `member_id`, en caso de enviarse, corresponda a un socio existente.
- Al crearlo sin `member_id`, el `status` por defecto debe ser "Available".
- Al crearlo con `member_id` y sin `status` explícito, el `status` resultante debe ser "Occupied".
- Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Locker` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `number`: Entero, único e indexado.
- `location`: Cadena de texto (ej. "Vestuario A - Pasillo 1").
- `status`: Enumeración (`Available`, `Occupied`, `Maintenance`) con valor por defecto `Available`.
- `member_id`: UUID opcional, referencia a `Member.id` (nullable).
- `created_at`: Fecha de creación autogenerada.

Esquema Prisma propuesto (a agregar en `packages/api/prisma/schema.prisma`):

```prisma
enum LockerStatus {
    Available
    Occupied
    Maintenance
}

model Locker {
    id         String       @id @default(uuid())
    number     Int          @unique
    location   String
    status     LockerStatus @default(Available)
    member_id  String?
    member     Member?      @relation(fields: [member_id], references: [id], onDelete: SetNull)
    created_at DateTime     @default(now())

    @@map("lockers")
}
```

Decisión de diseño: la relación con `Member` es opcional y se utiliza `onDelete: SetNull` para que al borrar un socio el casillero quede liberado en lugar de bloquear el borrado del socio (TDD-0003).

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización entre backend y frontend:

- Endpoint: `POST /api/v1/lockers`
- Request Body (CreateLockerRequest):

```ts
{
    number: number;
    location: string;
    status?: 'Available' | 'Occupied' | 'Maintenance';
    member_id?: string | null;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: `LockerRepository` (Interface en el Dominio con `findByNumber` y `create`).
2. Servicio de Dominio: `LockerValidator` (centraliza la unicidad del número y la regla de "no asignar si está en Maintenance").
3. Caso de Uso: `CreateLockerUseCase` (corre las validaciones del `LockerValidator` y delega la persistencia al repositorio).
4. Adaptador de Salida: `PostgresLockerRepository` (implementación con Prisma).
5. Adaptador de Entrada: `LockerController` (Ruta HTTP `POST /api/v1/lockers`).

## Casos de Borde y Errores

| Escenario                                       | Resultado Esperado                                                       | Código HTTP               |
| ----------------------------------------------- | ------------------------------------------------------------------------ | ------------------------- |
| `number` ya registrado                          | Mensaje: "Ya existe un casillero con ese número"                         | 409 Conflict              |
| `number` no entero o menor o igual a 0          | Mensaje: "El número de casillero debe ser un entero positivo"            | 400 Bad Request           |
| Asignar `member_id` con `status` "Maintenance"  | Mensaje: "No se puede asignar un socio a un casillero en mantenimiento"  | 409 Conflict              |
| `member_id` no corresponde a un socio existente | Mensaje: "El socio indicado no existe"                                   | 400 Bad Request           |
| Error de conexión a DB                          | Mensaje: "Error interno, reintente más tarde"                            | 500 Internal Server Error |

## Plan de Implementación

1. Definir `LockerStatus`, `LockerDTO` y `CreateLockerRequest` en `@alentapp/shared`.
2. Agregar el `enum LockerStatus` y el modelo `Locker` en `schema.prisma` y correr la migración.
3. Crear el puerto `LockerRepository` y el servicio `LockerValidator` en el Dominio.
4. Implementar `PostgresLockerRepository` y el `CreateLockerUseCase`.
5. Crear el endpoint `POST /api/v1/lockers` en `LockerController` y registrarlo en `app.ts`.
6. Crear formulario en React (modal sobre `LockersView.tsx`) y conectar con el endpoint del backend.
