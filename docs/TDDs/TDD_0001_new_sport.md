---
id: 0001
estado: Pendiente
autor: [Facundo Pierrard]
fecha: 2026-05-01
titulo: Registro de Nuevo Deporte
---

# TDD-0001: Registro de Nuevo Deporte

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre nuevos deportes ofrecidos por la institución, indicando su nombre, descripción, cupo máximo, precio adicional y si requiere certificado médico. Esto permite mantener actualizada la oferta deportiva disponible para los socios.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Cargar rápidamente un nuevo deporte en el sistema para que luego los socios puedan inscribirse correctamente, evitando nombres duplicados o cupos inválidos.

### Criterios de Aceptación

- El sistema debe permitir registrar un nuevo deporte con nombre, descripción, cupo máximo, precio adicional e indicación de si requiere certificado médico.
- El sistema debe validar que el nombre del deporte sea único.
- El sistema debe validar que `max_capacity` sea mayor a cero.
- El sistema debe guardar correctamente el deporte si todos los datos son válidos.
- Al finalizar, el sistema debe mostrar un mensaje de éxito y limpiar el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto, única e inmutable luego de la creación.
- `description`: Cadena de texto.
- `max_capacity`: Número entero mayor a cero.
- `additional_price`: Número decimal.
- `requires_medical_certificate`: Valor booleano.

### Contrato de API (@alentapp/shared)

Se definirá el contrato compartido para crear deportes desde el frontend y mantener sincronización con el backend.

- Endpoint: `POST /api/v1/deportes`
- Request Body (`CreateSportRequest`):

```ts
{
    name: string;
    description: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
}
```

- Response: `201 Created`

```ts
{
    id: string;
    name: string;
    description: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
}
```

### Componentes de Arquitectura Hexagonal

1. **Domain**: Entidad `Sport` y validaciones de negocio sobre nombre único y cupo máximo mayor a cero.
2. **Application**: Caso de uso `CreateSportUseCase`, encargado de validar los datos y crear el deporte.
3. **Puerto**: `SportRepository`, con métodos `create(data)` y `findByName(name)`.
4. **Infrastructure**: `PostgresSportRepository`, encargado de persistir la entidad en la base de datos.
5. **Adaptador de Entrada**: `SportController`, encargado de recibir la petición HTTP y mapear errores a códigos HTTP.
6. **Frontend**: Formulario de alta de deporte conectado al endpoint de creación.

## Casos de Borde y Errores

| Escenario                    | Resultado Esperado                                  | Código HTTP               |
| ---------------------------- | --------------------------------------------------- | ------------------------- |
| Nombre ya registrado         | Mensaje: "Ya existe un deporte con ese nombre"      | 409 Conflict              |
| Cupo menor o igual a cero    | Mensaje: "El cupo máximo debe ser mayor a cero"     | 400 Bad Request           |
| Nombre vacío                 | Mensaje: "El nombre del deporte es obligatorio"     | 400 Bad Request           |
| Error de conexión a DB       | Mensaje: "Error interno, reintente más tarde"       | 500 Internal Server Error |
| Creación exitosa             | Retorna el deporte creado                            | 201 Created               |

## Plan de Implementación

1. Definir los tipos `CreateSportRequest` y `SportResponse` en `@alentapp/shared`.
2. Crear o actualizar el modelo `Sport` en Prisma, asegurando unicidad sobre el campo `name`.
3. Crear el puerto `SportRepository` en la capa de dominio/aplicación.
4. Implementar `CreateSportUseCase` con validaciones de nombre único y `max_capacity > 0`.
5. Implementar `PostgresSportRepository`.
6. Crear el endpoint `POST /api/v1/deportes` en `SportController`.
7. Crear el formulario de alta en el frontend y conectarlo con el servicio de deportes.
