---
id: 5001
estado: Pendiente
autor: Agustín Manrique
fecha: 2026-05-03
titulo: Alta de Sanción Disciplinaria (Crear)
---

# TDD-5001: Alta de Sanción Disciplinaria (Crear)

## Contexto de Negocio (PRD)

### Objetivo
Permitir al personal del club registrar sanciones disciplinarias aplicadas a socios, especificando el motivo, el período de vigencia y si implica una suspensión total, manteniendo un historial de las medidas aplicadas.

### User Persona
* **Nombre**: Personal del Club (Administrativo).
* **Necesidad**: Registrar sanciones disciplinarias indicando el motivo, las fechas de vigencia y si el socio queda totalmente suspendido o con una restricción parcial.

### Criterios de Aceptación
* El sistema debe validar que `end_date` sea estrictamente posterior a `start_date`.
* El sistema debe validar que el socio referenciado (`member_id`) exista.
* El campo `reason` no puede estar vacío.
* La sanción debe crearse con `is_active` en `true` por defecto.
* Al finalizar, el sistema debe guardar el registro y retornar los datos de la sanción creada.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Discipline`:
* `id`: String @id @default(uuid()) @db.Uuid
* `reason`: String
* `start_date`: DateTime @db.Date
* `end_date`: DateTime @db.Date
* `is_total_suspension`: Boolean @default(false)
* `is_active`: Boolean @default(true)
* `member_id`: String @db.Uuid (FK → Member)

### Contrato de API (@alentapp/shared)
* **Endpoint**: `POST /api/v1/disciplines`
* **Request Body** (CreateDisciplineRequest):
```ts
{
    reason: string;               // not empty
    start_date: string;           // YYYY-MM-DD
    end_date: string;             // YYYY-MM-DD
    is_total_suspension: boolean; // true: suspensión total, false: restricción parcial
    member_id: string;
}
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Entidad `Discipline`, regla de validación de fechas y presencia de motivo.
* **Application**: Caso de Uso `CreateDiscipline`. Puertos: `DisciplineRepository.save(discipline: Discipline)` y `MemberRepository.findById(id: string)`.
* **Infrastructure**: Implementación del repositorio con Prisma y `DisciplineController` para la ruta POST.

## Casos de Borde y Errores
| Escenario                              | Resultado Esperado                                                              | Código HTTP               |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| end_date igual o anterior a start_date | Mensaje: "La fecha de fin debe ser posterior a la de inicio"                    | 400 Bad Request           |
| member_id inexistente                  | Mensaje: "No existe un socio con ese ID"                                        | 404 Not Found             |
| reason vacío                           | Mensaje: "El motivo de la sanción no puede estar vacío"                         | 400 Bad Request           |
| Datos faltantes                        | Mensaje: "Los campos reason, start_date, end_date y member_id son obligatorios" | 400 Bad Request           |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"                                   | 500 Internal Server Error |

## Plan de Implementación
1. Agregar entidad `Discipline` al esquema de Prisma y correr migración.
2. Definir `DisciplineDTO` y `CreateDisciplineRequest` en `@alentapp/shared`.
3. Implementar el puerto `DisciplineRepository` en el dominio.
4. Implementar el caso de uso `CreateDiscipline` con las validaciones de negocio.
5. Implementar `PostgresDisciplineRepository` con Prisma.
6. Crear el endpoint `POST /api/v1/disciplines` en `DisciplineController` y registrarlo en `app.ts`.
