
---
**id:** 5002
**Autor:** Dieguez Matias
**Fecha:** 2026-05-02
**Estado:** Revision
**Titulo:** Devolucion de Equipamento
---

# TDD-5002: Devolucion de Equipamiento

---

## 1. Contexto de Negocio

### 1.1 Objetivo

Permitir la modificación de un préstamo de equipamiento ya registrado, principalmente para actualizar su estado o corregir información operativa, manteniendo la trazabilidad del préstamo.


### 1.2 User Personas

- Nombre: Personal del Club (empleado/administrativo)
- Necesidad: Corregir o actualizar el estado de un préstamo ya creado (ej: marcar devolución, daño o ajustes administrativos)

### 1.3 Criterios de Aceptacion

- Como personal del club, quiero modificar un préstamo para actualizar su estado.
- Como personal del club, quiero registrar la devolución de un préstamo para liberar el equipamiento.
- Como sistema, quiero validar que el préstamo exista antes de modificarlo.
- Como sistema, quiero permitir cambiar el estado del préstamo entre: LOANED → RETURNED / DAMAGED
- Como sistema, quiero impedir modificaciones sobre préstamos inexistentes.
- Como sistema, quiero registrar automáticamente cambios relevantes (auditoría implícita).

---

## 2. Diseño Tecnico

### 2.1 Modelo de Dominio

```ts
interface EquipmentLoan {
    id: string;
    userId: string;
    item_name: string;
    loan_Date: Date;
    returnDate?: Date;
    status: "LOANED" | "RETURNED" | "DAMAGED";
}
```

### 2.2 Contrato de API (@alentapp/shared)

Se definirán los tipos en el paquete compartido:

- Endpoint: PATCH /api/v1/equipment-loans/:id

- Request Body (UpdateEquipmentLoanRequest):

```ts
{
    status?: "RETURNED" | "DAMAGED";
    returnDate?: Date;
}
```

---

## 3. Arquitectura y Flujo

### 3.1 Definición del Puerto (Repository Interface)

Se define el contrato que la capa de dominio requiere para interactuar con la persistencia de préstamos de equipamiento:

```ts
export interface EquipmentLoanRepository {
  findById(id: string): Promise<EquipmentLoan | null>;
  update(loan: EquipmentLoan): Promise<EquipmentLoan>;
}
```

### 3.2 Logica de Caso de Uso

Describir paso a paso qué hace el sistema al recibir una petición para modificar un préstamo de equipamiento:

1. Validar loanId.
2. Buscar préstamo.
3. Si no existe → 404.
4. Validar estado actual:
    - Si ya está RETURNED o DAMAGED → no permitir cambios críticos.
5. Aplicar cambios:
    - Actualizar status.
    - Si pasa a RETURNED o DAMAGED → setear returnDate.
6. Persistir cambios.
7. Retornar préstamo actualizado.

---

## 4. Casos de Bordes y Errores

| Escenario                              | Resultado Esperado                                                  | Código HTTP              |
|----------------------------------------|---------------------------------------------------------------------|--------------------------|
| Prestamo inexistente                   | Mensaje: "Prestamo no encontrado"                                   | 404 Not Found            |
| Prestamo cerrado                       | Mensaje: "El préstamo ya fue cerrado y no puede modificarse"        | 409 Conflict             |
| Estado inválido                        | Mensaje: "Estado inválidos"                                         | 400 Bad Request          |
| Error de conexión a base de datos      | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|
| Error inesperado del servidor          | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|

---

## 5. Observaciones

- **Uso de estado CANCELLED:** Se recomienda diferenciar cancelación de devolución real para evitar confusión entre errores administrativos y uso efectivo del equipamiento.
- **Consistencia de estados:** Un préstamo en estado RETURNED o DAMAGED se considera cerrado, por lo que no permite modificaciones posteriores.

---