---
id: 0009
estado: Propuesto
autor: Pilar Wagner
fecha: 2026-05-03
titulo: Liberación de Lockers
---

# TDD-0009: Liberación de Lockers

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir a los administradores liberar lockers ocupados para que puedan volver a ser utilizados por otros socios del club.

### 1.2. User Persona

Rol: Administrador

Necesidad: Liberar lockers ocupados para permitir nuevas asignaciones.

### 1.3. Criterios de Aceptación

Como administrador, quiero liberar lockers para que puedan volver a estar disponibles para otros socios.

Escenario de éxito: "Si el locker está ocupado, el sistema debe liberar la asignación y marcarlo como disponible".

Escenario de fallo: "Si el locker no existe, el sistema debe cancelar la operación y mostrar un mensaje de error".

Escenario de fallo: "Si el locker ya se encuentra disponible, el sistema debe impedir la operación y notificar al usuario".

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

Endpoint: PUT /api/v1/lockers/:id/release

Request Body: No aplica.

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

Puerto (Domain): LockerRepository con métodos findById(id) y release(id).

Adaptador de Entrada (Delivery): LockerController, recibe el parámetro id desde la URL y delega al caso de uso.

Adaptador de Salida (Infrastructure): PostgresLockerRepository, implementa los métodos findById y release.

### 3.2. Lógica del Caso de Uso

Caso de Uso: ReleaseLockerUseCase.

1. Recibir el id del locker a liberar.
2. Buscar el locker por id.
3. Verificar que el locker exista.
4. Verificar que el locker esté actualmente ocupado.
5. Eliminar la asignación del socio.
6. Limpiar contract_end_date.
7. Actualizar el estado del locker a "Available".
8. Persistir los cambios a través de LockerRepository.
9. Retornar el locker actualizado.

---

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Locker inexistente | "El locker no existe" | 404 Not Found |
| Locker ya disponible | "El locker ya se encuentra disponible" | 409 Conflict |
| ID con formato inválido | "Formato de ID inválido" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |

---

## 5. Plan de Implementación

- Ampliar el puerto LockerRepository con los métodos findById(id) y release(id).
- Implementar el caso de uso ReleaseLockerUseCase.
- Implementar la liberación del locker en PostgresLockerRepository.
- Crear la ruta PUT /api/v1/lockers/:id/release en LockerController.
- Conectar la funcionalidad en el frontend agregando confirmación previa a la liberación.

---

## 6. Observaciones Adicionales

- La liberación de un locker no elimina el registro de la base de datos.
- Al liberar un locker, member_id y contract_end_date deben establecerse en null.
- Cuando un locker se libera, su estado debe actualizarse automáticamente a "Available".