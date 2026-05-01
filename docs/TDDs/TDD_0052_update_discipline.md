---
id: 0052
estado: Propuesto
autor: Tomas
fecha: 2026-05-01
titulo: Actualizacion de Sancion Disciplinaria
---

# TDD-0052: Actualizacion de Sancion Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir modificar una sancion disciplinaria existente cuando se detecta un error de carga o cuando el tribunal cambia las condiciones de la sancion.

La actualizacion debe mantener la consistencia temporal de la sancion, por lo que la regla `end_date > start_date` tambien debe validarse con los datos finales.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Corregir una sancion cargada con datos incorrectos o actualizar sus fechas, motivo o tipo de suspension cuando cambia la decision administrativa.

### Criterios de Aceptación

- El sistema debe validar que la sancion exista antes de modificarla.
- El sistema debe permitir actualizar uno, varios o todos los campos editables.
- Si se modifica `reason`, el valor no puede quedar vacio.
- Si se modifican fechas, el sistema debe validar que sean fechas validas.
- La regla `end_date > start_date` debe validarse usando la sancion resultante, no solo los campos enviados.
- Si la modificacion es correcta, debe retornar los datos actualizados de la sancion.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Todos los campos son opcionales porque se trata de una actualizacion parcial.

- Endpoint: `PUT /api/v1/disciplines/:id`
- Request Body (`UpdateDisciplineRequest`):

```ts
{
    reason?: string;
    startDate?: string; // ISO Date String
    endDate?: string; // ISO Date String
    isTotalSuspension?: boolean;
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
2. **Puerto**: `DisciplineRepository` (Metodos `findById(id)` y `update(id, data)`).
3. **Caso de Uso**: `UpdateDisciplineUseCase` (Busca la sancion, combina los datos actuales con los enviados y valida la regla de negocio).
4. **Adaptador de Salida**: `PostgresDisciplineRepository` (Actualizacion usando Prisma).
5. **Adaptador de Entrada**: `DisciplineController` (Ruta HTTP que extrae el `id` y devuelve la sancion actualizada).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                                | Código HTTP actual        |
| -------------------------- | ----------------------------------------------------------------- | ------------------------- |
| ID invalido                | Mensaje: "El id de la sancion no es valido"                      | 400 Bad Request           |
| Sancion inexistente        | Mensaje: "La sancion no existe"                                  | 404 Not Found             |
| Motivo vacio               | Mensaje: "El motivo de la sancion es obligatorio"                | 400 Bad Request           |
| Fechas invalidas           | Mensaje: "Las fechas ingresadas no son validas"                  | 400 Bad Request           |
| Fecha de fin invalida      | Mensaje: "La fecha de fin debe ser posterior a la de inicio"      | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"                    | 500 Internal Server Error |
| Actualizacion exitosa      | Datos actualizados de la sancion                                  | 200 OK                    |

## Plan de Implementación

1. Definir `UpdateDisciplineRequest` en `@alentapp/shared`.
2. Ampliar `DisciplineRepository` con los metodos `findById` y `update`.
3. Implementar la logica en `UpdateDisciplineUseCase`.
4. Validar la regla `endDate > startDate` con los datos finales de la sancion.
5. Implementar la actualizacion en `PostgresDisciplineRepository`.
6. Crear el endpoint `PUT /api/v1/disciplines/:id` en el `DisciplineController`.
7. Agregar la edicion de sanciones en el Frontend.
8. Agregar tests unitarios del caso de uso y tests de integracion del endpoint.
