---
id: 0013
estado: Propuesto
autor: [Maximo Carpignano]
fecha: 2026-04-30
titulo: Registro de Nuevos Deportes
---

# TDD-0013: Registro de Nuevos Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos registrar un nuevo deporte en el sistema de forma digital, asegurando que cada disciplina ofrecida por el club quede correctamente catalogada con su capacidad máxima, precio adicional y requisitos médicos desde el momento de su creación.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Dar de alta un nuevo deporte rápidamente para que los socios puedan inscribirse. No puede permitirse registrar un deporte con capacidad cero o negativa, ya que eso generaría inscripciones inválidas. Además, el nombre del deporte debe ser definitivo al momento de cargarlo, ya que es el identificador natural del mismo.

### Criterios de Aceptación

- El sistema debe validar que `name` sea único (no puede existir otro deporte con el mismo nombre).
- El sistema debe validar que `max_capacity` sea un número entero estrictamente mayor a cero.
- El sistema debe validar que `name` no esté vacío.
- Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.
- El deporte debe quedar guardado con todos sus campos correctamente persistidos.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto, único e indexado (UK). **Inmutable post-creación**.
- `description`: Cadena de texto, opcional.
- `max_capacity`: Entero, debe ser estrictamente mayor a cero.
- `additional_price`: Número de punto flotante, representa el costo adicional de inscripción.
- `requires_medical_certificate`: Booleano, indica si el deporte requiere certificado médico vigente para inscribirse.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización entre backend y frontend:

- **Endpoint**: `POST /api/v1/sports`
- **Request Body** (`CreateSportRequest`):

```ts
{
    name: string;
    description?: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Sport`. Regla de negocio: `max_capacity > 0`. Interfaz `SportRepository` con método `create(sport)` y `findByName(name)`.
- **Application**: Caso de uso `CreateSportUseCase`. Verifica unicidad del nombre vía `findByName` antes de persistir. Lanza excepción de dominio si ya existe o si `max_capacity <= 0`.
- **Infrastructure**: `PostgresSportRepository` (implementación de `SportRepository` usando Prisma). `SportController` (ruta HTTP `POST /api/v1/sports` en Fastify, mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                   | Resultado Esperado                                   | Código HTTP               |
| --------------------------- | ---------------------------------------------------- | ------------------------- |
| `name` ya registrado        | Mensaje: "Ya existe un deporte con ese nombre"       | 409 Conflict              |
| `max_capacity` igual a cero | Mensaje: "La capacidad máxima debe ser mayor a cero" | 400 Bad Request           |
| `max_capacity` negativo     | Mensaje: "La capacidad máxima debe ser mayor a cero" | 400 Bad Request           |
| `name` vacío o ausente      | Mensaje: "El nombre del deporte es obligatorio"      | 400 Bad Request           |
| Error de conexión a DB      | Mensaje: "Error interno, reintente más tarde"        | 500 Internal Server Error |

## Plan de Implementación

1. Definir los tipos `CreateSportRequest` y `SportResponse` en el paquete `@alentapp/shared`.
2. Crear la interfaz `SportRepository` en el Dominio con los métodos `create` y `findByName`.
3. Implementar `PostgresSportRepository` usando Prisma en la capa de Infraestructura.
4. Implementar `CreateSportUseCase` con validación de unicidad de nombre y de `max_capacity > 0`.
5. Crear el endpoint `POST /api/v1/sports` en `SportController` y registrarlo en `app.ts`.
6. Crear el formulario en React y conectarlo con el endpoint del backend.
