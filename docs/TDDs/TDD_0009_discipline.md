---
id: 0009
estado: Propuesto
autor: Luciana Martino
fecha: 2026-05-03
titulo: Gestión de Disciplina
---

# TDD-0009: Gestión de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir registrar sanciones o suspensiones disciplinarias aplicadas a socios del club, indicando motivo, fecha de inicio, fecha de fin y si la suspensión es total.

La regla principal establece que `end_date` debe ser estrictamente posterior a `start_date`.

### User Persona

- **Nombre**: Alberto, administrativo del club.
- **Necesidad**: Registrar sanciones de socios y conocer durante qué período se encuentran suspendidos para evitar que participen de actividades no permitidas.

### Criterios de Aceptación

- El sistema debe permitir crear una disciplina/suspensión asociada a un socio.
- La fecha de fin debe ser posterior a la fecha de inicio.
- El sistema debe permitir indicar si la suspensión es total.
- El sistema debe permitir consultar sanciones por socio.
- El sistema debe permitir actualizar motivo, fechas y tipo de suspensión.
- No se deben aceptar períodos inválidos.

## Diseño Técnico (RFC)

### Modelo de Datos

Entidad `Discipline`:

- `id`: UUID, clave primaria.
- `reason`: String, motivo de la sanción.
- `start_date`: DateTime, fecha y hora de inicio.
- `end_date`: DateTime, fecha y hora de fin.
- `is_total_suspension`: Boolean.
- `member_id`: UUID, clave foránea a `Member`.

Restricciones:

- `member_id` debe existir.
- `reason` no debe estar vacío.
- `end_date` debe ser estrictamente mayor a `start_date`.

### Contrato de API (@alentapp/shared)

#### Crear disciplina

- **Endpoint**: `POST /api/v1/disciplines`

```ts
{
  memberId: string;
  reason: string;
  startDate: string;
  endDate: string;
  isTotalSuspension: boolean;
}

```
#### Actualizar disciplina

- **Endpoint**: PUT /api/v1/disciplines/:id

```ts

{
  reason?: string;
  startDate?: string;
  endDate?: string;
  isTotalSuspension?: boolean;
}

```
#### Listar disciplinas

- **Endpoint**: GET /api/v1/disciplines

```ts
{
  memberId?: string;
  activeOnly?: boolean;
}
```
### Componentes de Arquitectura Hexagonal

1. **Puerto**: DisciplineRepository. Métodos esperados: create(data), update(id, data), findById(id), findAll() y delete(id).
2. **Servicio de Dominio**: DisciplineValidator (Encargado de centralizar las validaciones propias de la entidad Discipline, especialmente validar que el motivo no esté vacío y validar que end_date sea estrictamente posterior a start_date.)
3. **Caso de Uso**: CreateDisciplineUseCase (creación de una nueva disciplina. Primero valida que el socio exista, luego utiliza DisciplineValidator para verificar las reglas de negocio y finalmente llama al repositorio para persistir la nueva disciplina.)
4. **Caso de Uso**: UpdateDisciplineUseCase (permite modificar una disciplina existente. Primero valida que la disciplina exista, luego aplica las validaciones correspondientes si se modifican las fechas o el motivo, y finalmente delega la actualización al repositorio.)
5. **Caso de Uso**: DeleteDisciplineUseCase (permite eliminar una disciplina existente. Primero comprueba existencia previa mediante findById y luego delega la eliminación al repositorio.)
6. **Adaptador de Salida**: PostgresDisciplineRepository (implementación real del puerto DisciplineRepository utilizando Prisma para persistir, consultar, actualizar y eliminar registros en PostgreSQL)
7. **Adaptador de Entrada**: DisciplineController (controlador HTTP que recibe las peticiones de Fastify, extrae el body o los params necesarios, llama al caso de uso correspondiente y mapea las excepciones a códigos HTTP.)

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                           | Código HTTP               |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| Socio inexistente                       | Mensaje: "El miembro no existe"                              | 400 Bad Request           |
| Motivo vacío                            | Mensaje: "El motivo de la sanción es obligatorio"            | 400 Bad Request           |
| Fecha de fin igual a fecha de inicio    | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Fecha de fin anterior a fecha de inicio | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Disciplina inexistente                  | Mensaje: "La disciplina no existe"                           | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |
| Creación exitosa                        | Retorna la disciplina creada                                 | 201 Created               |
| Actualización exitosa                   | Retorna la disciplina actualizada                            | 200 OK                    |
| Eliminación exitosa                     | Respuesta vacía                                              | 204 No Content            |

## Plan de Implementación

1. Definir el modelo Discipline en el archivo schema.prisma, incluyendo la relación con la entidad Member.
2. Generar y aplicar la migración correspondiente utilizando Prisma.
3. Crear los tipos compartidos en @alentapp/shared: CreateDisciplineRequest, UpdateDisciplineRequest y DisciplineResponse.
4. Crear el puerto DisciplineRepository con los métodos create, update, findById, findAll y delete.
5. Crear el servicio de dominio DisciplineValidator para validar motivo obligatorio y fechas válidas.
6. Implementar CreateDisciplineUseCase, validando existencia del socio y reglas de negocio antes de persistir.
7. Implementar UpdateDisciplineUseCase, validando existencia de la disciplina y reglas de negocio antes de actualizar.
8. Implementar DeleteDisciplineUseCase, verificando existencia previa antes de eliminar.
9. Implementar PostgresDisciplineRepository usando Prisma.
10. Crear DisciplineController con las rutas POST, PUT y DELETE.
11. Registrar las rutas de disciplina en la configuración principal de Fastify.
12. Consumir los endpoints desde el servicio de Frontend.
13. Crear o adaptar la vista de frontend para registrar, editar y eliminar disciplinas.
14. Agregar tests para validar creación exitosa, actualización exitosa, socio inexistente, disciplina inexistente, motivo vacío y fechas inválidas.


