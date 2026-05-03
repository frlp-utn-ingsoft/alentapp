## autor: Facundo Devida
fecha: 2026-05-02
titulo: Actualizacion de Prestamo de equipamiento existente

# TDD-0017: Actualizacion de Prestamos de equipamiento existente

## Contexto de Negocio (PRD)

### Objetivo

Permitir la actualizacion de los detalles del prestamo de equipamiento para que se refleje con certeza la realidad fisica del equipamiento

### User Persona

- **Nombre**: Administrativo
- **Necesidad**: Registrar rapidamente cuando un socio devuelve el material para asentar si el equipo fue devuelto con daños para asi reponerlo, o corregir un prestamo existente por algun error de tipeo cometido al momento de la creacion

### Criterios de Aceptación

- El sistema debe validar que la nueva fecha ingresada sea futura a la fecha de prestamo
- El sistema debe permitir cambiar el estado de `Prestado` a `Devuelto` o `Dañado` para finalizar el préstamo
- Si un prestamo ya se encuentra finalizado (Retuned o Damaged), el sistema debe permitir alternar entre estos para corregir errores de carga manual
- El sistema no debe permitir que un prestamo con estado Returned o Damaged vuelva al estado inicial Loaned para prevenir inconsistencias en los datos de la entidad. Si un socio quiere el material nuevamente se debe generar un nuevo prestamo.
- Una vez que el préstamo pasa a un estado final (`Devuelto` o `Dañado`), el sistema debe bloquear la edición de los campos `item_name` y `due_date`. Solo se permitirá modificar el campo `status` para correcciones.
- Al finalizar, el sistema debe mostrar un mensaje de exito y retornar los datos actualizados

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- **Endpoint**: `PUT /api/v1/equipment-loans/:id`
- **Request Body**:

```tsx
{
    item_name?: string;
    due_date?: string;
    status?: 'Prestado' | 'Devuelto' | 'Dañado';
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**:
    - La estructura de la entidad `EquipmentLoan` y el Value Object `EquipmentLoanStatus` son idénticos a los definidos en el documento base de creación
    - Reglas de Negocio(Transicion de estados): Solo permitir cambiar el estado de `Prestado` a `Devuelto` o `Dañado`y transicionar entre estos ultimos dos. Bloquear el retorno a `Prestado` y congelar la edición de los campos `item_name` y `due_date` si el préstamo ya está finalizado(`Devuelto` o `Dañado`)."
- **Application**:
    - Caso de Uso: UpdateEquipmentLoan (Busca el prestamo existente, aplica las reglas de transicion de estados, bloquea los campos correspondientes si es necesario y persiste la entidad modificada utilizando `EquipmentLoanRepository`)
    - Puertos de Salida: `EquipmentLoanRepository` (Interface de dominio, de la cual necesitamos el metodo `findById()` y `update()`)
- **Infrastructure**:
    - Adaptadores de entrada: `EquimentLoanController` utilizando su ruta `PUT /api/v1/equipment-loans/:id`
    - Adaptadores de salida: DB persistence adaptor (Se reutiliza la implementacion definida en el Alta)

## Casos de Borde y Errores

| **Escenario** | **Resultado Esperado** | **Código HTTP** |
| --- | --- | --- |
| **Préstamo inexistente o eliminado** | Mensaje: "El préstamo que intenta actualizar no existe en el sistema." | 404 Not Found |
| **Regresión de estado prohibida** | Mensaje: "No se puede cambiar el estado a '`Prestado`' si el préstamo ya fue finalizado." | 409 Conflict |
| **Edición de histórico bloqueada** | Mensaje: "No se pueden modificar datos (item_name, due_date) de un préstamo ya cerrado." | 409 Conflict |
| **Nueva fecha en el pasado** | Mensaje: "La nueva fecha de devolución debe ser posterior a la fecha actual." | 400 Bad Request |
| **Formato de ID inválido** | Mensaje: "El parámetro ID de la URL no tiene un formato válido." | 400 Bad Request |
| **Error de conexión a DB** | Mensaje: "Error interno del servidor, reintente más tarde." | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar `@alentapp/shared` para incluir el tipo de petición `UpdateEquipmentLoanRequest`
2. Crear un servicio de dominio `EquipmentLoanDomainService` para validar las reglas de transición de estado.
3. Asegurar que `EquipmentLoanRepository` incluya los métodos necesarios para esta operación: `findById()` y `update()`
4. Desarrollar el caso de uso `UpdateEquipmentLoan`
5. Implementar de manera concreta en el DB persistence adapter el `UPDATE`en la base de datos
6. Implementar el endpoint `PUT /api/v1/equipment-loans/:id` en el controlador `EquipmentLoanController`