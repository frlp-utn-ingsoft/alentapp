---
autor: Fermin Etchanchú Paoltroni
fecha: 2026-05-03
titulo: Alta de Deportes
---

# TDD-0004: Alta de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir al área administrativa registrar el deporte maestro de servicios, definiendo sus condiciones básicas de uso y asegurando que la oferta del club quede cargada con cupo válido y sin duplicar nombres.

### User Persona

*   **Nombre**: Administrativo.
*   **Necesidad**: Dar de alta un deporte rápidamente para publicarlo en la oferta del club, sin cometer errores de carga en el nombre o en la capacidad máxima.

### Criterios de Aceptación

*   El sistema debe validar que `max_capacity` sea mayor a cero.
*   El sistema debe validar que `name` sea único.
*   El sistema debe guardar `description`, `additional_price` y `requires_medical_certificate` al crear el deporte.
*   El sistema debe devolver el deporte creado con su identificador.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto, único e inmutable despues de la creación.
- `description`: Cadena de texto.
- `max_capacity`: Entero positivo mayor a cero.
- `additional_price`: Número decimal.
- `requires_medical_certificate`: Booleano.

### Contrato de API (@alentapp/shared)

En `@alentapp/shared` se definirán los contratos para sincronizar frontend y backend.

- Endpoint: `POST /api/v1/sports`
- Request Body (CreateSportRequest):

```ts
{
    name: string;
    description: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: `SportRepository` con `create`, `findByName` y `findById`, más `SportValidator` para reglas de negocio.
*   **Application**: `CreateSportUseCase` para orquestar la validación y la persistencia.
*   **Infrastructure**: `PostgresSportRepository` como adaptador de salida.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                          | Código HTTP               |
| ---------------------------------| ----------------------------------------------------------- | ------------------------- |
| `max_capacity` menor o igual a 0 | Mensaje de validación: "La capacidad debe ser mayor a cero" | 400 Bad Request           |
| `name` duplicado                 | Mensaje: "Ya existe un deporte con ese nombre"              | 409 Conflict              |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"               | 500 Internal Server Error |

## Plan de Implementacion

1. Definir `CreateSportRequest` en `@alentapp/shared`.
2. Crear la entidad `Sport` y el `SportRepository` en `src/domain`.
3. Implementar `SportValidator` y `CreateSportUseCase` en `src/application`.
4. Agregar `SportController` en `src/delivery` y `PostgresSportRepository` en `src/infrastructure`.
5. Conectar el servicio `sports.ts` en `@alentapp/web`.
