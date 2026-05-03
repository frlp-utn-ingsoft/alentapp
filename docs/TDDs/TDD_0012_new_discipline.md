---
id: 0012
estado: Propuesto
autor: Luca Giordani
fecha: 2026-05-01
titulo: Registro de Sanción Disciplinaria
---

# TDD-0012: Registro de Sanción Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Eliminar el registro manual de sanciones, permitiendo que un administrativo registre suspensiones o faltas de conducta de forma digital, asegurando la validez de las fechas y su correcta asociación a un socio.

### User Persona

* Nombre: Alberto (Administrativo Deportivo).
* Necesidad: Registrar sanciones rápidamente sin errores en fechas o asignación de socio, ya que impactan en el acceso del mismo a las actividades del club.

### Criterios de Aceptación

* El sistema debe validar que la fecha de fin sea estrictamente posterior a la fecha de inicio.
* El sistema debe validar que el socio exista.
* Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.
* La sanción debe quedar correctamente asociada al socio.
* Si la sanción se encuentra activa, el socio no podrá realizar acciones como inscripciones o accesos al club.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Discipline` con las siguientes propiedades y restricciones:

* `id`: Identificador único universal (UUID).
* `motivo`: Cadena de texto.
* `fechaInicio`: Fecha (datetime) de inicio.
* `fechaFin`: Fecha (datetime) de fin (debe ser posterior a `fechaInicio`).
* `esSuspensionTotal`: Booleano.
* `miembro_id`: UUID (clave foránea a Member).

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

* Endpoint: `POST /api/v1/disciplines`
* Request Body (CreateDisciplineRequest):

```ts
{
    motivo: string;
    fechaInicio: string; // ISO Date String (YYYY-MM-DD)
    fechaFin: string; // ISO Date String (YYYY-MM-DD)
    esSuspensionTotal: boolean;
    miembro_id: string;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: DisciplineRepository (Interface en el Dominio).
2. Caso de Uso: CreateDiscipline (Lógica que valida fechas y existencia del socio antes de persistir).
3. Adaptador de Salida: DB persistence adapter (Implementación real en BD).
4. Adaptador de Entrada: DisciplineController (Ruta HTTP).

## Casos de Borde y Errores

| Escenario               | Resultado Esperado                                           | Código HTTP               |
| ----------------------  | ------------------------------------------------------------ | ------------------------- |
| fechaFin ≤ fechaInicio  | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request           |
| Socio inexistente       | Mensaje: "Socio no encontrado"                               | 404 Not Found             |
| Datos incompletos       | Mensaje: "Datos inválidos"                                   | 400 Bad Request           |
| Error de conexión a DB  | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia y correr migración.
2. Crear tipos en shared y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso.
4. Crear formulario en React y conectar con el endpoint del backend.
