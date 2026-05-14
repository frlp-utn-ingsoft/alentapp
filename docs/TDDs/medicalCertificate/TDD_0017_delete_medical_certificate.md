---
id: 0017
estado: Propuesto
autor: Noval Leandro Andrés
fecha: 2026-05-03
titulo: Eliminación de Certificados Médicos Existentes
---

# TDD-0017: Eliminación de Certificados Médicos Existentes

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir que el personal administrativo dé de baja un certificado médico del sistema. Debido a la necesidad de mantener un historial de los documentos presentados por los socios, el sistema no realizará un borrado físico, sino una baja lógica.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Eliminar un certificado médico que fue cargado por error o que ya no debe considerarse vigente, asegurando que el registro permanezca en la base de datos para auditoría pero que no sea considerado como apto para la actividad física.

### 1.3. Criterios de Aceptación

* Como administrador, quiero dar de baja un certificado médico para que deje de ser considerado válido.
    - Escenario de éxito: "Si el usuario solicita la baja de un certificado, el sistema debe marcar el registro con `deleted_at`".
    - Escenario de fallo: "Si el certificado indicado no existe, el sistema debe informar el error".
    - Escenario de fallo: "Si el certificado ya se encuentra dado de baja, el sistema debe informar que ya ha sido eliminado".

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se utiliza la entidad `MedicalCertificate` completa (aunque para esta operación solo se modifique `deleted_at`):

* `id`: Identificador único universal (UUID).
* `issue_date`: Fecha de emisión.
* `expiry_date`: Fecha de vencimiento.
* `doctor_license`: Cadena de texto.
* `institution`: Cadena de texto.
* `status`: Estado del certificado (`in_review`, `validated`, `historical`).
* `deleted_at`: Fecha de baja lógica (opcional). Si es `null`, el certificado es visible/consultable.
* `member_id`: Identificador del socio asociado al certificado.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `PATCH /api/v1/medical-certificates/:id`
* **Semántica**: Baja lógica del certificado. Esta operación no elimina el recurso físicamente; el servidor setea `deleted_at = now()` y el certificado deja de ser visible por defecto.
* **Request Body**: `{}` (vacío). No se requiere información adicional para ejecutar la baja; la marca temporal se determina del lado del servidor.
* **Response**: `204 No Content` en caso de éxito.

Nota de diseño:

* Se utiliza `PATCH` (en lugar de `DELETE`) para modelar explícitamente una actualización parcial del recurso (seteo de `deleted_at`), manteniendo trazabilidad/auditoría.

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

* **Puerto (Domain)**: `MedicalCertificateRepository` con método `findById(id)` y `softDelete(id)`.
* **Adaptador de Entrada (Delivery)**: `MedicalCertificateController`, recibe el parámetro `id` y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresMedicalCertificateRepository`, implementa la baja lógica.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `DeleteMedicalCertificateUseCase`.
1. Buscar el certificado por su `id`.
2. Si el certificado no existe, lanzar error de "no encontrado".
3. Si el certificado ya tiene `deleted_at` distinto de `null`, retornar error.
4. Marcar el certificado con `deleted_at = now()`.
5. Retornar una respuesta de éxito vacía.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Certificado inexistente | Error: Certificado no encontrado | 404 Not Found |
| Certificado ya eliminado | Error: El certificado ya se encuentra dado de baja | 409 Conflict |
| Error de conexión a DB | Error interno del servidor | 500 Internal Server Error |
| Eliminación exitosa | Respuesta vacía | 204 No Content |

## 5. Plan de Implementación

1. Asegurar que el puerto `MedicalCertificateRepository` incluya `findById` y `softDelete`.
2. Desarrollar la lógica de borrado lógico en `DeleteMedicalCertificateUseCase`.
3. Implementar el endpoint `PATCH` en el controlador.
4. Registrar la ruta en la aplicación.
5. Realizar pruebas de integración verificando que el registro persiste con `deleted_at != null`.

## 6. Observaciones Adicionales

* Esta operación realiza una baja lógica: el certificado no se elimina físicamente, se marca con `deleted_at`.
* Si el certificado ya fue dado de baja (`deleted_at != null`), la API debe responder con `409 Conflict`.
