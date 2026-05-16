---
id: 0007
estado: Propuesto
autor: Pilar Wagner
fecha: 2026-05-03
titulo: Registro de Lockers
---

# TDD-0007: Registro de Lockers

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir a los administradores registrar lockers dentro del sistema del club, manteniendo actualizado el inventario de casilleros disponibles para alquiler.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Registrar nuevos lockers indicando su número y ubicación para que puedan ser utilizados posteriormente por los socios del club.

### 1.3. Criterios de Aceptación

* Como administrador, quiero registrar lockers para ampliar o mantener actualizado el inventario de casilleros disponibles.

- Escenario de éxito: "Si el usuario completa correctamente los datos del locker, el sistema debe registrar el locker y notificar el éxito".

- Escenario de fallo: "Si el usuario intenta registrar un locker con un número ya existente, el sistema debe cancelar la operación y mostrar un mensaje de error".
- Escenario de fallo: "Si faltan campos obligatorios, el sistema debe impedir el registro y notificar el error".
- Escenario de fallo: "Si el usuario ingresa una ubicación inválida, el sistema debe impedir el registro y notificar el error."
- Escenario de fallo: "Si el usuario ingresa un número de locker menor o igual a cero, el sistema debe impedir el registro y notificar el error."

---

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se definirá la entidad "Locker" con las siguientes propiedades:

* `id`: Identificador único universal (UUID).
* `number`: Número entero positivo, obligatorio y único.
* `location`: Enumeración (`MALE`, `FEMALE`, `CHILDREN`).
* `status`: Enumeración (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
* `member_id`: Identificador del socio asignado, opcional.
* `contract_end_date`: Fecha de finalización del contrato en formato ISO 8601 Date (`YYYY-MM-DD`), opcional.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `POST /api/v1/lockers`
* **Request Body**:

```ts
{
    number: number;
    location: 'MALE' | 'FEMALE' | 'CHILDREN';
}
```

* **Reglas adicionales**:

* El campo `status` no debe recibirse desde el request.
* El sistema debe inicializar automáticamente el locker con estado `AVAILABLE`.
* El registro de lockers no permite asignar socios.
* Los campos `member_id` y `contract_end_date` deben inicializarse en `null`.


* **Response (Success)**: `201 Created`
* **Response Body**: `LockerResponseDTO`

```ts
type LockerResponseDTO = {
id: string;
number: number;
location: 'MALE' | 'FEMALE' | 'CHILDREN';
status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
member_id: string | null;
contract_end_date: string | null; // ISO Date (YYYY-MM-DD)
};

type ErrorResponse = {
message: string;
};
```

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
id                String          @id @default(uuid())
number            Int             @unique
location          LockerLocation
status            LockerStatus    @default(AVAILABLE)
member_id         String?
member            Member?         @relation(fields: [member_id], references: [id])
contract_end_date DateTime?
}
```

---

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `LockerRepository` con método `create(data)`.
* **Adaptador de Entrada (Delivery)**: `LockerController`, recibe la request HTTP, extrae el body y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresLockerRepository`, implementa el método `create`.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `CreateLockerUseCase`.

1. Validar los datos de entrada.
2. Verificar que `number` sea un entero válido y mayor a cero.
3. Verificar que `location` corresponda a un valor válido de la enumeración.
4. Verificar que el número de locker no exista previamente.
5. Inicializar el estado del locker como `AVAILABLE`.
6. Inicializar `member_id` y `contract_end_date` en `null`.
7. Mapear el DTO a Entidad de Dominio.
8. Persistir la entidad a través de `LockerRepository`.
9. Retornar el locker creado.

---

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Número de locker duplicado | "Ya existe un locker con ese número" | 409 Conflict |
| Campos obligatorios faltantes | "Todos los campos son requeridos" | 400 Bad Request |
| Ubicación inválida | "La ubicación seleccionada no es válida" | 400 Bad Request |
| Número de locker menor o igual a cero | "El número de locker debe ser mayor a cero" | 400 Bad Request |
| Número de locker inválido | "El número de locker debe ser un entero válido" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |
| Registro exitoso | Locker registrado correctamente | 201 Created |

---

## 5. Plan de Implementación

1. Definir el esquema de persistencia de Locker y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto `LockerRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `CreateLockerUseCase`.
4. Implementar el endpoint `POST /api/v1/lockers`.
5. Realizar pruebas unitarias y de integración.

---

## 6. Observaciones Adicionales

* El estado inicial de un locker debe ser siempre `AVAILABLE`.
* El atributo number debe ser único dentro del sistema.
* El registro de lockers no asigna socios automáticamente.
* `member_id` y `contract_end_date` deben permanecer en `null` hasta que el locker sea asignado.