---
id: 0015
estado: Propuesto
autor: Luca Giordani
fecha: 2026-04-30
titulo: Consulta de Sanciones Disciplinarias
---

# TDD-0015: Consulta de Sanciones Disciplinarias

## Contexto de Negocio (PRD)

### Objetivo
Permitir a los administrativos visualizar el listado completo de sanciones/suspensiones aplicadas a los socios, así como acceder al detalle de una sancion específica, para poder gestionar el historial disciplinario desde el panel de administración.

### User Persona
- **Nombre:** Alberto (Administrativo del club).
- **Necesidad:** Ver de un vistazo todas las sanciones registradas en el sistema, a qué socio corresponden, sus fechas y si implican una suspensión total. También necesita poder consultar una sancion individual para precargar el formulario de edición.

### Criterios de Aceptación
- El sistema debe devolver el listado completo de sanciones existentes en la base de datos.
- El sistema debe permitir consultar una sancion por su `id`.
- Si la sancion solicitada no existe, debe devolver un error claro.
- La respuesta debe incluir todos los atributos de la sancion, incluido el `miembro_id`.
- El sistema debe permitir filtrar sanciones por socio.
- El sistema debe permitir identificar sanciones activas.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)
Se exponen dos endpoints de lectura: uno para el listado completo y otro para el detalle individual.

- **Endpoint (listado):** `GET /api/v1/disciplines`
- **Response 200 OK** (`DisciplineResponse[]`)

- **Endpoint (detalle):** `GET /api/v1/disciplines/:id`
- **Response 200 OK** (`DisciplineResponse`)

**Estructura de respuesta (`DisciplineResponse`):**
```ts
{
  id: string;
  motivo: string;
  fechaInicio: string;   // ISO Date String (YYYY-MM-DD)
  fechaFin: string;      // ISO Date String (YYYY-MM-DD)
  esSuspensionTotal: boolean;
  miembro_id: string;
}
```

### Componentes de Arquitectura Hexagonal
1. **Puerto:** `DisciplineRepository` (Métodos `obtenerTodos()` y `obtenerPorId(id)`).
2. **Caso de Uso:** `ObtenerDisciplinasUseCase` (Devuelve el listado completo) y `ObtenerDisciplinaPorIdUseCase` (Comprueba existencia y devuelve el detalle).
3. **Adaptador de Salida:** `PostgresDisciplineRepository` (Lectura usando los métodos `findMany` y `findUnique` de Prisma).
4. **Adaptador de Entrada:** `DisciplineController` (Rutas HTTP que devuelven los resultados serializados).

## Casos de Borde y Errores

| Escenario                                    | Resultado Esperado                            | Código HTTP               |
| -------------------------------------------- | ----------------------------------------------| --------------------------|
| Listado sin disciplinas cargadas             | Array vacío `[]`                              | 200 OK                    |
| Consulta exitosa de listado                  | Array con todas las disciplinas               | 200 OK                    |
| Consulta exitosa por `id`                    | Objeto con los datos de la disciplina         | 200 OK                    |
| Disciplina inexistente al consultar por `id` | Mensaje: "La disciplina solicitada no existe" | 404 Not Found             |
| Error de conexión a DB                       | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación
1. Crear el modelo de dominio `Discipline` y el puerto `DisciplineRepository` con los métodos `obtenerTodos` y `obtenerPorId`.
2. Implementar `PostgresDisciplineRepository` usando `findMany` y `findUnique` de Prisma.
3. Crear los casos de uso `ObtenerDisciplinasUseCase` y `ObtenerDisciplinaPorIdUseCase`.
4. Crear los endpoints `GET /api/v1/disciplines` y `GET /api/v1/disciplines/:id` en el `DisciplineController` y registrarlos en `app.ts`.
5. Añadir los métodos `obtenerTodos` y `obtenerPorId` al servicio Frontend (`disciplines.ts`).
6. Conectar la tabla principal en `DisciplinesView.tsx` para que consuma `obtenerTodos` al montarse.