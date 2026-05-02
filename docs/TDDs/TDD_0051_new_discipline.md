---
id: "0051"
estado: Propuesto
autor: Tomas
fecha: 2026-05-01
titulo: Alta de Sancion Disciplinaria
---

# TDD-0051: Alta de Sancion Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir registrar una nueva sancion disciplinaria para un socio del Club Alentapp. La sancion indica el motivo, el periodo de vigencia y si corresponde a una suspension total.

Este TDD es necesario porque una sancion activa puede condicionar otras acciones del sistema, como la inscripcion a deportes o el ingreso al club.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Registrar sanciones disciplinarias aplicadas a socios para que el sistema pueda consultar luego si un socio tiene restricciones vigentes.

### Criterios de Aceptación

- El sistema debe validar que el socio exista antes de crear la sancion.
- El sistema debe validar que el motivo de la sancion no este vacio.
- El sistema debe validar que `start_date` y `end_date` sean fechas validas.
- La regla de negocio principal indica que `end_date` debe ser estrictamente posterior a `start_date`.
- El sistema debe registrar si la sancion corresponde a una suspension total.
- Si la carga es correcta, debe crear la sancion y devolver sus datos.

## Diseño Técnico (RFC)

### Modelo de Datos

Entidad `Discipline`:

- `id`: UUID, clave primaria.
- `reason`: string, requerido.
- `start_date`: DateTime, requerido.
- `end_date`: DateTime, requerido.
- `is_total_suspension`: boolean, requerido.
- `member_id`: UUID, foreign key hacia `Member`.

### Contrato de API (@alentapp/shared)

- Endpoint: `POST /api/v1/disciplines`
- Request Body (`CreateDisciplineRequest`):

```ts
{
    reason: string;
    startDate: string; // ISO Date String
    endDate: string; // ISO Date String
    isTotalSuspension: boolean;
    memberId: string;
}
```

- Response (`DisciplineResponse`):

```ts
{
    id: string;
    reason: string;
    startDate: string;
    endDate: string;
    isTotalSuspension: boolean;
    memberId: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Entidad de Dominio**: `Discipline` (Valida motivo y consistencia de fechas).
2. **Puerto**: `DisciplineRepository` (Metodo `create(discipline)`).
3. **Puerto**: `MemberRepository` (Metodo `findById(id)` para verificar la existencia del socio).
4. **Caso de Uso**: `CreateDisciplineUseCase` (Valida datos, verifica socio y delega la persistencia).
5. **Adaptador de Salida**: `PostgresDisciplineRepository` (Creacion usando Prisma).
6. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP que recibe el body y devuelve status 201).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                           | Código HTTP actual        |
| -------------------------- | ------------------------------------------------------------ | ------------------------- |
| Datos faltantes            | Mensaje: "Faltan campos requeridos"                         | 400 Bad Request           |
| Motivo vacio               | Mensaje: "El motivo de la sancion es obligatorio"           | 400 Bad Request           |
| Fechas invalidas           | Mensaje: "Las fechas ingresadas no son validas"             | 400 Bad Request           |
| Fecha de fin invalida      | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Socio inexistente          | Mensaje: "El socio especificado no existe"                  | 404 Not Found             |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"               | 500 Internal Server Error |
| Creacion exitosa           | Datos de la sancion creada                                   | 201 Created               |

## Plan de Implementación

1. Definir `CreateDisciplineRequest` y `DisciplineResponse` en `@alentapp/shared`.
2. Crear la migracion de Prisma para la tabla `Discipline`.
3. Crear la entidad de dominio `Discipline` con la regla `endDate > startDate`.
4. Crear el puerto `DisciplineRepository` con el metodo `create`.
5. Reutilizar `MemberRepository.findById` para validar que el socio exista.
6. Implementar `CreateDisciplineUseCase`.
7. Implementar `PostgresDisciplineRepository`.
8. Crear el endpoint `POST /api/v1/disciplines` en el `DisciplineController` y registrarlo en `app.ts`.
9. Agregar el formulario de alta de sancion en el Frontend.
10. Agregar tests unitarios del caso de uso y tests de integracion del endpoint.
