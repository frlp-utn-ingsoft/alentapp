---
id: 2002
estado: Pendiente
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Validación de Apto Médico (Actualizar)
---

# TDD-2002: Validación de Apto Médico (Actualizar)

## Contexto de Negocio (PRD)

### Objetivo
Aprobar la validez de la documentación médica en el sistema, requisito obligatorio para la participación en actividades deportivas.

### User Persona
* **Nombre**: Administrativo.
* **Necesidad**: Revisar el documento físico o PDF subido y aprobar su validez en el sistema.

### Criterios de Aceptación
* El sistema debe cambiar el flag del certificado médico a validado (`is_validated = true`).
* Si el Socio intenta inscribirse a un deporte sin un certificado con estado validado, el sistema bloquea la acción.

## Diseño Técnico (RFC)

### Modelo de Datos
Modificación de la entidad existente `MedicalCertificate`.
* `is_validated`: Boolean que pasa a `true`.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `PATCH /api/v1/medical-certificate/{id}/validate`
* **Request Body** (ValidateMedicalCertificateRequest):
```ts
{} // Sin campos: la acción queda determinada por el endpoint
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Entidad `MedicalCertificate`.
* **Application**: Caso de Uso `ValidateMedicalCertificate`. Puerto: `validate(id: string): Promise<MedicalCertificate>`.
* **Infrastructure**: Adaptador que actualiza el booleano en la BD.

## Casos de Borde y Errores
| Escenario                               | Resultado Esperado                                                            | Código HTTP               |
| --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| Recurso inexistente                     | Mensaje: "No existe un certificado médico con ese ID"                         | 404 Not Found             |
| Certificado ya validado                 | Mensaje: "El certificado ya fue validado"                                     | 409 Conflict              |
| Certificado vencido (`expiry_date` pasada) | Mensaje: "No se puede validar un certificado con fecha de vencimiento pasada" | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                                 | 500 Internal Server Error |

## Plan de Implementación
1. Implementar método `validate` en el repositorio.
2. Crear controlador PATCH para procesar la validación.
3. Ajustar lógica de inscripción a deportes para chequear el `is_validated`.