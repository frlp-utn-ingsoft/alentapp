---
id: 0017
estado: Propuesto
autor: Leonel Piquet
fecha: 2026-05-02
titulo: Actualización de Certificado Médico
---

# TDD-0017: Actualización de Certificado Médico

## Contexto de Negocio (PRD)

### Objetivo
Permitir la corrección de datos cargados erróneamente en un certificado médico (como errores de ortografía en la institución o errores en la matrícula del médico) sin necesidad de eliminar el registro, manteniendo la trazabilidad del socio[cite: 4, 6].

### User Persona
*   **Nombre**: Administrador del club.
*   **Necesidad**: Editar la información de un certificado cuando detecta un error de carga manual, asegurando que los cambios se guarden correctamente sin alterar la lógica de vigencia del socio[cite: 4].

### Criterios de Aceptación
*   El sistema debe permitir la edición de: fecha de emisión, fecha de vencimiento, matrícula y nombre de la institución[cite: 4].
*   El sistema debe validar que, si se modifica la fecha de vencimiento, esta siga siendo posterior a la fecha de emisión[cite: 1, 4].
*   No se debe permitir cambiar el `member_id` asociado; si el certificado se cargó al socio equivocado, debe anularse y crearse uno nuevo.
*   Al finalizar la edición, el sistema debe confirmar que los cambios fueron persistidos exitosamente.

## Diseño Técnico (RFC)

### Modelo de Datos
La operación de actualización impacta sobre la entidad `MedicalCertificate` existente en Prisma[cite: 1, 4]:
*   `fecha_emision`: DateTime (Editable)[cite: 4].
*   `fecha_vencimiento`: DateTime (Editable, con validación de rango)[cite: 4].
*   `medico_matricula`: String (Editable)[cite: 4].
*   `institucion`: String (Editable)[cite: 4].

### Contrato de API (@alentapp/shared)
Definición del contrato para la actualización parcial (Patch/Put):

*   **Endpoint**: `PUT /api/v1/medical-certificates/:id`
*   **Request Body (UpdateMedicalCertificateRequest)**:
```ts
{
    fecha_emision?: string;
    fecha_vencimiento?: string;
    medico_matricula?: string;
    institucion?: string;
}

### Componentes de Arquitectura Hexagonal
*   **Domain**:
	* Lógica de validación de fecha dentro de la entidad de dominio MedicalCertificate.
	* Puerto MedicalCertificateRepository: Método update(id, data).

*   **Application**:
	*Caso de uso UpdateMedicalCertificate: Se encarga de recuperar el registro actual, aplicar las validaciones de negocio sobre los nuevos datos y solicitar la persistencia.

*   **Infrastructure**:
	*MedicalCertificateController: Valida que el ID enviado en la URL sea un UUID válido antes de pasar la petición al caso de uso.

## Casos de Borde y Errores
| Escenario                                      | Resultado Esperado                                                        | Código HTTP     |     >
| -----------------------------------------------|---------------------------------------------------------------------------|-----------------| 
| ID de certificado inexistente                  | Mensaje: "Certificado no encontrado"                                      | 404 Not Found   |      >
| Nueva fecha_vencimiento menor que fecha_emision| Mensaje: "La fecha de vencimiento no puede ser anterior a la de la emisión| 400 Bad Request |     >
| Intento de modificar member_id                 | El campo debe ser ignorado o retornar error de validación                 | 400 Bad Request | Error de concurrencia en BD                    | Mensaje: "El registro fue modificado por otro usuario                     | 409 Conflict
## Plan de Implementación
1. Definir el DTO de actualización en el paquete.
2. Agregar el método update a la interfaz del repositorio en la capa de Domain.
3. Implementar el caso de uso en la capa de Application con las reglas de validación de fechas.
4. Crear el endpoint en el controlador y realizar las pruebas de integración con el contenedor de postgres.
