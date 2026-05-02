---
id: 0013
estado: Propuesto
autor: Alfredo Echeverria
fecha: 2026-05-01
titulo: Registro de Sanciones Disciplinarias
---

# TDD-0013: Registro de Sanciones Disciplinarias

## Contexto de Negocio (PRD)

### Objetivo

Digitalizar el registro de sanciones disciplinarias aplicadas a socios. Una sanción activa debe impedir que el socio realice cualquier operación dentro del sistema, como ingresar al club o inscribirse a actividades.

### User Persona

- Nombre: Maria (Equipo de Disciplina).
- Necesidad: Registrar sanciones asegurándose de que el sistema bloquee automáticamente al socio durante el período establecido.

### Criterios de Aceptación

- Como usuario quiero registrar una sancion sobre un socio existente.
- Como usuario quiero ver un mensaje de confirmacion al finalizar la carga. 

### Escenario de éxito

- Si el usuario completa todos los campos obligatorios con datos válidos, el sistema debe registrar la sanción y devolver una confirmación exitosa.

### Escenario de fallo

- Si el socio no existe, el sistema debe rechazar la operación e informar el conflicto.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Discipline` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `motivo`: Cadena de texto obligatoria que describe la causa de la sanción.
- `fecha_inicio`: Fecha y hora de inicio de la sanción.
- `fecha_fin`: Fecha y hora de finalización de la sanción.
- `es_suspension_total`: Valor booleano que indica si la sanción bloquea completamente al socio.
- `member_id`: Identificador del socio sancionado (UUID, clave foránea hacia `Member`).

### Contrato de API (@alentapp/shared)

- Endpoint: `POST /api/v1/discipline`
- Request Body (CreateDisciplineRequest):

```ts
{
    memberId: string;
    motivo: string;
    fechaInicio: string;
    fechaFin: string;
    esSuspensionTotal: boolean;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: DisciplineRepository (Interface en el Dominio).
2. Caso de Uso: CreateDiscipline (Lógica que valida fechas antes de persistir).
3. Adaptador de Salida: DB persistence adapter (Implementación real en BD).
4. Adaptador de Entrada: DisciplineController (Ruta HTTP).


## Casos de Borde y Errores

| Escenario                         | Resultado Esperado                                 | Código HTTP   |
| --------------------------------- | -------------------------------------------------- | ------------- |
| Socio inexistente                 | Mensaje: "El socio indicado no existe"             | 404 Not Found |
| Fecha fin anterior a fecha inicio | Mensaje: "Fecha de inicio posterior a fecha de fin"| 400 Bad Request |
| Error de conexión a DB            | Mensaje: "Error interno, reintente más tarde"      | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia y correr migración.
2. Crear tipos en shared y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso.
4. Crear formulario en React y conectar con el endpoint del backend.