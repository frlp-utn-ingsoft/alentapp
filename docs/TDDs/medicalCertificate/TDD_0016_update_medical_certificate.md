---
id: 0016
estado: Propuesto
autor: Noval Leandro Andrés
fecha: 2026-05-03
titulo: Actualización de Certificados Médicos
---

# TDD-0016: Actualización de Certificados Médicos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir que el personal administrativo modifique la información de un certificado médico existente (fechas, datos del médico, institución) y validar un certificado previamente cargado.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Corregir errores en la carga de datos o validar un certificado que ha sido revisado físicamente, asegurando que la información en el sistema coincida con los registros físicos.

### 1.3. Criterios de Aceptación

* Como administrador, quiero poder actualizar los datos de un certificado médico existente.
    - Escenario de éxito: "Si el usuario modifica un campo (ej. fecha o institución) y los datos son válidos, el sistema debe actualizar el registro".
    - Escenario de éxito: "Si el usuario valida un certificado (`status` pasa a `validated`), el sistema debe marcar como `historical` cualquier otro certificado `validated` del mismo socio".
    - Escenario de fallo: "Si el usuario intenta poner una fecha de vencimiento anterior a la de emisión, el sistema debe bloquear la acción".
    - Escenario de fallo: "Si el certificado a modificar no existe, el sistema debe informar el error".

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se utiliza la entidad `MedicalCertificate` con sus propiedades:

* `id`: Identificador único universal (UUID).
* `issue_date`: Fecha de emisión.
* `expiry_date`: Fecha de vencimiento.
* `doctor_license`: Cadena de texto.
* `institution`: Cadena de texto.
* `status`: Estado del certificado (`in_review`, `validated`, `historical`).
* `deleted_at`: Fecha de baja lógica (opcional). Si es `null`, el certificado es visible/consultable.
* `member_id`: Identificador del socio asociado al certificado.

Reglas de negocio y restricciones de API:

* Certificado **activo**: `status = 'validated'` y `deleted_at = null`.
* Cambio de estado permitido por API: únicamente `in_review -> validated`.
* No se permite setear `status = 'historical'` manualmente por API.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `PUT /api/v1/medical-certificates/:id`
* **Request Body (UpdateMedicalCertificateRequest)**:

```ts
{
    issue_date?: string; // ISO Date (YYYY-MM-DD)
    expiry_date?: string; // ISO Date (YYYY-MM-DD)
    doctor_license?: string;
    institution?: string;
    status?: 'in_review' | 'validated';
}
```

* **Response (Success)**: `200 OK`
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
  status         MedicalCertificateStatus
  deleted_at     DateTime?
  member_id      String
  member         Member   @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `MedicalCertificateRepository` con métodos `findById(id)`, `update(id, data)` y una operación para marcar como `historical` certificados `validated` de un socio.
* **Adaptador de Entrada (Delivery)**: `MedicalCertificateController`, recibe la request y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresMedicalCertificateRepository`, implementa la persistencia.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `UpdateMedicalCertificateUseCase`.
1. Buscar el certificado por su `id`.
2. Si el certificado tiene `deleted_at` distinto de `null` o `status === 'historical'`, retornar error (no se permite modificar certificados dados de baja o históricos).
3. Validar que los nuevos datos (si se envían) sean consistentes (ej. `expiry_date` > `issue_date`) considerando el estado final (merge de campos existentes + body).
4. Si se solicita un cambio de `status`:
   - Validar que el cambio sea únicamente `in_review -> validated`. Cualquier otra transición debe rechazarse.
5. Si `status` está cambiando a `validated`, ejecutar una **transacción**:
   - Validar que `expiry_date` sea posterior a la fecha actual (no se permite validar un certificado vencido).
   - Marcar como `historical` todos los certificados del socio con `status = 'validated'` y `deleted_at = null` (excluyendo el certificado objetivo).
   - Cambiar el certificado objetivo a `status = 'validated'`.
6. Aplicar el resto de cambios solicitados (fechas, doctor_license, institution).
7. Persistir cambios.
8. Retornar el certificado actualizado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Certificado inexistente | Error: Certificado no encontrado | 404 Not Found |
| `expiry_date` $\le$ `issue_date` | Error: Fecha de vencimiento inválida | 400 Bad Request |
| Formato de fecha inválido | Error: Formato de fecha inválido | 400 Bad Request |
| Certificado dado de baja o histórico | Error: No se puede modificar un certificado dado de baja o histórico | 409 Conflict |
| Transición de estado inválida | Error: Cambio de estado no permitido | 409 Conflict |
| Validación de certificado vencido | Error: No se puede validar un certificado vencido | 409 Conflict |
| Error de conexión a DB | Error interno del servidor | 500 Internal Server Error |
| Validación de certificado | Certificado validado y certificados anteriores marcados como `historical` | 200 OK |

## 5. Plan de Implementación

1. Definir el tipo `UpdateMedicalCertificateRequest` en `@alentapp/shared`.
2. Ampliar el puerto `MedicalCertificateRepository` con `findById` y `update`.
3. Implementar la validación de fechas en el Dominio.
4. Desarrollar `UpdateMedicalCertificateUseCase` con la lógica transaccional de validación (único `validated` por socio).
5. Implementar el endpoint `PUT` en el controlador.
6. Realizar pruebas unitarias y de integración.

## 6. Observaciones Adicionales

* La actualización debe ser parcial (solo los campos enviados en el body deben modificarse).
* La regla de negocio de consigna se implementa en la transición a `validated`: al validar uno nuevo, los anteriores `validated` pasan a `historical` en la misma transacción.
* El estado `historical` no puede asignarse manualmente por API; es un efecto colateral de validar otro certificado.
