---
id: 0005
estado: Propuesto
autor: Luciana Martino
fecha: 2026-05-03
titulo: Gestión de Certificados Médicos
---

# TDD-0005: Gestión de Certificados Médicos

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos registrar, consultar y actualizar los certificados médicos presentados por los socios del club, asegurando que cada socio tenga como máximo un certificado activo.

El objetivo principal es mantener información confiable sobre la aptitud médica de los socios para realizar actividades deportivas. Para esto, cuando se registra un nuevo certificado médico para un socio, el sistema debe invalidar automáticamente los certificados anteriores de ese mismo socio.

### User Persona

*   **Nombre**: Alberto (Tesorero/Administrativo).
*   **Necesidad**: Registrar certificados médicos de los socios de forma rápida y confiable. Necesita saber si un socio tiene un certificado vigente para poder habilitarlo a realizar actividades deportivas, evitando que existan varios certificados activos al mismo tiempo para la misma persona.

### Criterios de Aceptación

*   El sistema debe permitir registrar un certificado médico asociado a un socio existente.
*   El sistema debe validar que el socio exista antes de crear el certificado médico.
*   El sistema debe permitir que haya solo un certificado médico activo por socio.
*   Al crear un nuevo certificado médico, el sistema debe invalidar automáticamente los certificados anteriores del mismo socio.
*   El sistema debe validar que la fecha de vencimiento sea posterior a la fecha de emisión.
*   El sistema debe permitir actualizar los datos de un certificado médico existente.
*   El sistema debe permitir consultar los certificados médicos registrados.
*   Si la creación o actualización es correcta, debe retornar los datos del certificado médico guardado.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `MedicalCertificate` con las siguientes propiedades y restricciones:

*   `id`: Identificador único universal (UUID).
*   `member_id`: Identificador único universal (UUID) correspondiente al socio asociado al certificado. Debe referenciar a un socio existente.
*   `issue_date`: Fecha de emisión del certificado médico.
*   `expiration_date`: Fecha de vencimiento del certificado médico. Debe ser posterior a `issue_date`.
*   `professional_name`: Cadena de texto que representa el nombre del profesional que emitió el certificado.
*   `professional_license`: Cadena de texto que representa la matrícula del profesional.
*   `is_active`: Booleano que indica si el certificado médico se encuentra activo.
*   `created_at`: Fecha de creación del registro, generada automáticamente.

Restricción principal de negocio:

*   Solo puede existir un certificado médico activo por socio. Al crear uno nuevo, los certificados anteriores del mismo socio deben quedar con `is_active = false`.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización entre frontend y backend.

*   **Endpoint**: `POST /api/v1/medical-certificates`
*   **Request Body**:

```ts
{
    memberId: string;
    issueDate: string; // ISO Date String
    expirationDate: string; // ISO Date String
    professionalName: string;
    professionalLicense: string;
}
```

*   **Endpoint**: PUT /api/v1/medical-certificates/:id
*   **Request Body**:

```ts
{
    issueDate?: string; // ISO Date String
    expirationDate?: string; // ISO Date String
    professionalName?: string;
    professionalLicense?: string;
    isActive?: boolean;
}
```
*    **Endpoint**: GET /api/v1/medical-certificates
*    **Request Body*:

```ts
{
    // No requiere body.
    // Opcionalmente se podrán utilizar filtros por query params,
    // por ejemplo: memberId o activeOnly.
}
```
*   **Endpoint**: DELETE /api/v1/medical-certificates/:id
*   **Request Body**:
```ts
{
    // No requiere body.
}
```

