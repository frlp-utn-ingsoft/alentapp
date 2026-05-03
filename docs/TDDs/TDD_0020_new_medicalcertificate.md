---
id: 0020
estado: Propuesto
autor: Leonel Piquet
fecha: 2026-05-02
titulo: Registro de Nuevo Certificado Médico
---

# TDD-0020: Registro de Nuevo Certificado Médico

## Contexto de Negocio (PRD)

### Objetivo
Digitalizar la gestión de aptos físicos para garantizar que el club cumpla con las normativas legales de salud. El sistema debe actuar como una "llave" de seguridad, asegurando que solo los socios con certificados vigentes puedan realizar actividades deportivas.

### User Persona
*   **Nombre**: Administrador del Club
*   **Necesidad**: Registrar certificados de forma rápida y confiable, delegando en el sistema la tarea de invalidar registros antiguos para evitar errores humanos en la habilitación de socios.

### Criterios de Aceptación
*   El sistema debe validar que la fecha de vencimiento sea estrictamente posterior a la fecha de emisión.
*   El sistema debe validar que el socio (`member_id`) exista antes de procesar el registro.
*   Solo puede haber un certificado activo por socio. Al crear uno nuevo, el sistema debe invalidar automáticamente (marcar como histórico) los registros anteriores de ese socio
*   Al finalizar, el sistema debe mostrar un mensaje de éxito y el certificado debe quedar en estado validado por defecto

## Diseño Técnico (RFC)

### Modelo de Datos
Se definirá la entidad 'MedicalCertificate' en Prisma con las siguientes propiedades y restricciones.

*   `id`: Identificador único universal (UUID, PK).
*   `fecha_emision`: DateTime (Fecha de emisión).
*   `fecha_vencimiento`: DateTime (Fecha de vencimiento).
*   `medico_matricula`: String (Número de matrícula del profesional).
*   `institucion`: String (Nombre de la entidad emisora).
*   `esta_validado`: Boolean (Estado de vigencia actual).
*   `member_id`: UUID (FK hacia la entidad Member).

### Contrato de API (@alentapp/shared)
[Definición de endpoints y tipos compartidos.]
*   **Endpoint**: `POST /api/v1/medical-certificates`
*   **Request Body**: (CreateMedicalCertificateRequest)
```ts
{
    fecha_emision: string;      // ISO Date String
    fecha_vencimiento: string;  // ISO Date String
    medico_matricula: string;
    institucion: string;
    member_id: string;          // UUID del socio
}
```

### Componentes de Arquitectura Hexagonal
[Cómo se distribuye la lógica en las capas.]
*   **Domain**: 
	* Entidad MedicalCertificate con validaciones de integridad.
	* Puerto MedicalCertificateRepository: interfaz con métodos save e invalidatePreviousCertificates
*   **Application**:
	* Caso de Uso CreateMedicalCertificate: Orquesta la búsqueda de certificados activos previos para su invalidación antes de persistir el nuevo registro.
*   **Infrastructure**:
	* MedicalCertificateController: Adaptador de entrada que recibe y valida el DTO mediante fastify.

## Casos de Borde y Errores
| Escenario                              | Resultado Esperado                                           | Código HTTP              |
| ---------------------------------------| -------------------------------------------------------------| -------------------------|
| fecha_vencimiento <= fecha_emision     | Mensaje: "La fecha de fin debe ser posterior a la de inicio" | 400 Bad Request          |
| Socio inexistente                      | Mensaje: "Socio no encontrado"                               | 404 Not found            |
| Datos Obligatorios nulos               | Mensaje: "Datos inválidos"                                   | 400 Bad Request          |
| Error de conexión a DB                 | Mnesaje: "Error interno, reintente más tarde"                | 500 Internal Server Error|

## Plan de Implementación
1. Definir el esquema de persistencia en schema.prisma y ejecutar la migración.
2. Crear los tipos en @alentapp/shared y el puerto en la capa de Domain.
3. Implementar el repositorio y el caso de uso con la lógica de invalidación automática.
4. Desarrollar el controlador en el backend y conectar el formulario en React. 
