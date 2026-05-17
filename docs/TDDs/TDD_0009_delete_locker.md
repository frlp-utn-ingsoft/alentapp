---
id: 0009
estado: Propuesto
autor: Pilar Wagner
fecha: 2026-05-03
titulo: Eliminación de Lockers
---

# TDD-0009: Eliminación de Lockers

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir a los administradores eliminar lockers que ya no estarán disponibles dentro del sistema del club.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Eliminar lockers que dejaron de utilizarse o que ya no forman parte del inventario disponible del club.

### 1.3. Criterios de Aceptación

* Como administrador, quiero eliminar lockers para mantener actualizado el inventario de casilleros disponibles.

- Escenario de éxito: "Si el locker existe y no se encuentra ocupado, el sistema debe eliminar el registro correctamente".

- Escenario de fallo: "Si el locker no existe, el sistema debe cancelar la operación y mostrar un mensaje de error".
- Escenario de fallo: "Si el locker se encuentra ocupado, el sistema debe impedir la eliminación y notificar el error".

---

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

La entidad Locker mantiene los mismos campos definidos para el alta.

* `id`: Identificador único universal (UUID).
* `number`: Número entero positivo, obligatorio y único.
* `location`: Enumeración (`MALE`, `FEMALE`, `CHILDREN`).
* `status`: Enumeración (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
* `member_id`: Identificador del socio asignado, opcional.
* `contract_end_date`: Fecha de finalización del contrato en formato ISO 8601 Date (`YYYY-MM-DD`), opcional.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `DELETE /api/v1/lockers/:id`
* **Request Body**: No aplica.
* **Response**: `204 No Content` en caso de éxito.

### 2.3. Esquema de Persistencia

```prisma
enum LockerLocation {
MALE
FEMALE
CHILDREN
}

enum LockerStatus {
AVAILABLE
OCCUPIED
MAINTENANCE
}

model Locker {
id                String           @id @default(uuid())
number            Int              @unique
location          LockerLocation
status            LockerStatus
member_id         String?
member            Member?         @relation(fields: [member_id], references: [id])
contract_end_date DateTime?
}

```

---

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `LockerRepository` con métodos `findById(id)` y `delete(id)`.
* **Adaptador de Entrada (Delivery)**: `LockerController`, recibe el parámetro id desde la URL y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresLockerRepository`, implementa los métodos `findById` y `delete`.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `DeleteLockerUseCase`.

1. Recibir el id del locker a eliminar.
2. Buscar el locker por id.
3. Verificar que el locker exista.
4. Verificar que el locker no se encuentre en estado `OCCUPIED`.
5. Eliminar físicamente el registro del locker a través de `LockerRepository`.
6. Retornar confirmación de eliminación.

---

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Locker inexistente | "El locker no existe" | 404 Not Found |
| Locker ocupado | "No se puede eliminar un locker ocupado" | 409 Conflict |
| ID con formato inválido | "Formato de ID inválido" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |
| Eliminación exitosa | Locker eliminado correctamente | 204 No Content |

---

## 5. Plan de Implementación

1. Ampliar el puerto `LockerRepository` con los métodos `findById(id)` y `delete(id)`.
2. Implementar el caso de uso `DeleteLockerUseCase`.
3. Implementar la eliminación física del locker en `PostgresLockerRepository`.
4. Implementar el endpoint `DELETE /api/v1/lockers/:id`.
5. Conectar la funcionalidad de eliminación con el frontend.
6. Realizar pruebas de integración verificando la eliminación física del locker.

---

## 6. Observaciones Adicionales

* La eliminación de lockers será física y removerá el registro de la base de datos.
* Se decidió realizar eliminación física ya que los lockers no requieren trazabilidad histórica ni conservación para auditoría.
* No se permite eliminar lockers que se encuentren asignados a socios.
* Los lockers en estado `AVAILABLE` o `MAINTENANCE` podrán eliminarse.