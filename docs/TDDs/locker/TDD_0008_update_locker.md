---
id: 0008
estado: Propuesto
autor: Pilar Wagner
fecha: 2026-05-03
titulo: Actualización y Asignación de Lockers
---

# TDD-0008: Actualización y Asignación de Lockers

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir a los administradores actualizar el estado y la asignación de lockers, controlando correctamente la disponibilidad de los casilleros del club.

### 1.2. User Persona

Rol: Administrador

Necesidad: Asignar lockers disponibles a socios y modificar estados de lockers existentes evitando conflictos de asignación.

### 1.3. Criterios de Aceptación

Como administrador, quiero asignar lockers para gestionar correctamente el uso de los casilleros.

Escenario de éxito: "Si el locker está disponible, el sistema debe asignarlo correctamente al socio".

Escenario de fallo: "Si el locker se encuentra en estado Maintenance, el sistema debe bloquear la asignación y notificar el error".

Escenario de fallo: "Si el locker ya está ocupado, el sistema debe impedir una nueva asignación".

---

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

La entidad Locker mantiene los mismos campos definidos para el alta.

- id: Identificador único universal (UUID).
- number: Número entero, obligatorio y único.
- location: Enumeración (Masculino, Femenino, Niños).
- status: Enumeración (Available, Occupied, Maintenance).
- member_id: Identificador del socio asignado, opcional.
- contract_end_date: Fecha de finalización del contrato en formato ISO 8601 Date (YYYY-MM-DD), opcional.

### 2.2. Contrato de API (@alentapp/shared)

Endpoint: PUT /api/v1/lockers/:id

Request Body:

```ts
{
    status?: 'Available' | 'Occupied' | 'Maintenance';
    member_id?: string;
    contract_end_date?: string; // ISO 8601 Date (YYYY-MM-DD)
}
```

### 2.3. Esquema de Persistencia

```prisma
model Locker {
id                String   @id @default(uuid())
number            Int      @unique
location          String
status            String
member_id         String?
member            Member?  @relation(fields: [member_id], references: [id])
contract_end_date DateTime?
}
```

---

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

Puerto (Domain): LockerRepository con métodos findById(id) y update(id, data).

Adaptador de Entrada (Delivery): LockerController, recibe la request HTTP, extrae params y body, y delega al caso de uso.

Adaptador de Salida (Infrastructure): PostgresLockerRepository, implementa los métodos findById y update.

### 3.2. Lógica del Caso de Uso

Caso de Uso: UpdateLockerUseCase.

1. Recibir el id del locker a actualizar.
2. Buscar el locker por id.
3. Validar los datos de entrada.
4. Verificar que el locker exista.
5. Verificar que el locker no tenga estado "Maintenance".
6. Verificar que el locker no esté ocupado antes de asignarlo.
7. Verificar que el socio exista mediante member_id.
8. Actualizar el estado del locker a "Occupied" cuando se asigne un socio.
9. Persistir los cambios a través de LockerRepository.
10. Retornar el locker actualizado.

---

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Locker inexistente | "El locker no existe" | 404 Not Found |
| Locker en mantenimiento | "El locker está en mantenimiento" | 400 Bad Request |
| Locker ya ocupado | "El locker ya se encuentra asignado" | 409 Conflict |
| Socio inexistente | "El socio no existe" | 404 Not Found |
| Campos con formato inválido | "Formato de datos inválido" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |

---

## 5. Plan de Implementación

- Actualizar los tipos en @alentapp/shared.
- Ampliar el puerto LockerRepository con los métodos findById(id) y update(id, data).
- Implementar el caso de uso UpdateLockerUseCase.
- Implementar validaciones de disponibilidad y estado.
- Crear la ruta PUT /api/v1/lockers/:id en LockerController.
- Conectar el formulario de edición con el endpoint del backend.

---

## 6. Observaciones Adicionales

- Aunque el endpoint utiliza PUT, la operación permite actualizar parcialmente la información del locker. Solo se modifican los campos enviados en el request.
- Las operaciones de asignación deben manejar concurrencia para evitar doble asignación del mismo locker.
- Cuando un locker se asigna, su estado debe actualizarse automáticamente a "Occupied".