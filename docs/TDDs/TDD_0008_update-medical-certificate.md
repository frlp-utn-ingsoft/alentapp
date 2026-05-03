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
- `expiry_date` debe ser posterior a `issue_date`, incluso si se actualiza sólo uno de los campos.
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
| ` id ` inexistente 	| Error: certificado no encontrado	| 400 Bad Request| 
| ` expiry_date`  < ` issue_date` (validación directa)| Error: fecha de vencimiento no válida	| 400 Bad Request|
| Actualizar solo `issue_date` a una fecha posterior al vencimiento guardado en DB (validación cruzada) | Error: la fecha de emisión resultante no puede ser posterior al vencimiento actual | 400 Bad Request |


## Plan de Implementación
1. Definir DTO `UpdateMedicalCertificateDto` en `@alentapp/shared`
2. Implementar el endpoint `PATCH /api/v1/medical-certificates/:id` en `MedicalCertificateController`.
3. En el caso de uso `UpdateMedicalCertificate`:
   3.1. Buscar el certificado actual en la base de datos mediante el `id` recibido en los parámetros.
   3.2. Validar la existencia del certificado
4. Ejecutar validación de fechas:
   4.1. Determinar la **Fecha de Emisión Final**: si viene en el request, usar la nueva; si no, usar la almacenada en la BBDD.
   4.2. Determinar la **Fecha de Vencimiento Final**: si viene en el request, usar la nueva; si no, usar la almacenada en la BBDD.
   4.3. Validar que la **Fecha de Vncimiento Final** sea estrictamente posterior a la **Fecha de Emisión Final**.
5. Persistir actualización en base de datos mediante `MedicalCertificateRepository`
6. Retornar el certificado actualizado