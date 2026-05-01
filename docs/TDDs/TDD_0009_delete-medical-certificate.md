---
autor: [Valentina Pértile de la Vega]
fecha: [2026-05-01]
titulo: Delete MedicalCertificate
---

# TDD-[0009]: Eliminar MedicalCertificate

## Contexto de Negocio (PRD)

### Objetivo

Permitir eliminar un certificado médico del sistema.

### User Persona

- **Nombre**: Administrativo del club
- **Necesidad**: Eliminar certificados

### Criterios de Aceptación

- El sistema debe eliminar el certificado.
- El certificado debe existir para poder ser eliminado.
- No se deben modificar otros certificados del socio, solo el seleccionado.


## Diseño Técnico (RFC)

### Modelo de Datos

Entidad `MEDICAL_CERTIFICATE`:

- `id`: uuid (PK)
- `issue_date`: date
- `expiry_date`: date
- `doctor_license`: string
- `is_invalidated`: boolean
- `member_id`: uuid (FK → MEMBER)

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/medical-certificates/:id`

- **Response**:
```ts
{
  message: "Certificado médico borrado de manera exitosa"
}

```
`200 OK`

### Componentes de Arquitectura Hexagonal

- **Domain**: Eliminación de certificado.
- **Application**: Caso de uso `DeleteMedicalCertificate`. Puerto de salida `MedicalCertificateRepository`.
- **Infrastructure**: `MedicalCertificateController` (DELETE). `PrismaMedicalCertificateRepository`.

## Casos de Borde y Errores
| Escenario	|Resultado Esperado	|Código HTTP|
|---|---|---|
|id inexistente|	Error: certificado no encontrado|404 Not Found|

## Plan de Implementación

1. Definir método `delete(id: string)` en `MedicalCertificateRepository`
2. Recibir `id` desde los parámetros de la request en `MedicalCertificateController`
3. Validar formato del `id`
4. Invocar caso de uso `DeleteMedicalCertificate` desde el controller
5. 
   5.1. Buscar certificado por `id` en el repositorio  
   5.2. Validar que el certificado exista  
   5.3. Ejecutar eliminación del registro 
6. En `PrismaMedicalCertificateRepository`:
   6.1. Implementar método `delete` que elimine el registro en base de datos  
   6.2. Manejar posibles errores de persistencia  
7. Retornar respuesta desde el controller