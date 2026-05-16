---
id: 0015
estado: Propuesto
autor: Noval Leandro Andrés
fecha: 2026-05-03
titulo: Registro de Nuevos Certificados Médicos
---

# TDD-0015: Registro de Nuevos Certificados Médicos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir que el personal administrativo registre el certificado médico de un socio en el sistema. Este documento es el respaldo legal indispensable para que el socio pueda realizar actividades físicas en el club. Para garantizar la vigencia de la aptitud física, el sistema debe asegurar que solo exista un certificado activo por socio.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Cargar la información del certificado médico de un socio y dejarlo disponible para su posterior validación.

### 1.3. Criterios de Aceptación

* Como administrador, quiero registrar un nuevo certificado médico para un socio asegurando su validez.
    - Escenario de éxito: "Si el usuario completa los datos correctamente y el socio existe, el sistema registra el certificado con `status = 'in_review'`".
    - Escenario de fallo: "Si la fecha de vencimiento es anterior o igual a la de emisión, el sistema debe bloquear la acción y notificar el error".
    - Escenario de fallo: "Si el socio indicado no existe, el sistema debe cancelar la operación y mostrar un error".

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se definirá la entidad `MedicalCertificate` con las siguientes propiedades:

* `id`: Identificador único universal (UUID).
* `issue_date`: Fecha de emisión.
* `expiry_date`: Fecha de vencimiento (debe ser > `issue_date`).
* `doctor_license`: Cadena de texto (Matrícula del médico).
* `institution`: Cadena de texto (Institución que emite).
* `status`: Estado del certificado (`in_review`, `validated`, `historical`).
* `deleted_at`: Fecha de baja lógica (opcional). Si es `null`, el certificado es visible/consultable.
* `member_id`: Identificador del socio asociado al certificado.

Definición operativa:

* Certificado **activo**: `status = 'validated'` y `deleted_at = null`.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `POST /api/v1/medical-certificates`
* **Request Body**:

```ts
{
    issue_date: string; // ISO Date (YYYY-MM-DD)
    expiry_date: string; // ISO Date (YYYY-MM-DD)
    doctor_license: string;
    institution: string;
    member_id: string;
}
```

* **Response (Success)**: `201 Created`
* **Response Body**: `MedicalCertificateResponseDTO`

```ts
type MedicalCertificateStatus = 'in_review' | 'validated' | 'historical';

type MedicalCertificateResponseDTO = {
  id: string;
  member_id: string;
  issue_date: string; // ISO Date (YYYY-MM-DD)
  expiry_date: string; // ISO Date (YYYY-MM-DD)
  doctor_license: string;
  institution: string;
  status: MedicalCertificateStatus;
  deleted_at: string | null; // ISO DateTime
};

type ErrorResponse = {
  message: string;
};
```

### 2.3. Esquema de Persistencia

```prisma
enum MedicalCertificateStatus {
  in_review
  validated
  historical
}

model MedicalCertificate {
  id             String   @id @default(uuid())
  issue_date     DateTime
  expiry_date    DateTime
  doctor_license String
  institution    String
  status         MedicalCertificateStatus @default(in_review)
  deleted_at     DateTime?
  member_id      String
  member         Member   @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `MedicalCertificateRepository` con método `save(certificate)`.
* **Adaptador de Entrada (Delivery)**: `MedicalCertificateController`, recibe la request HTTP y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresMedicalCertificateRepository`, implementa la persistencia con Prisma.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `CreateMedicalCertificateUseCase`.
1. Validar que el `member_id` exista.
2. Validar que `expiry_date` > `issue_date`.
3. Crear el nuevo registro con `status = 'in_review'` y `deleted_at = null`.
4. Retornar el nuevo certificado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Socio inexistente | Error: Socio no encontrado | 404 Not Found |
| Fechas inválidas | Error: Fecha de vencimiento inválida | 400 Bad Request |
| Datos faltantes | Error: Campos obligatorios faltantes | 400 Bad Request |
| Error de conexión | Error interno del servidor | 500 Internal Server Error |
| Registro exitoso | El certificado es creado con estado `in_review` | 201 Created |

## 5. Plan de Implementación

1. Definir el tipo `CreateMedicalCertificateRequest` en `@alentapp/shared`.
2. Crear el esquema en Prisma y ejecutar la migración.
3. Implementar la interfaz `MedicalCertificateRepository` en el Dominio.
4. Desarrollar `CreateMedicalCertificateUseCase`.
5. Implementar el repositorio en la capa de Infraestructura.
6. Crear el controlador y exponer el endpoint `POST`.
7. Ejecutar pruebas unitarias y de integración.

## 6. Observaciones Adicionales

* Todos los certificados nuevos deben iniciar con `status = 'in_review'`.
* La regla de negocio de la consigna se garantiza al **validar** un certificado: solo puede existir 1 certificado `validated` por socio; al pasar uno a `validated`, los anteriores `validated` pasan a `historical` en una misma transacción (ver TDD-0016).
* El alta permite cargar certificados vencidos o históricos siempre que `expiry_date` > `issue_date`. La aptitud "activa" se determina al validar (ver TDD-0016).
* Nota frente a la consigna: aunque la consigna menciona invalidar certificados previos al crear uno nuevo, en este diseño la invalidación masiva ocurre al validar (TDD-0016) para no dejar al socio sin certificado activo durante la revisión.
* Consultas típicas:
  * Visibles: `deleted_at = null`.
  * En revisión: `deleted_at = null` y `status = 'in_review'`.
  * Activo (apto): `deleted_at = null` y `status = 'validated'`.