## Componentes de Arquitectura Hexagonal
1. **Puerto**: MedicalCertificateRepository (interface en el Dominio que define las operaciones necesarias para persistir y consultar certificados médicos) Métodos esperados: create(data), update(id, data), findById(id), findAll(), findActiveByMemberId(memberId), invalidateByMemberId(memberId) y delete(id).
2. **Servicio de Dominio**: MedicalCertificateValidator (encargado de centralizar las validaciones propias de la entidad MedicalCertificate, especialmente: Validar que la fecha de vencimiento sea posterior a la fecha de emisión, validar que el nombre del profesional no esté vacío, validar que la matrícula profesional no esté vacía y validar que no se mantengan múltiples certificados activos para un mismo socio.)
3. **Caso de Uso**: CreateMedicalCertificateUseCase (orquesta la creación de un nuevo certificado médico. Primero valida que el socio exista, luego utiliza MedicalCertificateValidator para verificar las reglas de negocio. Antes de persistir el nuevo certificado, invalida los certificados anteriores del mismo socio mediante invalidateByMemberId(memberId). Finalmente, crea el nuevo certificado con estado activo.)
4. **Caso de Uso**: UpdateMedicalCertificateUseCase (permite modificar un certificado médico existente. Primero valida que el certificado exista, luego aplica las validaciones correspondientes si se modifican las fechas, el nombre del profesional, la matrícula o el estado activo. Si el certificado se marca como activo, debe asegurarse de invalidar otros certificados activos del mismo socio para conservar la regla de único certificado activo.)
5. **Caso de Uso**: ListMedicalCertificatesUseCase (permite consultar los certificados médicos registrados. Puede listar todos los certificados o aplicar filtros por socio y por estado activo, según los parámetros recibidos desde el controlador.)
6. **Caso de Uso**: DeleteMedicalCertificateUseCase (permite eliminar un certificado médico existente. Primero comprueba existencia previa mediante findById y luego delega la eliminación al repositorio. En caso de que se decida mantener historial completo, esta operación podría reemplazarse por una baja lógica cambiando is_active a false.)
7. **Adaptador de Salida**: PostgresMedicalCertificateRepository (implementación real del puerto MedicalCertificateRepository utilizando Prisma para persistir, consultar, actualizar, invalidar y eliminar registros en PostgreSQL.)
8. **Adaptador de Entrada**: MedicalCertificateController (controlador HTTP que recibe las peticiones de Fastify, extrae el body o los params necesarios, llama al caso de uso correspondiente y mapea las excepciones a códigos HTTP.)

## Casos de Borde y Errores
| Escenario                           | Resultado Esperado                                              | Código HTTP            
| ----------------------------------- | ----------------------------------------------------------------|---------------------------------|
| Socio inexistente                   | Mensaje: "El miembro no existe"                                 | 400 Bad request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Fecha de vencimiento igual a        | Mensaje: "La fecha de vencimiento debe ser                      |                                 |
|    fecha de emisión                 |  posterior a la fecha de emisión"                               | 400 Bad Request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Fecha de vencimiento anterior       | Mensaje: "La fecha de vencimiento debe ser                      |                                 |
|    a fecha de emisión               |  posterior a la fecha de emisión"                               | 400 Bad Request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Nombre del profesional vacío        | Mensaje: "El nombre del profesional es obligatorio"             | 400 Bad Request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Matrícula profesional vacía         | Mensaje: "La matrícula profesional es obligatoria"              | 400 Bad Request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Nuevo certificado para socio        | Se invalida el certificado anterior y se crea el nuevo          | 201 Created                     |
| con certificado activo              |                                                                 |                                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Certificado médico inexistente      | Mensaje: "El certificado médico no existe"                      | 400 Bad Request                 |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Error de conexión a DB              | Mensaje: "Error interno, reintente más tarde"                   | 500 Internal Server Error       |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Creación exitosa                    | Retorna el certificado médico creado                            | 201 Created                     |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Actualización exitosa               | Retorna el certificado médico actualizado                       | 200 OK                          |
|-----------------------------------------------------------------------------------------------------------------------------------------|
| Eliminación exitosa                 | Respuesta vacía                                                 | 204 No Content                  |

## Plan de Implementación

1. Definir el modelo MedicalCertificate en el archivo schema.prisma, incluyendo la relación con la entidad Member.
2. Generar y aplicar la migración correspondiente utilizando Prisma.
3. Crear los tipos compartidos en @alentapp/shared: CreateMedicalCertificateRequest, UpdateMedicalCertificateRequest y MedicalCertificateResponse.
4. Crear el puerto MedicalCertificateRepository con los métodos create, update, findById, findAll, findActiveByMemberId, invalidateByMemberId y delete.
5. Crear el servicio de dominio MedicalCertificateValidator para validar fechas, profesional, matrícula y regla de único certificado activo.
6. Implementar CreateMedicalCertificateUseCase, validando existencia del socio, invalidando certificados anteriores y creando el nuevo certificado activo.
7. Implementar UpdateMedicalCertificateUseCase, validando existencia del certificado y reglas de negocio antes de actualizar.
8. Implementar ListMedicalCertificatesUseCase, permitiendo listar certificados y aplicar filtros si corresponde.
9. Implementar DeleteMedicalCertificateUseCase, verificando existencia previa antes de eliminar.
10. Implementar PostgresMedicalCertificateRepository usando Prisma.
11. Crear MedicalCertificateController con las rutas POST, PUT, GET y DELETE.
12. Registrar las rutas de certificados médicos en la configuración principal de Fastify.
13. Consumir los endpoints desde el servicio de Frontend.
14. Crear o adaptar la vista de frontend para registrar, editar, listar y eliminar certificados médicos.
15. Agregar tests para validar creación exitosa, actualización exitosa, socio inexistente, certificado inexistente, fechas inválidas y la regla de un único certificado activo por socio.

