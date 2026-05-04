---
id: 0010
estado: En revisión
autor: Juan Bautista Flores
fecha: 2026-05-03
titulo: Registro de Nuevo Préstamo de Equipamiento
---

# TDD-0010: Registro de Nuevo Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Digitalizar y controlar la entrega de material y equipamiento deportivo del club, asegurando mediante validaciones del sistema que únicamente los socios con las categorías correspondientes puedan acceder a este beneficio.

### User Persona

- Nombre: Martin (Encargado de Pañol / Utilería).
- Necesidad: Necesita registrar rápidamente qué socio se lleva cada elemento (pelotas, conos, raquetas) para mantener el inventario controlado. No tiene tiempo para buscar manualmente en qué categoría está el socio, el sistema debe avisarle si está o no habilitado al momento de ingresar el DNI o ID.

### Criterios de Aceptación

- El sistema debe verificar obligatoriamente la categoría del socio antes de procesar el préstamo.
- El sistema debe permitir el préstamo únicamente a los socios con categoría "Senior" o "Lifetime".
- El sistema debe rechazar y bloquear la solicitud de préstamo si el socio pertenece a la categoría "Cadet".
- Al crearse, el préstamo debe inicializarse automáticamente con el status "Prestado".
- Se debe registrar la fecha y hora exacta del préstamo (fecha_prestado).

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `EquipmentLoan` con las siguientes propiedades y restricciones de acuerdo al DER:

- `id`: Identificador único universal (UUID).
- `item_nombre`: Cadena de texto, nombre del artículo prestado.
- `estado`: Enumeración (`Prestado`, `Devuelto`, `Dañado`).
- `fecha_prestado`: Fecha y hora (datetime) del momento de la entrega.
- `fecha_devolucion`: Fecha y hora (datetime) estipulada para la devolución.
- `member_id`: Identificador único universal (UUID), clave foránea que referencia al socio.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

- Endpoint: `POST /api/v1/equipment-loans`
- Request Body (CreateEquipmentLoanRequest):
```ts
{
    nombre_item: string;
    fecha_devolucion: string; 
    member_id: string;
}

### Componentes de Arquitectura Hexagonal

1. Puerto: EquipmentLoanRepository (Interface en el Dominio) y llamado a MemberRepository para consultar los datos del socio.
2. Caso de Uso: CreateEquipmentLoan (Lógica que obtiene el member_id, verifica si su category es "Senior" o "Lifetime" antes de instanciar el préstamo, y lanza un error si es "Cadet").
3. Adaptador de Salida: DB persistence adapter (Implementación real en DB con TypeORM/Prisma).
4. Adaptador de Entrada: EquipmentLoanController (Ruta HTTP).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                                    | Código HTTP               |
| -------------------------- | ---------------------------------------------------------------- ---- | ------------------------- |
| Socio es categoría Cadet   | Mensaje: "Los socios Cadet tiene prohibido solicitar material"        | 403 Forbidden             |
| Socio no existe            | Mensaje: "El socio referenciado no existe"                            | 404 Not Found             |
| Faltan datos obligatorios  | Mensaje: "El nombre del ítem y la fecha de devolución son requeridos" | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"                         | 500 Internal Server Error |

## Plan de Implementación

1. Definir la entidad EquipmentLoan y ejecutar la migración en la base de datos para crear la tabla con sus relaciones.
2. Crear los DTOs y tipos compartidos en @alentapp/shared.
3. Implementar la inyección del repositorio de socios dentro del caso de uso de préstamos para resolver la validación de la regla de negocio.
4. Implementar el endpoint POST y conectar la vista del frontend para el formulario de nuevo préstamo.