---

id: 0013
estado: Propuesto
autor: Luca Giordani
fecha: 2026-05-01
titulo: Actualización de Sanción Disciplinaria
----------------------------------------------

# TDD-0013: Actualización de Sanción Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir modificar sanciones existentes asegurando la integridad de las fechas y la correcta asociación con el socio.

### User Persona

* Nombre: Alberto (Administrativo Deportivo).
* Necesidad: Corregir errores en sanciones registradas sin generar inconsistencias.

### Criterios de Aceptación

* El sistema debe validar que la sanción exista.
* El sistema debe validar que la fecha de fin sea posterior a la fecha de inicio.
* Al finalizar, el sistema debe mostrar un mensaje de éxito.

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Discipline` con las siguientes propiedades:

* `id`: Identificador único universal (UUID).
* `motivo`: Cadena de texto.
* `fechaInicio`: Fecha (datetime) de inicio.
* `fechaFin`: Fecha (datetime) de fin (debe ser posterior a `fechaInicio`).
* `esSuspensionTotal`: Booleano.
* `miembro_id`: UUID (clave foránea a Member).

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

* Endpoint: `PUT /api/v1/disciplines/{id}`
* Request Body (UpdateDisciplineRequest):

```ts
{
    motivo?: string;
    fechaInicio?: string; // ISO Date String (YYYY-MM-DD)
    fechaFin?: string; // ISO Date String (YYYY-MM-DD)
    esSuspensionTotal?: boolean;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: DisciplineRepository (Interface en el Dominio).
2. Caso de Uso: UpdateDiscipline (Lógica que valida existencia y fechas).
3. Adaptador de Salida: DB persistence adapter (Implementación real en BD).
4. Adaptador de Entrada: DisciplineController (Ruta HTTP).

## Casos de Borde y Errores

| Escenario               | Resultado Esperado                                           | Código HTTP               |
| ----------------------- | ------------------------------------------------------------ | ------------------------- |
| Sanción inexistente     | Mensaje: "Sanción no encontrada"                             | 404 Not Found             |
| fechaFin ≤ fechaInicio  | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Error de conexión a DB  | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Crear lógica de búsqueda previa por ID.
2. Validar fechas si se modifican.
3. Persistir cambios.
4. Conectar formulario de edición con backend.
