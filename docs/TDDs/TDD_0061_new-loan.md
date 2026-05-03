---
id: "0061"
estado: Propuesto
autor: Julian Coloma
fecha: 2026-05-01
titulo: Registro de Préstamo de Material
---

# TDD-0061: Registro de Préstamo de Material

## Contexto de Negocio (PRD)

### Objetivo
Digitalizar el control de salida de materiales del club, asegurando que solo los socios habilitados por su categoría puedan retirar equipamiento y manteniendo un registro de las fechas de devolución.

### User Persona
* **Nombre**: Alberto (Tesorero/Administrativo).
* **Necesidad**: Registrar qué material se lleva un socio y para cuándo debe devolverlo, bloqueando automáticamente a los socios que no cumplen con los requisitos de categoría para evitar pérdidas o mal uso.

### Criterios de Aceptación
* El sistema debe validar que el socio exista en la base de datos.
* **Regla de Negocio (TP)**: Los préstamos solo están permitidos para socios "Senior" o "Lifetime". Los "Cadet" tienen prohibido solicitar material.
* La fecha de devolución (`due_date`) debe ser estrictamente posterior a la fecha de préstamo (`loan_date`).
* El estado inicial del préstamo debe ser "Loaned".
* Al finalizar el registro, el sistema debe mostrar un mensaje de éxito.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `EquipmentLoan`:
* `id`: UUID (PK).
* `item_name`: String.
* `status`: Enum ('Loaned', 'Returned', 'Damaged').
* `loan_date`: DateTime. (Este campo no se envía en el request; el backend lo setea automáticamente utilizando la fecha y hora actual (`now()`) en el momento de la creación)
* `due_date`: DateTime.
* `member_id`: UUID (FK).

### Contrato de API (@alentapp/shared)
* **Endpoint**: `POST /api/v1/equipment-loan`
* **Request Body** (CreateLoanRequest):
```ts
{
    member_id: string;
    item_name: string;
    due_date: string; // ISO Date String
}
```
- **Response** (Success): 201 created
```ts
{
    id: string;
    member_id: string;
    item_name: string;
    loan_date: string; // Generado automáticamente
    due_date: string;
    status: 'Loaned';
}
```


### Componentes de Arquitectura Hexagonal

1. **Entidad de Dominio**: `Loan` (Lógica de validación intrínseca de fechas y regla de categoría delegada).
2. **Puerto**: `LoanRepository` y `MemberRepository` (Método `findById` para verificar categoría del socio).
3. **Caso de Uso**: `CreateLoanUseCase` (Consulta `MemberRepository` para verificar la categoría del socio antes de proceder).
4. **Adaptador de Salida**: `PostgresLoanRepository` (Implementación con Prisma).
5. **Adaptador de Entrada**: `LoanController` (Maneja la entrada HTTP y devuelve los códigos de respuesta correspondientes).

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                              | Código HTTP        |
| -------------------------------- | --------------------------------------------------------------- | ------------------ |
| Socio con categoría "Cadet"      | Mensaje: "Los socios Cadetes tienen prohibido solicitar material" | 403 Forbidden      |
| Fecha de devolución anterior     | Mensaje: "La fecha de devolución debe ser posterior a la de inicio" | 400 Bad Request    |
| Socio inexistente                | Mensaje: "El socio especificado no existe"                      | 404 Not Found      |
| `item_name` vacío           | Mensaje: "El nombre del ítem es obligatorio"  | 400 Bad Request           |

## Plan de Implementación

1. Definir `CreateLoanRequest` en `@alentapp/shared`.
2. Crear la migración de Prisma para la tabla `EquipmentLoan`.
3. Implementar el puerto `LoanRepository` y el caso de uso `CreateLoanUseCase`.
4. Implementar el controlador y la ruta en el backend.
5. Desarrollar el formulario de préstamo en el Frontend.