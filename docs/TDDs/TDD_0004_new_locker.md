---
id: 0004
estado: Propuesto
autor: Joaquin Rodriguez
fecha: 2026-04-30
titulo: Registro de Nuevo Locker
---


# TDD-0004: Registro de Nuevo Locker

## Contexto de Negocio (PRD)

### Objetivo
Eliminar el registro manual de los lockers del club en planillas de papel, permitiendo que un administrativo dé de alta un nuevo locker de forma digital, asegurando la unicidad del número y la integridad de los datos.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo)
*   **Necesidad**: Registrar de forma sencilla un locker en el sistema. No se deben repetir números de locker.

### Criterios de Aceptación
- El sistema debe validar que no haya un locker con el mismo número.
- El locker debe quedar guardado con estado 'Disponible' por defecto.
- El atributo miembro_id es null al crearse el objeto o con locker vacio.
- Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos
- `id`: Identificador único universal (UUID).
- `number`: Entero único autogenerado.
- `locacion`: Cadena de texto.
- `estadoLocker`: Enumeración (`Disponible`, `Ocupado`, `Mantenimiento`).
- `miembro_id`: Clave foránea de Miembro y puede ser null.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `POST /api/v1/lockers`
*   **Request Body**: CreateLockerRequest
```ts
{
    locacion: string;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: `LockerRepository` (Interface en el Dominio).
2. Caso de Uso: `CreateLocker` (Lógica que verifica que no exista un locker con el mismo `number` antes de persistir, y setea `estadoLocker` en `Disponible` y `miembro_id` en `null`).
3. Adaptador de Salida: DB persistence adapter (Implementación real en BD).
4. Adaptador de Entrada: `LockerController` (Ruta HTTP).

## Casos de Borde y Errores

| Escenario                          | Resultado Esperado                                       | Código HTTP               |
| ---------------------------------- | -------------------------------------------------------- | ------------------------- |
| Número de locker ya registrado     | Mensaje: "Ya existe un locker con ese número"            | 409 Conflict              |
| Location vacía o inválida          | Mensaje: "La ubicación es obligatoria"                   | 400 Bad Request           |
| Error de conexión a DB             | Mensaje: "Error interno, reintente más tarde"            | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto `LockerRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `CreateLocker`.
4. Crear formulario en React y conectar con el endpoint del backend.