---
id: 0019
estado: Propuesto
autor: Facundo Devida
fecha: 2026-05-02
titulo: Consultas y Listado de Préstamos
---

# TDD-0019: Consultas y Listado de Préstamos

## Contexto de Negocio (PRD)

### Objetivo

Permitir la visualización y auditoría de los préstamos registrados en el sistema, asegurando que el personal pueda consultar el estado del inventario prestado en tiempo real

### User Persona

- **Nombre**: Administrativo
- **Necesidad**: Consultar rápidamente el listado general de préstamos para saber qué materiales están fuera del club y cuándo deben regresar, así como acceder al detalle de un préstamo específico para revisar a qué socio corresponde o en qué estado se encuentra.

### Criterios de Aceptación

- El sistema debe omitir de los listados y consultas cualquier préstamo que haya sido eliminado lógicamente.
- El endpoint de listado debe devolver la colección de todos los préstamos activos o históricos válidos. Si no existe ningún registro, debe devolver una lista vacía sin arrojar error.
- El endpoint de detalle debe devolver la información completa y formateada de un único préstamo correspondiente al ID solicitado.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

**Endpoint 1: Listado General**

- **Endpoint:** `GET /api/v1/equipment-loans`
- **Request Body: `none`**
- **Response:** `EquipmentLoanResponse[]`.

**Endpoint 2: Detalle por ID**

- **Endpoint:** `GET /api/v1/equipment-loans/:id`
- **Request Body:** `none`
- **Response:** `EquipmentLoanResponse`

### Componentes de Arquitectura Hexagonal

- **Domain**:
    - La estructura de la entidad `EquipmentLoan` y el Value Object `EquipmentLoanStatus` son idénticos a los definidos en el documento base de creación.
- **Application**: [Casos de Uso, Puertos de Salida]
    - Se definen dos casos de uso simples: `GetAllEquipmentLoansUseCase` y `GetEquipmentLoanByIdUseCase`. Su función es orquestar la llamada al repositorio y transformar las entidades de dominio resultantes en `EquipmentLoanResponse` mediante un Mapper.
    - Puertos de Salida: Interfaz `IEquipmentLoanRepository`. Se requieren los métodos `findAll()` y `findById()`.
- **Infrastructure**: [Adaptadores, Controladores, Implementación de Repositorios]
    - Adaptadores de entrada: `EquipmentLoanController` exponiendo las rutas `GET /api/v1/equipment-loans` y `GET /api/v1/equipment-loans/:id`.
    - Adaptadores de salida: DB persistence adapter (Se reutiliza la implementacion definida en el Alta)

## Casos de Borde y Errores

| **Escenario** | **Resultado Esperado** | **Código HTTP** |
| --- | --- | --- |
| **Búsqueda por ID inexistente** | Mensaje: "El préstamo solicitado no fue encontrado." | 404 Not Found |
| **Búsqueda de un ID eliminado lógicamente** | Mensaje: "El préstamo solicitado no fue encontrado." | 404 Not Found |
| **Listado general sin registros en la DB** | Devuelve un array vacío: `[]` | 200 OK |
| **Formato de ID inválido en la URL** | Mensaje: "El formato del ID provisto en la URL no es válido." | 400 Bad Request |
| **Error de conexión a DB** | Mensaje: "Error interno del servidor, reintente más tarde." | 500 Internal Server Error |

## Plan de Implementación

1. Crear y exportar el DTO `EquipmentLoanResponse` en la librería `@alentapp/shared`.
2. Asegurar que `EquipmentLoanRepository` posea las firmas para los métodos `findAll()` y `findById()`.
3. Desarrollar `GetAllEquipmentLoans` y `GetEquipmentLoanById`. 
4. Modificar o extender el DB persistence adapter para que ejecute los `findAll` y `findById` en la Base de datos aplicando obligatoriamente el filtro para omitir el campo `deleted_at` .
5. Agregar los métodos correspondientes en el `EquipmentLoanController` para las rutas `GET`.