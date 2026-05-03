
---
**id:** 6003
**Autor:** Dieguez Matias
**Fecha:** 2026-05-02
**Estado:** Revision
**Titulo:** Baja de Prestamo de Equipamento
---

# TDD-6003: Baja de Préstamo de Equipamiento

---

## 1. Contexto de Negocio

### 1.1 Objetivo
Permitir la cancelación o anulación de un préstamo de equipamiento en casos excepcionales, sin eliminar la trazabilidad del sistema.

### 1.2 User Personas

- Nombre: Personal del Club (empleado/administrativo)
- Necesidad: Anular préstamos creados por error o situaciones administrativas especiales.

### 1.3 Criterios de Aceptacion

- Como sistema, quiero mantener historial del préstamo aunque esté cancelado.
- Como personal del club, quiero cancelar un préstamo para corregir errores operativos.
- Como sistema, quiero impedir la cancelación de préstamos ya finalizados.

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
    status: "LOANED" | "RETURNED" | "DAMAGED" | "CANCELLED" ;
}
```

### 2.2 Contrato de API (@alentapp/shared)

- Endpoint: DELETE /api/v1/equipment-loans/:id

---

## 3. Arquitectura y Flujo

### 3.1 Definición del Puerto (Repository Interface)

```ts 
export interface EquipmentLoanRepository {
  findById(id: string): Promise<EquipmentLoan | null>;
  update(loan: EquipmentLoan): Promise<EquipmentLoan>;
}
```

### 3.2 Logica de Caso de Uso

1. Buscar prestamo por ID.
2. Validar existencia.
3. Verificar estado:
    - Si está RETURNED o DAMAGED -> no se cancela
4. Marcar como CANCELLED.
5. Persistir cambios.
6. Retornar confirmación.    

---

## 4. Caso de Bordes y Errores

| Escenario                              | Resultado Esperado                                                  | Código HTTP              |
|----------------------------------------|---------------------------------------------------------------------|--------------------------|
| Prestamo inexistente                   | Mensaje: "El prestamo no existe"                                    | 404 Not Found            |
| Prestamo finalizado                    | Mensaje: "El préstamo ya fue finalizado y no puede cancelarse"      | 409 Conflict             |
| Error de conexión a base de datos      | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|
| Error inesperado del servidor          | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|

---

## 5. Observaciones

- **Uso del estado CANCELLED:** Se incorpora para representar la anulación de un préstamo por motivos administrativos o errores de carga, diferenciándolo de una devolución real (RETURNED) o un préstamo dañado (DAMAGED).
- **Consistencia de estados:** Un préstamo en estado RETURNED, DAMAGED o CANCELLED se considera cerrado, por lo que no puede ser modificado ni reutilizado dentro del flujo operativo.
- **Regla de inmutabilidad parcial:** Solo los préstamos en estado LOANED pueden ser cancelados. Una vez que el préstamo entra en un estado final, su información se mantiene únicamente con fines de trazabilidad.
- **Soft delete lógico:** La baja de un préstamo no implica eliminación física del registro, sino una actualización del estado a CANCELLED, garantizando la persistencia del historial completo del sistema.

---
