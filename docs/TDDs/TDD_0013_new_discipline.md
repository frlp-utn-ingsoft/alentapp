---
id: 0013
estado: Aprobado
autor: Luciana Martino
fecha: 2026-05-03
titulo: Registro de Disciplina
---

# TDD-0019: Registro de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos registrar sanciones o suspensiones disciplinarias aplicadas a socios del club, indicando el motivo, la fecha de inicio, la fecha de fin y si la suspensión es total.

El objetivo es contar con un registro confiable de las sanciones vigentes o históricas de cada socio, evitando que se carguen períodos inválidos que puedan generar errores al momento de controlar la participación en actividades del club.

### User Persona

*   **Nombre**: Alberto
*   **Rol**: Administrativo del club
*   **Necesidad**: Registrar sanciones disciplinarias de socios y conocer durante qué período se encuentran suspendidos para evitar que participen en actividades no permitidas.

### Criterios de Aceptación

*   El sistema debe permitir crear una disciplina o suspensión asociada a un socio existente.
*   El sistema debe validar que el socio exista antes de crear la disciplina.
*   El sistema debe validar que el motivo de la sanción no esté vacío.
*   El sistema debe validar que `start_date` sea una fecha válida.
*   El sistema debe validar que `end_date` sea una fecha válida.
*   El sistema debe validar que `end_date` sea estrictamente posterior a `start_date`.
*   El sistema debe permitir indicar si la suspensión es total.
*   Si la creación es correcta, debe retornar los datos de la disciplina creada.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Discipline` con las siguientes propiedades y restricciones:

*   `id`: UUID. Identificador único de la disciplina.
*   `reason`: String. Motivo de la sanción. Obligatorio.
*   `start_date`: DateTime. Fecha y hora de inicio de la sanción.
*   `end_date`: DateTime. Fecha y hora de fin de la sanción. Debe ser estrictamente posterior a `start_date`.
*   `is_total_suspension`: Boolean. Indica si la suspensión es total.
*   `member_id`: UUID. Clave foránea asociada a `Member`. Debe referenciar a un socio existente.
*   `created_at`: DateTime. Fecha de creación del registro.
*   `updated_at`: DateTime. Fecha de última actualización.

Regla de negocio principal:

*   `end_date` debe ser estrictamente posterior a `start_date`.

Relación principal:

*   Un `Member` puede tener muchas disciplinas.
*   Una `Discipline` pertenece a un único `Member`.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `POST /api/v1/disciplines`
*   **Request Body**: `CreateDisciplineRequest`

```ts
{
    memberId: string;
    reason: string;
    startDate: string; // ISO DateTime String
    endDate: string; // ISO DateTime String
    isTotalSuspension: boolean;
}
```
**Response esperada**: 201 Created

```ts
{
    id: string;
    memberId: string;
    reason: string;
    startDate: string;
    endDate: string;
    isTotalSuspension: boolean;
    createdAt: string;
    updatedAt: string;
}
```
## Componentes de Arquitectura Hexagonal

1. **Domain**:
    - Entidad Discipline.
    - Servicio DisciplineValidator.
    - Regla de negocio: end_date debe ser estrictamente posterior a start_date.
    - Validación de motivo obligatorio.
2. **Application**:
    - Puerto DisciplineRepository.
    - Puerto MemberRepository para validar existencia del socio.
    - Caso de uso CreateDisciplineUseCase.
    - Validación de reglas de negocio antes de persistir.
3. **Infrastructure**:
    - Adaptador de salida PostgresDisciplineRepository.
    - Implementación con Prisma.
    - Controlador DisciplineController.
    - Ruta POST /api/v1/disciplines.
    - Mapeo de errores de dominio a códigos HTTP.

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                           | Código HTTP               |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| Socio inexistente                       | Mensaje: "El miembro no existe"                              | 400 Bad Request           |
| Motivo vacío                            | Mensaje: "El motivo de la sanción es obligatorio"            | 400 Bad Request           |
| Fecha de inicio inválida                | Mensaje: "La fecha de inicio no es válida"                   | 400 Bad Request           |
| Fecha de fin inválida                   | Mensaje: "La fecha de fin no es válida"                      | 400 Bad Request           |
| Fecha de fin igual a fecha de inicio    | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Fecha de fin anterior a fecha de inicio | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |
| Creación exitosa                        | Retorna la disciplina creada                                 | 201 Created               |

## Plan de Implementación

1. Definir el modelo Discipline en schema.prisma.
2. Crear la relación entre Discipline y Member.
3. Generar y aplicar la migración correspondiente.
4. Crear los tipos compartidos CreateDisciplineRequest y DisciplineResponse.
5. Crear el puerto DisciplineRepository.
6. Implementar el método create(data) en PostgresDisciplineRepository.
7. Crear el servicio de dominio DisciplineValidator.
8. Implementar validación de motivo obligatorio.
9. Implementar validación estricta de fechas: endDate > startDate.
10. Implementar CreateDisciplineUseCase.
11. Validar existencia del socio mediante MemberRepository.
12. Crear el endpoint POST /api/v1/disciplines.
13. Crear el formulario de alta en frontend.
14. Agregar tests para creación exitosa, socio inexistente, motivo vacío y fechas inválidas.