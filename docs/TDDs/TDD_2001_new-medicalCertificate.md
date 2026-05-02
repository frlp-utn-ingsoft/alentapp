---
id: 2001
estado: Pendiente
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Alta de Apto Médico (Crear)
---

# TDD-2001: Alta de Apto Médico (Crear)

## Contexto de Negocio (PRD)

### Objetivo
Registrar la documentación médica de los socios, asegurando que solo haya un certificado activo a la vez en el sistema.

### User Persona
* **Nombre**: Socio.
* **Necesidad**: Cargar su apto médico actualizado para poder inscribirse en los deportes.

### Criterios de Aceptación
* Al crear un nuevo certificado, el sistema guarda el registro y automáticamente invalida los certificados anteriores del socio.
* El sistema debe validar que la fecha de vencimiento sea posterior a la de emisión.
* El nuevo registro debe guardarse con el estado `is_validated` en false por defecto.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `MedicalCertificate`:
* `id`: String @id @default(uuid()) @db.Uuid.
* `issue_date`: DateTime @db.Date.
* `expiry_date`: DateTime @db.Date.
* `doctor_license`: String.
* `is_validated`: Boolean @default(false).
* `member_id`: String @db.Uuid.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `POST /api/v1/medical-certificate`
* **Request Body** (CreateMedicalCertificateRequest):
```ts
{
    issue_date: string;      // ISO 8601 (YYYY-MM-DD)
    expiry_date: string;     // ISO 8601 (YYYY-MM-DD), debe ser posterior a issue_date
    doctor_license: string;  // Matrícula del médico firmante
    member_id: string;       // UUID del socio
}
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Reglas lógicas de fechas y restricción de un solo certificado activo.
* **Application**: Caso de Uso `CreateMedicalCertificate`. Puertos: `save(certificate: MedicalCertificate)` e `invalidatePrevious(member_id: string)`.
* **Infrastructure**: Transacción en Prisma para realizar las dos acciones de manera atómica.

## Casos de Borde y Errores
| Escenario                            | Resultado Esperado                                                                       | Código HTTP               |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------- |
| Fechas incoherentes                  | Mensaje: "La fecha de vencimiento debe ser posterior a la de emisión"                    | 400 Bad Request           |
| `member_id` inexistente              | Mensaje: "No existe un socio con ese ID"                                                  | 404 Not Found             |
| `doctor_license` vacío o faltante    | Mensaje: "La matrícula del médico es requerida"                                           | 400 Bad Request           |
| Datos faltantes                      | Mensaje: "Los campos issue_date, expiry_date y member_id son obligatorios"               | 400 Bad Request           |
| Fallo en la transacción atómica      | Mensaje: "Error interno, reintente más tarde" (rollback automático)                      | 500 Internal Server Error |
| Error de conexión a DB               | Mensaje: "Error interno, reintente más tarde"                                            | 500 Internal Server Error |

## Plan de Implementación
1. Mapeo de la entidad en el esquema de Prisma y migración.
2. Implementación de una transacción atómica ($transaction) en el repositorio.
3. Exponer el endpoint de creación.