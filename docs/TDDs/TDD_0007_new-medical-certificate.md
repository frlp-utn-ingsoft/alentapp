---
autor: [Valentina Pértile de la Vega]
fecha: [2026-05-01]
titulo: Create MedicalCertificate
---

# TDD-[0007]: Crear MedicalCertificate

## Contexto de Negocio (PRD)

### Objetivo

Registrar un certificado médico asegurando que solo exista uno activo por socio.

### User Persona

- **Nombre**: Administrativo del club
- **Necesidad**: Cargar certificados médicos y mantener vigente únicamente el más reciente.

### Criterios de Aceptación

- El sistema debe permitir crear un certificado con los campos: `issue_date`, `expiry_date`, `doctor_license` y `member_id`.
- El campo `is_invalidated` se establece automáticamente como false.
- Al crear un nuevo certificado, los anteriores del mismo socio deben pasar a `is_invalidated: true`.
- Solo puede existir un certificado activo por socio.
- `expiry_date` debe ser posterior a `issue_date`.

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

- **Endpoint**: `POST /api/v1/medical-certificates`
- **Request Body**:
```ts
{
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  member_id: string;
}
```

- **Response:** `201 Created`
- **Response Body**:
```ts
{
  id: string;
  issue_date: string;
  expiry_date: string;
  doctor_license: string;
  is_invalidated: boolean;
  member_id: string;
}
```

### Componentes de Arquitectura Hexagonal
- **Domain**: Regla de negocio: un solo certificado activo por socio.
- **Application**: Caso de uso `CreateMedicalCertificate`. Puerto de salida `MedicalCertificateRepository`.
- **Infrastructure**: `MedicalCertificateController` (POST) `PrismaMedicalCertificateRepository`.


## Casos de Borde y Errores
|Escenario| Resultado Esperado|Código HTTP|
|---|---|---|
|`member_id` inexistente|Error: miembro no encontrado | 404 Not Found|
|`expiry_date` < `issue_date`	|Error: fecha de vencimiento no válida | 400 Bad Request|

## Plan de Implementación

1. Definir DTO `CreateMedicalCertificateDto`
2. Validar fechas (`expiry_date` >= `issue_date`)
3. Verificar existencia del `member_id`
4. Buscar certificados activos del socio
5. Invalidarlos (`is_invalidated` = true)
6. Crear nuevo certificado (`is_invalidated` = false)
7. Persistir en base de datos
8. Retornar certificado creado

