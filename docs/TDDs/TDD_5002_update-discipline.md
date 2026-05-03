---
id: 5002
estado: Pendiente
autor: Agustín Manrique
fecha: 2026-05-03
titulo: Modificación de Sanción Disciplinaria (Actualizar)
---

# TDD-5002: Modificación de Sanción Disciplinaria (Actualizar)

## Contexto de Negocio (PRD)

### Objetivo
Permitir al personal del club modificar los datos de una sanción disciplinaria existente, como el motivo, las fechas de vigencia o el tipo de suspensión, manteniendo las mismas reglas de validación que en la creación.

### User Persona
* **Nombre**: Personal del Club (Administrativo).
* **Necesidad**: Corregir o actualizar los datos de una sanción disciplinaria ya registrada en el sistema.

### Criterios de Aceptación
* El sistema debe validar que la sanción a modificar exista.
* Si se modifican las fechas, `end_date` debe seguir siendo estrictamente posterior a `start_date`.
* Si se modifica `reason`, no puede quedar vacío.
* Todos los campos son opcionales (actualización parcial).
* Al finalizar, el sistema debe retornar los datos actualizados de la sanción.

## Diseño Técnico (RFC)

### Modelo de Datos
Sin cambios en Prisma. Se actualizan campos existentes de `Discipline`.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `PUT /api/v1/disciplines/:id`
* **Request Body** (UpdateDisciplineRequest):
```ts
{
    reason?: string;               // not empty
    start_date?: string;           // YYYY-MM-DD
    end_date?: string;             // YYYY-MM-DD
    is_total_suspension?: boolean; // true: suspensión total, false: restricción parcial
}
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Entidad `Discipline`, reutilización de las reglas de validación de fechas y presencia de motivo.
* **Application**: Caso de Uso `UpdateDiscipline`. Puerto: `DisciplineRepository.update(id: string, data: UpdateDisciplineRequest)`.
* **Infrastructure**: Implementación de la actualización con Prisma y `DisciplineController` para la ruta PUT.

## Casos de Borde y Errores
| Escenario                              | Resultado Esperado                                           | Código HTTP               |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| Sanción inexistente                    | Mensaje: "No existe una sanción con ese ID"                  | 404 Not Found             |
| end_date igual o anterior a start_date | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| reason vacío                           | Mensaje: "El motivo de la sanción no puede estar vacío"      | 400 Bad Request           |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación
1. Definir `UpdateDisciplineRequest` en `@alentapp/shared`.
2. Agregar método `update(id, data)` al puerto `DisciplineRepository`.
3. Implementar el caso de uso `UpdateDiscipline` reutilizando las validaciones del dominio.
4. Implementar el método `update` en `PostgresDisciplineRepository`.
5. Crear el endpoint `PUT /api/v1/disciplines/:id` en `DisciplineController`.
