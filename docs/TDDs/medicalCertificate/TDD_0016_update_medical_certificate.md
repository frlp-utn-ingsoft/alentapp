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

Permitir que el personal administrativo modifique la información de un certificado médico existente, como su fecha de vencimiento, datos del médico, institución o su estado de validación, en caso de correcciones o actualizaciones necesarias.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Corregir errores en la carga de datos o validar un certificado que ha sido revisado físicamente, asegurando que la información en el sistema coincida con los registros físicos.

### 1.3. Criterios de Aceptación

* Como administrador, quiero poder actualizar los datos de un certificado médico existente.
    - Escenario de éxito: "Si el usuario modifica un campo (ej. fecha o institución) y los datos son válidos, el sistema debe actualizar el registro".
    - Escenario de éxito: "Si el usuario cambia `is_validated` a `true`, el sistema debe marcar como `false` cualquier otro certificado activo del mismo socio".
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
* `is_validated`: Booleano.
* `member_id`: Identificador del socio asociado al certificado.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `PUT /api/v1/medical-certificates/:id`
* **Request Body (UpdateMedicalCertificateRequest)**:

```ts
{
    issue_date?: string; // ISO Date (YYYY-MM-DD)
    expiry_date?: string; // ISO Date (YYYY-MM-DD)
    doctor_license?: string;
    institution?: string;
    is_validated?: boolean;
}
```

### 2.3. Esquema de Persistencia

```prisma
model MedicalCertificate {
  id             String   @id @default(uuid())
  issue_date     DateTime
  expiry_date    DateTime
  doctor_license String
  institution    String
  is_validated   Boolean
  member_id      String
  member         Member   @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `MedicalCertificateRepository` con métodos `findById(id)` y `update(id, data)`.
* **Adaptador de Entrada (Delivery)**: `MedicalCertificateController`, recibe la request y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresMedicalCertificateRepository`, implementa la persistencia.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `UpdateMedicalCertificateUseCase`.
1. Buscar el certificado por su `id`.
2. Validar que los nuevos datos (si se envían) sean consistentes (ej. `expiry_date` > `issue_date`).
3. Si el campo `is_validated` se está cambiando a `true`:
    - Buscar otros certificados del mismo socio con `is_validated = true`.
    - Cambiar su estado a `false`.
4. Aplicar los cambios en el certificado objetivo.
5. Persistir los cambios.
6. Retornar el certificado actualizado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Certificado inexistente | Error: Certificado no encontrado | 404 Not Found |
| `expiry_date` $\le$ `issue_date` | Error: Fecha de vencimiento inválida | 400 Bad Request |
| Formato de fecha inválido | Error: Formato de fecha inválido | 400 Bad Request |
| Error de conexión a DB | Error interno del servidor | 500 Internal Server Error |
| Activación de certificado | Certificado activado y otros invalidados | 200 OK |

## 5. Plan de Implementación

1. Definir el tipo `UpdateMedicalCertificateRequest` en `@alentapp/shared`.
2. Ampliar el puerto `MedicalCertificateRepository` con `findById` y `update`.
3. Implementar la validación de fechas en el Dominio.
4. Desarrollar `UpdateMedicalCertificateUseCase` con la lógica de invalidación cruzada.
5. Implementar el endpoint `PUT` en el controlador.
6. Realizar pruebas unitarias y de integración.

## 6. Observaciones Adicionales

* La actualización debe ser parcial (solo los campos enviados en el body deben modificarse).
* La validación de la regla "un único certificado activo" es vital para mantener la integridad del sistema ante cambios de estado manuales.
