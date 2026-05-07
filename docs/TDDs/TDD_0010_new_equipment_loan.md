---
id: 0010
estado: Aprobado
autor: Mateo Arturo Geffroy
fecha: 2026-05-02
titulo: Crear Préstamo de Equipamiento
---

# TDD-0010: Crear Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre digitalmente el préstamo de un ítem de equipamiento a un socio habilitado, dejando un historial trazable y auditable. Solo socios con status `Activo` y categoría `Senior` o `Lifetime` pueden recibir préstamos. Los socios `Cadet` están prohibidos.

### User Persona

*   **Nombre**: Administración del Club / Recepcionista
*   **Necesidad**: Cuando un socio retira un elemento del club, necesita registrarlo rápidamente con el nombre del equipamiento y la fecha de devolución esperada, evitando préstamos a socios sin autorización (Cadet, Moroso, Suspendido).

### Criterios de Aceptación

*   El sistema debe validar que el socio (`member_id`) exista en la base de datos.
*   El sistema debe validar que el socio tenga status `Activo`; no se puede prestar a socios `Moroso` o `Suspendido`.
*   El sistema debe validar que el socio tenga categoría `Senior` o `Lifetime`; no se puede prestar a socios `Cadet` (403 Forbidden).
*   El `loan_date` se autogenera con la fecha/hora del servidor (`now()`); el cliente NO lo envía.
*   El `status` se inicializa automáticamente como `'Loaned'`; el cliente NO lo envía.
*   El `item_name` es obligatorio, no puede estar vacío.
*   La `due_date` es opcional; si se envía, debe ser una fecha futura en formato ISO 8601.
*   Al crear el préstamo, se retorna el objeto completo con `deleted_at: null`.

## Contexto Técnico

- **Operación:** CREATE (Alta)
- **Entidad:** EquipmentLoan
- **Relacionados:** TDD-0011 (Actualizar), TDD-0012 (Eliminar)
- **Precedencia:** Debe ser implementado primero

## Diseño Técnico (RFC)

### Modelo de Datos

Entidad `EquipmentLoan` con soft delete:

*   `id`: UUID, clave primaria, autogenerado.
*   `item_name`: String, obligatorio, no vacío.
*   `status`: Enum `LoanStatus`, default `'Loaned'`.
*   `loan_date`: Timestamp, autogenerado con `now()`.
*   `due_date`: Timestamp nullable, opcional.
*   `member_id`: UUID, clave foránea a `Member`, obligatorio.
*   `deleted_at`: Timestamp nullable, soft delete. `null` = activo.

Relación:
- Un `Member` puede tener muchos `EquipmentLoan`.
- Un `EquipmentLoan` pertenece a un único `Member`.

Reglas de negocio:
- El préstamo recién creado siempre tiene status `'Loaned'` y `deleted_at: null`.
- Solo socios con status `'Activo'` y categoría `'Senior'` o `'Lifetime'` pueden recibir préstamos.
- El `loan_date` es generado automáticamente por el servidor.

```ts
EquipmentLoan {
    id: string;
    item_name: string;
    status: 'Loaned';
    loan_date: string;          // Autogenerado: now()
    due_date: string | null;
    member_id: string;
    deleted_at: null;           // Siempre null en creación
}
```

### Contrato de API (@alentapp/shared)

#### Crear Préstamo

*   **Endpoint**: `POST /api/v1/equipment-loans`
*   **Request Body**:

```ts
{
    memberId: string;      // UUID del socio existente
    itemName: string;      // Nombre del equipamiento (no vacío)
    due_date?: string;     // ISO 8601 datetime, opcional y futura
}
```

*   **Response**: `201 Created`

```ts
{
    id: string;
    item_name: string;
    status: 'Loaned';
    loan_date: string;          // ISO 8601 (autogenerado)
    due_date: string | null;
    member_id: string;
    deleted_at: null;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**:
    *   Entidad `EquipmentLoan`.
    *   Enum `LoanStatus`.
    *   Validadores: `validateItemName`, `validateDueDate`, `validateMemberStatus`, `validateMemberCategory`.

*   **Application**:
    *   `CreateEquipmentLoanUseCase`: orquesta validación de socio (status, categoría), validación de fechas, y persistencia.
    *   Puerto `EquipmentLoanRepository`: interfaz con método `create`.

*   **Infrastructure**:
    *   `PostgresEquipmentLoanRepository.create`: implementa con Prisma, `loan_date` autogenerado en BD.
    *   `EquipmentLoanController.create`: mapea request → caso de uso → response.

## Casos de Borde y Errores

| Escenario                           | Resultado Esperado                                          | Código HTTP              |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------ |
| Socio inexistente                   | "El socio no existe"                                        | 404 Not Found            |
| Socio status Moroso o Suspendido    | "El socio no está en estado Activo"                         | 422 Unprocessable Entity |
| Socio categoría Cadet               | "Los socios Cadet no pueden solicitar préstamos"            | 403 Forbidden            |
| Item name vacío o faltante          | "El nombre del ítem es requerido"                           | 400 Bad Request          |
| Due date con formato no ISO 8601    | "Formato de fecha de devolución inválido"                   | 400 Bad Request          |
| Due date en el pasado               | "La fecha de devolución debe ser futura"                    | 422 Unprocessable Entity |
| Member ID faltante                  | "El campo member_id es requerido"                           | 400 Bad Request          |
| Creación exitosa                    | `EquipmentLoanDTO` con `status: 'Loaned'`, `deleted_at: null` | 201 Created              |
| Error en base de datos              | "Error interno, reintente más tarde"                        | 500 Internal Server Error|

## Plan de Implementación

1. Agregar `LoanStatus`, `EquipmentLoanDTO`, `CreateEquipmentLoanRequest` a `@alentapp/shared`.
2. Agregar modelo `EquipmentLoan` a Prisma (`schema.prisma`) con relación a `Member`.
3. Ejecutar migración `create_equipment_loans_table`.
4. Crear puerto `EquipmentLoanRepository` con método `create`.
5. Crear validadores de dominio: `validateItemName`, `validateDueDate`, `validateMemberStatus`, `validateMemberCategory`.
6. Implementar `CreateEquipmentLoanUseCase` con orquestación de validaciones.
7. Implementar `PostgresEquipmentLoanRepository.create` usando Prisma.
8. Crear `EquipmentLoanController.create` con mapeo de errores a códigos HTTP.
9. Registrar ruta `POST /api/v1/equipment-loans` en `app.ts`.
10. Agregar método `create` al servicio frontend `loans.ts`.
11. Crear vista `EquipmentLoans.tsx` con formulario de creación.
12. Agregar validaciones visuales: member status check, member category check, item name no vacío, due_date futura.
13. Mostrar mensajes de error específicos: Cadet (403), Moroso/Suspendido (422), socio inexistente (404).
14. Tests unitarios: creación exitosa, socio Cadet, socio Moroso, due_date pasada, item_name vacío.
15. Tests de integración: `POST /api/v1/equipment-loans`.