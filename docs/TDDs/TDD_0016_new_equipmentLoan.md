---
id: 0016
estado: Propuesto
autor: Facundo Devida
fecha: 2026-05-02
titulo: Registro de Prestamos de equipamiento
---

# TDD-0016: Registro de Prestamos de equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo de de alta un nuevo prestamo de equipamiento digitalmente para tener un registro y una mejor trazabilidad del mismo.

### User Persona

- **Nombre**: Administrativo
- **Necesidad**: Registrar un nuevo prestamo de equipamiento de manera simple y prevenir la perdida de informacion debido al posible extravio de registros manuales en papel

### Criterios de Aceptación

- El sistema debe validar que el prestamo este asociado solo a un socio de tipo "Senior" o "Lifetime”, los socios de tipo "Cadet" tienen prohibido solicitar material.
- El sistema debe validar que la fecha de vencimiento del prestamo sea posterior a la fecha en la que el mismo fue creado
- El estado por defecto al momento de su creacion debe ser “loaned”
- Al finalizar el sistema debe mostrar un mensaje de exito

## Diseño Técnico (RFC)

### Modelo de Datos

Se define la entidad `EquipmentLoan` con los siguientes datos y restricciones

- `id`: Identificador único universal (UUID).
- `item_name`: Cadena de texto
- `status`: Enumeracion (`Prestado`, `Devuelto`, `Dañado`)
- `loanDate`: Fecha de creacion.
- `dueDate`: Fecha.
- `member_id`: Identificador único universal (UUID) referenciando a “`member`”.
- `deleted_at`: Fecha (Opcional / Nulo)

### Contrato de API (@alentapp/shared)

- **Endpoint**: `POST /api/v1/equipment-loans`
- **Request Body**:

```tsx
{
    item_name: string;
    due_date: string;
    member_id: string;  
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**:
    - `EquipmentLoan` (Maneja su propia invariante: la fecha de devolución debe ser futura al momento del préstamo, su estado inicial es siempre `Prestado`y `deleted_at`en `null`).
    - **Value Objects:** `EquipmentLoanStatus` ( `'Prestado' | 'Devuelto' | 'Dañado'`).
    - **Reglas de negocio:**  Un préstamo de equipamiento no puede existir si el socio solicitante no tiene categoría "Senior" o "Lifetime”(Esta regla se delega al caso de uso)
- **Application**:
    - Caso de Uso: `CreateEquipmentLoan` (Consulta la categoría del socio, aplica la restriccion si es necesario, instancia la entidad `EquipmentLoan` y la persiste a traves de `EquipmentLoanRepository`)
    - Puertos de Salida: `EquipmentLoanRepository` (Interface del dominio) y `MemberRepository`(Requerido para consultar la categoria del socio)
- **Infrastructure**:
    - Adaptadores de entrada: `EquipmentLoanController` (HTTP)
    - Adaptadores de salida: DB persistence adapter

## Casos de Borde y Errores

| **Escenario** | **Resultado Esperado** | **Código HTTP** |
| --- | --- | --- |
| **Socio no autorizado (Cadete)** | Mensaje: "Los socios categoría Cadete no tienen permitido solicitar material." | 403 Forbidden |
| **Fecha de devolución en el pasado** | Mensaje: "La fecha de devolución debe ser posterior a la fecha actual." | 400 Bad Request |
| **Socio inexistente** | Mensaje: "El socio solicitado no se encuentra registrado en el sistema." | 404 Not Found |
| **Campos obligatorios faltantes** | Mensaje listando los campos requeridos que no se enviaron (ej. `item_name`, `due_date`). | 400 Bad Request |
| **Error de conexión a DB** | Mensaje: "Error interno del servidor, reintente más tarde." | 500 Internal Server Error |

## Plan de Implementación

1. Crear y exportar el tipo `CreateEquipmentLoanRequest` detallando los campos de entrada
2. Crear la entidad `EquipmentLoan` y el Value Object `EquipmentLoanStatus`
3. Crear el puerto de salida `EquipmentLoanRepository` definiendo el método `save()` o `create()`
4. Desarrollar  `CreateEquipmentLoanUseCase`
5. Crear el DB persistence adapter
6. Crear el `EquipmentLoanController` exponiendo la ruta `POST /api/v1/equipment-loans`