---
id: 0008
estado: Propuesto
autor: Mateo Arturo Geffroy
fecha: 2026-05-02
titulo: Préstamos de Equipamiento
---

# TDD-0008: Préstamos de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir la gestión comepleta de préstamos de equipamiento del club, garantizando que solo los socios habilitados (categoría "Senior" o "Lifetime") puedan solicitar material. Esto reduce la carga administrativa manual y centraliza el seguimiento del estado de cada ítem prestado.

### User Persona

- **Nombre**: Administrativo del Club / Recepcionista
- **Necesidad**: Registrar préstamos de equipamiento a socios, actualizar su estado (devuelto, dañado) y consultar el historial. Su punto de dolor es no tener visibilidad del material prestado ni poder controlar quién puede solicitarlo según su categoría de membresía.

### Criterios de Aceptación

- El sistema debe impedir que un socio de categoría "Cadet" solicite un préstamo, devolviendo un error 403.
- El sistema debe validar que el socio exista antes de crear el préstamo; si no existe, devolver 404.
- La `due_date` debe ser estrictamente posterior a la `loan_date`; de lo contrario, devolver 400.
- El `item_name` no puede estar vacío; de lo contrario, devolver 400.
- El estado (`status`) solo puede tomar los valores `'Loaned'`, `'Returned'` o `'Damaged'`.
- Al crear un préstamo, el estado inicial debe ser `'Loaned'`.
- El listado de préstamos debe poder filtrarse por `memberId` y/o `status`.
- Al actualizar un préstamo inexistente, el sistema debe devolver 404.

---

## Diseño Técnico (RFC)

### Modelo de Datos

Nueva entidad `EQUIPMENT_LOAN` en el esquema Prisma:

```prisma
model EquipmentLoan {
  id        String   @id @default(uuid())
  item_name String
  status    String   @default("Loaned") // 'Loaned' | 'Returned' | 'Damaged'
  loan_date DateTime
  due_date  DateTime
  member_id String
  member    Member   @relation(fields: [member_id], references: [id])
}
```

- `id`: UUID, Primary Key, generado automáticamente.
- `item_name`: string, obligatorio, no vacío.
- `status`: string, valores permitidos: `'Loaned'`, `'Returned'`, `'Damaged'`. Default: `'Loaned'`.
- `loan_date`: datetime, obligatorio.
- `due_date`: datetime, obligatorio, debe ser posterior a `loan_date`.
- `member_id`: UUID, Foreign Key referenciando a `MEMBER.id`.

---

### Contrato de API (`@alentapp/shared`)

#### Crear préstamo

- **Endpoint**: `POST /api/v1/equipment-loans`
- **Request Body**:

```ts
{
  memberId:  string;   // UUID del socio
  itemName:  string;   // Nombre del ítem (no vacío)
  loan_date: string;   // ISO 8601
  due_date:  string;   // ISO 8601, debe ser posterior a loan_date
}
```

- **Response** (201 Created):

```ts
{
  id:        string;
  item_name: string;
  status:    'Loaned' | 'Returned' | 'Damaged';
  loan_date: string;
  due_date:  string;
  member_id: string;
}
```

---

#### Actualizar préstamo

- **Endpoint**: `PUT /api/v1/equipment-loans/:id`
- **Request Body**:

```ts
{
  itemName?: string;
  due_date?: string;
  status?:   'Loaned' | 'Returned' | 'Damaged';
}
```

- **Response** (200 OK): objeto `EquipmentLoanResponse` actualizado.

---

#### Listar préstamos

- **Endpoint**: `GET /api/v1/equipment-loans`
- **Query Params opcionales**:

```ts
{
  memberId?: string;
  status?:   'Loaned' | 'Returned' | 'Damaged';
}
```

- **Response** (200 OK): array de `EquipmentLoanResponse`.

---

### Componentes de Arquitectura Hexagonal

#### Domain

- **Entidad**: `EquipmentLoan` — representa el préstamo con sus atributos y estado.
- **Enum**: `EquipmentLoanStatus` → `Loaned | Returned | Damaged`.
- **Regla de negocio**: Validación de categoría del socio (solo `Senior` o `Lifetime`).
- **Regla de negocio**: Validación de fechas (`due_date` > `loan_date`).
- **Regla de negocio**: Validación de `item_name` no vacío.

#### Application

- `CreateEquipmentLoanUseCase`: valida categoría del socio, fechas e item; persiste el préstamo con estado `Loaned`.
- `UpdateEquipmentLoanUseCase`: valida existencia del préstamo y aplica actualizaciones parciales.
- `ListEquipmentLoansUseCase`: retorna préstamos con filtros opcionales por `memberId` y/o `status`.
- **Puerto de salida**: `EquipmentLoanRepository` (interfaz).

#### Infrastructure

- `PostgresEquipmentLoanRepository`: implementación del puerto usando Prisma ORM.
- Consulta a `MemberRepository` para verificar existencia y categoría del socio antes de crear el préstamo.
- `EquipmentLoanController`: controlador HTTP que mapea requests/responses y delega a los casos de uso.

---

## Casos de Borde y Errores

| Escenario                                        | Resultado Esperado                          | Código HTTP     |
|--------------------------------------------------|---------------------------------------------|-----------------|
| Socio inexistente                                | Error: el socio no existe                   | 404 Not Found   |
| Socio categoría Cadet                            | Error: préstamo no permitido para Cadet     | 403 Forbidden   |
| `due_date` anterior o igual a `loan_date`        | Error de validación de fechas               | 400 Bad Request |
| `item_name` vacío                                | Error de validación: nombre requerido       | 400 Bad Request |
| `status` con valor inválido                      | Error de validación de estado               | 400 Bad Request |
| Préstamo inexistente al actualizar               | Error: el préstamo no existe                | 404 Not Found   |

---

## Plan de Implementación

1. Definir modelo `EquipmentLoan` en Prisma y generar la migración correspondiente.
2. Definir tipos compartidos en `@alentapp/shared`: `CreateEquipmentLoanRequest`, `UpdateEquipmentLoanRequest`, `EquipmentLoanResponse`, y el enum `EquipmentLoanStatus`.
3. Crear el puerto `EquipmentLoanRepository` (interfaz en capa Domain/Application).
4. Implementar `CreateEquipmentLoanUseCase` con validación de categoría (consulta `MemberRepository`), fechas e `item_name`.
5. Implementar `UpdateEquipmentLoanUseCase` con validación de existencia del préstamo.
6. Implementar `ListEquipmentLoansUseCase` con soporte de filtros.
7. Implementar `PostgresEquipmentLoanRepository` usando Prisma.
8. Crear `EquipmentLoanController` HTTP.
9. Desarrollar componentes frontend: formulario y listado con acciones de estado.
10. Agregar tests para socios `Senior`, `Lifetime` y `Cadet` (unitarios y de integración).