---
id: 2003
estado: Pendiente
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Eliminación de Apto Médico (Eliminar Físico)
---

# TDD-2003: Eliminación de Apto Médico (Eliminar Físico)

## Contexto de Negocio (PRD)

### Objetivo
Permitir la remoción total de un certificado médico en el sistema en casos de subida errónea o documental fraudulenta.

### User Persona
* **Nombre**: Administrativo.
* **Necesidad**: Limpiar el historial de documentos del socio eliminando registros inválidos.

### Criterios de Aceptación
* El sistema debe eliminar físicamente el registro de la base de datos asociado al ID.
* La operación debe requerir el ID único del certificado.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `MedicalCertificate`. Se realizará un borrado a nivel de tabla.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `DELETE /api/v1/medical-certificate/{id}`
* **Request Body**: N/A

### Componentes de Arquitectura Hexagonal
* **Domain**: Sin reglas específicas más allá de la validación de existencia.
* **Application**: Caso de Uso `DeleteMedicalCertificate`. Puerto: `delete(id: string): Promise<void>`.
* **Infrastructure**: Ejecución del método `.delete()` provisto por Prisma para la entidad.

## Casos de Borde y Errores
| Escenario                               | Resultado Esperado                                                                 | Código HTTP               |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| Recurso inexistente                     | Mensaje: "No existe un certificado médico con ese ID"                              | 404 Not Found             |
| Certificado activo validado             | Mensaje: "No se puede eliminar un certificado activo y validado"                   | 409 Conflict              |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                                      | 500 Internal Server Error |

## Plan de Implementación
1. Implementar el método `delete` en `MedicalCertificateRepository`.
2. Exponer el endpoint DELETE en el controlador.
3. Implementar confirmación estricta en el frontend para evitar borrados accidentales.