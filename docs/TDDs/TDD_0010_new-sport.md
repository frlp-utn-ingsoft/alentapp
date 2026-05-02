---
id: 0010
estado: Propuesto
autor: Juan Ignacio Piazza
fecha: 2026-05-02
titulo: Registro de Nuevos Deportes
---

# TDD-0010: Registro de Nuevos Deportes

## Contexto de Negocio (PRD)

### Objetivo

Digitalizar el registro de actividades deportivas ofrecidas por el club. Este registro verifica ser único e inmutable para cada deporte ofrecido.

### User Persona

- Nombre: Jorge (Administrativo).
- Necesidad: Registrar los deportes ofrecidos para luego poder llevar el registro de que socios practican que deportes. No debe poder existir más de una vez el mismo deporte, y una vez ingresado un deporte, no se debe poder renombrar el mismo.

### Criterios de Aceptación

- El sistema debe validar que el nombre sea único.
- El sistema debe validar que la capacidad maxima sea mayor a cero.
- Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto, único.
- `description`: Cadena de texto, describe el deporte.
- `max_capacity`: Capacidad de socios registrados en un dado momento. Debe ser mayor a cero.
- `additional_price`: Importe extra al costo de la cuota social. Debe ser cero o mayor a cero.
- `requires_medical_certificate`: Booleano. Registra si se requiere certificado medico para practicar dicho deporte.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

- Endpoint: `POST /api/v1/sports`
- Request Body (CreateSportRequest):
```ts
{
    name: string;
    description: string;
    max_capacity: string;
    additional_price?: float | null; // opcional, default: 0
    requires_medical_certificate: boolean;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: SportRepository (Interface en el Dominio).
2. Caso de Uso: CreateSport (Lógica que verifica si el nombre ya existe y si la capacidad maxima es mayor a 0 antes de llamar al repositorio).
3. Adaptador de Salida: DB persistence adapter (Implementación real en BD).
4. Adaptador de Entrada: SportController (Ruta HTTP).

## Casos de Borde y Errores

| Escenario                             | Resultado Esperado                                                            | Código HTTP               |
| ------------------------------------- | ----------------------------------------------------------------------------  | ------------------------- |
| Nombre ya registrado                  | Mensaje: "Ya existe un deporte con ese nombre"                                | 409 Conflict              |
| Capacidad máxima menor o igual a 0    | Mensaje: "Capacidad máxima inválida"                                          | 400 Bad Request           |
| Precio adicional menor a 0            | Mensaje: "El valor de precio adicional debe ser un numero igual o mayor a 0"  | 400 Bad Request           |
| Error de conexión a DB                | Mensaje: "Error interno, reintente más tarde"                                 | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia y correr migración: crear la tabla Sport con los campos correspondientes, incluyendo contraint `UNIQUE` para `name`, y correr la migración.
2. Crear tipos en shared y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso: Implementar lógica de para verificar que `max_capacity` sea mayor a cero y `additional_price` sea igual o mayor a cero.
4. Crear formulario en React y conectar con el endpoint del backend.
