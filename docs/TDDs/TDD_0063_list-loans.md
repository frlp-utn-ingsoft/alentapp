---
id: "0063"
estado: Propuesto
autor: Julian Coloma
fecha: 2026-05-02
titulo: Consulta de Préstamos Activos y Vencidos
---

# TDD-0063: Consulta de Préstamos Activos y Vencidos

## Contexto de Negocio (PRD)

### Objetivo
Proveer visibilidad sobre los recursos del club que están actualmente fuera de las instalaciones y detectar aquellos que han superado el plazo de devolución.

### User Persona
* **Nombre**: Alberto (Tesorero).
* **Necesidad**: Listar todos los préstamos pendientes para realizar reclamos a los socios morosos o saber qué materiales están disponibles para otros socios.

### Criterios de Aceptación
* El sistema debe permitir listar todos los préstamos con estado "Loaned".
* El sistema debe permitir filtrar los resultados por nombre del socio o nombre del ítem.
* Visualmente, en el frontend, se deben resaltar (ej. color rojo) los préstamos cuya `due_date` sea menor a la fecha actual.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)
* **Endpoint**: `GET /api/v1/equipment-loan`
* **Query Parameters** (GetLoansQuery):
```ts
{
    status?: 'Loaned' | 'Returned' | 'Damaged';
    search?: string; // Filtra por coincidencia parcial en nombre de socio o ítem
}
```
(Ejemplo: `GET /api/v1/equipment-loan?status=Loaned&search=Alberto`)
* **Response** (Success): 200 ok
```ts
[
    {
        "id": "string",
        "member_id": "string",
        "item_name": "string",
        "loan_date": "string",
        "due_date": "string",
        "status": "string",
        "member": {
            "name": "string"
        }
    }
]
```

### Componentes de Arquitectura Hexagonal
* **Infrastructure**: `LoanController` maneja los query params. El repositorio debe realizar un `include` de la entidad `Member` para traer el nombre.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Sin préstamos activos       | Retorna lista vacía `[]`                      | 200 OK                    |

## Plan de Implementación
1. Implementar método `findAllActive` en el repositorio.
2. Crear la ruta GET en el backend.
3. Crear la vista `LoansView.tsx` en el frontend con una tabla de seguimiento.