---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Registro de Nueva Disciplina
---

# TDD-0015: Registro de Nueva Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre una sanción o disciplina aplicada a un socio, asegurando que las fechas sean coherentes (la fecha de fin debe ser estrictamente posterior a la de inicio), para mantener un historial de suspensiones y sanciones confiable.

### User Persona

- **Nombre**: administrativo
- **Necesidad**: Registrar sanciones o suspensiones a socios de forma rápida y sin errores de fechas. No puede cargar una disciplina con fecha de fin anterior a la de inicio.

### Criterios de Aceptación

- El sistema debe validar que `end_date` sea estrictamente posterior a `start_date`.
- El sistema debe asociar la disciplina a un socio existente mediante `member_id`.
- Al finalizar, el sistema debe retornar el registro creado con su `id` generado.
- Si el socio no existe, el sistema debe retornar un error claro.

## Diseño Técnico (RFC)

### Modelo de Datos

Se define la entidad `Discipline` con las siguientes propiedades:

- `id`: String, UUID, clave primaria autogenerada.
- `reason`: String, motivo de la sanción.
- `start_date`: DateTime, fecha y hora de inicio de la sanción.
- `end_date`: DateTime, fecha y hora de fin de la sanción (debe ser > `start_date`).
- `is_total_suspension`: Boolean, indica si es suspensión total.
- `member_id`: String, UUID, clave foránea hacia `Member`.

```prisma
model Discipline {
    id                  String   @id @default(uuid())
    reason              String
    start_date          DateTime
    end_date            DateTime
    is_total_suspension Boolean  @default(false)
    member_id           String
    member              Member   @relation(fields: [member_id], references: [id])

    @@map("disciplines")
}
```

### Contrato de API (@alentapp/shared)

- **Endpoint**: `POST /api/v1/disciplines`
- **Request Body**:

```ts
export interface CreateDisciplineRequest {
    reason: string;
    start_date: string; // ISO DateTime string
    end_date: string;   // ISO DateTime string, debe ser > start_date
    is_total_suspension: boolean;
    member_id: string;  // UUID del socio
}
```

- **Response Body** (`DisciplineDTO`):

```ts
export interface DisciplineDTO {
    id: string;
    reason: string;
    start_date: string;
    end_date: string;
    is_total_suspension: boolean;
    member_id: string;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Discipline`, interfaz `DisciplineRepository`, regla de negocio que valida `end_date > start_date`.
- **Application**: Caso de uso `CreateDiscipline` que valida fechas, verifica existencia del socio y persiste a través del repositorio.
- **Infrastructure**: `DisciplineRepositoryPrisma` (implementación del repositorio), `DisciplineController` (ruta HTTP POST).

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `end_date` igual a `start_date` | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| `end_date` anterior a `start_date` | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| `member_id` inexistente | Mensaje: "El socio no existe" | 404 Not Found |
| Campos obligatorios faltantes | Mensaje: "Faltan campos requeridos" | 400 Bad Request |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `Discipline` al `schema.prisma` y correr migración.
2. Definir `DisciplineDTO` y `CreateDisciplineRequest` en `@alentapp/shared`.
3. Crear interfaz `DisciplineRepository` en la capa de dominio.
4. Implementar caso de uso `CreateDiscipline` con validación de fechas.
5. Implementar `DisciplineRepositoryPrisma` en infraestructura.
6. Crear `DisciplineController` con la ruta `POST /api/v1/disciplines`.
