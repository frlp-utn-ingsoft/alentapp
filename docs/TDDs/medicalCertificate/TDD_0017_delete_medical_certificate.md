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
* **Necesidad**: Eliminar un certificado médico que fue cargado por error o que ha sido invalidado administrativamente, asegurando que el registro permanezca en la base de datos para auditoría pero que no sea considerado como apto para la actividad física.

### 1.3. Criterios de Aceptación

* Como administrador, quiero dar de baja un certificado médico para que deje de ser considerado válido.
    - Escenario de éxito: "Si el usuario solicita la baja de un certificado, el sistema debe cambiar su estado a no validado".
    - Escenario de fallo: "Si el certificado indicado no existe, el sistema debe informar el error".
    - Escenario de fallo: "Si el certificado ya se encuentra marcado como no validado, el sistema debe informar que ya ha sido dado de baja".

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se utiliza la entidad `MedicalCertificate` completa (aunque para esta operación solo se modifique el estado de validación):

* `id`: Identificador único universal (UUID).
* `issue_date`: Fecha de emisión.
* `expiry_date`: Fecha de vencimiento.
* `doctor_license`: Cadena de texto.
* `institution`: Cadena de texto.
* `is_validated`: Booleano.
* `member_id`: Identificador del socio asociado al certificado.

### 2.2. Contrato de API (@alentapp/shared)

* **Endpoint**: `DELETE /api/v1/medical-certificates/:id`
* **Request Body**: `None`
* **Response**: `204 No Content` en caso de éxito.

### 2.3. Esquema de Persistencia

```prisma
model MedicalCertificate {
  id             String   @id @default(uuid())
  is_validated   Boolean
  // ... otros campos
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `MedicalCertificateRepository` con método `findById(id)` y `update(id, data)`.
* **Adaptador de Entrada (Delivery)**: `MedicalCertificateController`, recibe el parámetro `id` y delega al caso de uso.
* **Adaptador de Salida (Infrastructure)**: `PostgresMedicalCertificateRepository`, implementa la actualización.

### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `DeleteMedicalCertificateUseCase`.
1. Buscar el certificado por su `id`.
2. Si el certificado no existe, lanzar error de "no encontrado".
3. Cambiar el campo `is_validated` a `false`.
4. Persistir el cambio en la base de datos.
5. Retornar una respuesta de éxito.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Certificado inexistente | Error: Certificado no encontrado | 404 Not Found |
| Certificado ya invalidado | Error: El certificado ya se encuentra dado de baja | 400 Bad Request |
| Error de conexión a DB | Error interno del servidor | 500 Internal Server Error |
| Eliminación exitosa | Respuesta vacía | 204 No Content |

## 5. Plan de Implementación

1. Asegurar que el puerto `MedicalCertificateRepository` incluya `findById` y `update`.
2. Desarrollar la lógica de borrado lógico en `DeleteMedicalCertificateUseCase`.
3. Implementar el endpoint `DELETE` en el controlador.
4. Registrar la ruta en la aplicación.
5. Realizar pruebas de integración verificando que el registro persiste con `is_validated = false`.

## 6. Observaciones Adicionales

* El uso de `is_validated = false` como mecanismo de baja lógica permite mantener la integridad de los datos históricos y la trazabilidad para auditorías.
* El sistema debe tratar las solicitudes de eliminación de certificados ya invalidados como exitosas para mantener la idempotencia de la API.
