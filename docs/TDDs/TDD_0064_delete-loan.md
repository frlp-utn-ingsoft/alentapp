---
id: "0064"
estado: Propuesto
autor: Julian Coloma
fecha: 2026-05-02
titulo: Eliminación de Registros de Préstamo
---

# TDD-0064: Eliminación de Registros de Préstamo

## Contexto de Negocio (PRD)

### Objetivo
Permitir la corrección de errores de carga mediante el borrado físico de registros de préstamo que fueron ingresados por equivocación.

### User Persona
* **Nombre**: Alberto.
* **Necesidad**: Si se equivoca de socio al cargar un préstamo, poder borrarlo inmediatamente antes de que genere conflictos en el historial del socio real.

### Criterios de Aceptación
* Solo se permite el borrado físico de préstamos en estado "Loaned".
* **Restricción de Seguridad**: Solo se pueden borrar préstamos dentro de las primeras 24 horas de su creación para evitar alteraciones malintencionadas del historial.
* Requiere confirmación explícita del usuario.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)
* **Endpoint**: `DELETE /api/v1/equipment-loan/:id`
* **Response** (Success): 204 No Content

### Componentes de Arquitectura Hexagonal
* **Application**: `DeleteLoanUseCase` valida que `status === 'Loaned'` y que `createdAt` sea menor a 24hs antes de llamar al repositorio.
* **Infrastructure**: Método `delete` en `PostgresLoanRepository`.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Préstamo ya devuelto        | Mensaje: "No se puede eliminar un préstamo ya finalizado" | 400 Bad Request |
| Pasaron más de 24 horas     | Mensaje: "Tiempo límite para eliminación excedido" | 403 Forbidden |

## Plan de Implementación
1. Implementar la validación temporal en el caso de uso.
2. Crear el endpoint DELETE.
3. Añadir el botón de eliminar en la tabla de préstamos del frontend.