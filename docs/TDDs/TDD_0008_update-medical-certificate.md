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
