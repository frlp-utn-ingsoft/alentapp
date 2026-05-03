---
id: 0017
estado: Propuesto
autor: Ignacio Williams
fecha: 2026-05-03
titulo: Eliminar un prestamo de equipamiento
---

# TDD-0017: Eliminacion de prestamo de equipamiento

## Contexto de Negocio (PRD)

### Objetivo
Permite eliminar un registro de prestamo de equipamiento de un socio, de esta forma el administrativo puede llevar la lista de registros sin prestamos duplicados o cargados erroneamente. 


### User Persona
- **Nombre**: Franco (Administrativo)
- **Necesidad**: Eliminar un registro de prestamo de equipamiento erroneo, irrelevante o de prueba de forma rapida desde la tabla principal.

### Criterios de Aceptación
- Como Administrativo quiero eliminar un prestamo asociado a un socio para llevar un registro limpio sin prestamos repetidos o erroneos.
- Como Administrativo quiero ver un mensaje de confirmacion cuando finalice la operacion para garantizar que la operacion se realizo correctamente.
- Como Administrativo quiero ver un mensaje de advertencia previo a confirmar la operacion debido a que se trata de una accion irremediable.

### Escenario de Exito
- Si el usuario intenta eliminar un prestamo mediante la seleccion en la lista de prestamos y confirma la operacion, entonces el sistema debe eliminar el prestamo de la base de datos e informar al usuario con un mensaje de exito y finalmente actualizar la tabla.

### Escenario de Fallo
- Si el usuario intenta eliminar un prestamo con un id no existente medianete la seleccion en la lista de prestamos y confirma la operacion, entonces el sistema debe rechazar la operacion y devolver un mensaje de error.


## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)
[Definición de endpoints y tipos compartidos.]

Como se trata de una operacion DELETE no requiere enviar todos los datos del prestamo, solo con el id del prestamo se debe poder efectuar la operacion.

- Endpoint: `DELETE /api/v1/equipment_loan/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de exito.

### Componentes de Arquitectura Hexagonal

1. Puerto: EquipmentLoanRepository (Metodo `delete(id)`).
2. Caso de Uso: `DeleteEquipmentLoan` (Comprueba existencia previa via `findById` y delega la eliminacion).
3. Adaptador de Salida: `PostgresEquipmentLoanRepository` (Eliminacion usando el metodo `delete` de Prisma).
4. Adaptador de Entrada: `EquipmentLoanController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Prestamo inexistente | Mensaje: "El prestamo seleccionado no existe" | 400 Bad Request |
| Eliminacion exitosa | Respuesta vacia | 204 No Content |
| Error en la Base de Datos | Mensaje: "Error al procesar la operacion, intente mas tarde" | 500 Internal Server Error |

## Plan de Implementación
1. Ampliar el `EquipmentLoanRepository` y `PostgresEquipmentLoanRepository` con el metodo `delete`.
2. Implementar la logica de negocio en `DeleteEquipmentLoanUseCase`.
3. Implementar el endpoint `Delete /api/v1/equipment_loan/:id` en el `EquipmentLoanController` y registrarlo en `app.ts`.
4. Agregar el metodo `delete` al servicio Frontend (`equipmentLoan.ts`).
5. Enlazar el boton de eliminacion en `EquipmentLoanView.tsx` agregando la configuracion del navegador (`window.confirm`) antes de hacer la llamada.