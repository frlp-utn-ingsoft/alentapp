---
autor: [Valentina Pértile de la Vega]
fecha: [2026-05-01]
titulo: Update MedicalCertificate
---

# TDD-[0008]: Actualizar MedicalCertificate

## Contexto de Negocio (PRD)

### Objetivo

Permitir cambiar los datos de un certificado médico existente.

### User Persona

- **Nombre**: Administrativo del club
- **Necesidad**: Corregir/actualizar información del certificado.

### Criterios de Aceptación

- El sistema debe permitir actualizar los campos `issue_date`, `expiry_date` y `doctor_license`.
- El certificado debe existir para poder ser actualizado.
- `expiry_date` debe ser posterior a `issue_date`.
- No se debe modificar el campo `member_id`.
- No se debe modificar el campo `is_invalidated`.


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

- **Endpoint**: `PATCH /api/v1/medical-certificates/:id`

- **Request Body**:
```ts
{
  issue_date?: string;
  expiry_date?: string;
  doctor_license?: string;
}
```

- **Response**:
{
  id: string;
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  is_invalidated: boolean;
  member_id: string;
}

`200 OK` con el certificado médico actualizado

### Componentes de Arquitectura Hexagonal

- **Domain**: Validación de fechas (`expiry_date` > `issue_date`).
- **Application**: Caso de uso `UpdateMedicalCertificate`. Puerto de salida `MedicalCertificateRepository`.
- **Infrastructure**: `MedicalCertificateController` (PATCH). `PrismaMedicalCertificateRepository`.


## Casos de Borde y Errores
|Escenario	|Resultado Esperado|	Código HTTP|
|---|---|---|
| ` id ` inexistente 	| Error: certificado no encontrado	| 404 Not Found| 
| ` expiry_date`  < ` issue_date` 	| Error: fecha de vencimiento no válida	| 400 Bad Request|


## Plan de Implementación
1. Definir DTO `UpdateMedicalCertificateDto` en `@alentapp/shared`
2. Recibir `id` desde parametros y datos desde el request body
3. Buscar certificado por `id` en el repositorio
4. Validar que el certificado exista
5. Validar fechas solo si se envían en el request:
   - Si vienen ambas → verificar `expiry_date > issue_date`
   - Si viene una sola → validar contra el valor existente
6. Construir objeto con los campos a actualizar (`issue_date`, `expiry_date`, `doctor_license`)
7. Aplicar cambios al certificado
8. Persistir actualización en base de datos mediante `MedicalCertificateRepository`
9. Retornar el certificado actualizado