
---
**id:** 6001
**Autor:** Dieguez Matias
**Fecha:** 2026-05-02
**Estado:** Revision
**Titulo:** Crear Prestamo de Equipamento
---

# TDD-6001: Registro de Préstamo de Equipamiento

---

## 1. Contexto de Negocio 

### 1.1 Objetivo
Permitir registrar los prestamos de un equipamento a un socio, asegurando la trazabilidad del recurso evitando conflictos de disponobilidad

---

### 1.2 User Personas

- Nombre: Personal del Club (administrativo/encargado).
- Necesidad: Registrar de prestamos de equipamento de forma rapida y confiable, asegurando que el recurso este disponible y evitando asignaciones duplicadas

---

### 1.3 Criterios de Aceptacion

- Como persona del club, quiero registrar un prestamo de equipamento para llevar un control de quien lo tiene.
- Como sistema, quiero registrar automáticamente la fecha `loan_Date` del préstamo para asegurar trazabilidad.
- Como personal del club, quiero recibir una confirmación al registrar el préstamo para asegurar que la operación fue exitosa.
- Como sistema, quiero validar la categoría del socio para permitir préstamos solo a socios "Senior" o "Lifetime".

---

## 2. Diseño Tenico

### 2.1 Modelo de Dominio

```ts 
interface EquipmentLoan {
    id: string;
    userId: sting;
    item_name: string;
    loan_Date: Date;
    returnDate?: Date;
    status: "LOANED" | "RETURNED" | "DAMAGED";
}
```
---

### 2.2 Contrato de API (@alentapp/shared)

Se definirán los tipos en el paquete compartido:

- Endpoint: `POST /api/v1/equipment-loans`

- Request Body (CreateEquipmentLoanRequest):

```ts
{
    userId: string;
    item_name: string;
}
```
---

## 3. Arquitectura y flujo

### 3.1 Definición del Puerto (Repository Interface) 

Se define el contrato que la capa de dominio requiere para interactuar con la persistencia de préstamos de equipamiento:

```ts
export interface EquipmentLoanRepository {
  
  create(loan: EquipmentLoan): Promise<EquipmentLoan>;

  findLoanedByItemName(item_name: string): Promise<EquipmentLoan | null>;

}
```

### 3.2 Logica de Caso de Uso

Describir paso a paso qué hace el sistema al recibir una petición para crear un préstamo de equipamiento:

1. Validar los datos de entrada (`userId`, `item_name`).
2. Verificar que el usuario exista en el sistema.
3. Verificar la categoría del usuario:
   - Si es "Cadet" → rechazar operación.
   - Si es "Senior" o "Lifetime" → continuar.
4. Mapear el DTO de entrada a la entidad de dominio `EquipmentLoan`.
5. Asignar valores por defecto:
   - `loan_Date`: fecha actual.
   - `status`: LOANED.
6. Persistir la entidad a través del repositorio `EquipmentLoanRepository`.
7. Retornar el préstamo creado como respuesta.

---

## 4. Casos de Borde y Manejo de Errores 

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                                  | Código HTTP              |
|----------------------------------------|---------------------------------------------------------------------|--------------------------|
| Usuario inexistente                    | Mensaje: "El usuario no existe"                                     | 404 Not Found            |
| Usuario categoría "Cadet"              | Mensaje: "Los socios Cadet no pueden solicitar préstamos"           | 403 Forbidden            |
| Equipamiento inexistente               | Mensaje: "El equipamiento no existe"                                | 404 Not Found            |
| Prestamo registrado                    | Mensaje: "Prestamo registrado correctamente"                        | 200 OK                   |
| Datos incompletos o inválidos          | Mensaje: "Datos inválidos"                                          | 400 Bad Request          |
| Error de conexión a base de datos      | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|
| Error inesperado del servidor          | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error|

---

## 5. Observaciones

- Índices en base de datos: Se recomienda indexar el campo itemName o el identificador del equipamiento para optimizar búsquedas al verificar si está prestado. Esto mejora la performance en consultas frecuentes.
- Uso de enums para status: Definir los estados (LOANED, RETURNED, DAMAGED) como enum en lugar de strings sueltos reduce errores de tipeo y mejora la consistencia en todo el sistema.

---