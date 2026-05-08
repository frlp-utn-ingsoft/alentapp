---
id: 0016
estado: Aprobado
autor: German Altamirano
fecha: 2026-05-05
titulo: Registro de Deportes
---

# TDD-0016: Registro de Nuevos Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administradores crear deportes dentro del catálogo de actividades ofrecidas por el club, definiendo su nombre, descripción, cupo máximo, precio adicional y si se trata de una actividad federada.

La entidad `Sport` actúa como maestro de datos para la inscripción de socios a actividades. Por este motivo, el sistema debe asegurar que no existan deportes duplicados y que el cupo máximo sea válido desde el momento del alta.

### User Persona

-   Nombre: Administrador de Deportes
-   Necesidad: Dar de alta nuevos deportes, configurando sus datos principales para que luego puedan ser utilizados en inscripciones de socios.

### Criterios de Aceptación

-   El sistema debe permitir crear un deporte con nombre, descripción, cupo máximo, precio adicional y condición de federado.
-   El sistema debe validar que el nombre no esté vacío.
-   El sistema debe validar que el nombre sea único.
-   El sistema debe validar que el `max_capacity` sea mayor a cero.
-   El sistema debe validar que el precio adicional no sea negativo.
-   El sistema debe permitir marcar un deporte como federado.
-   Una vez creado el deporte, el campo `name` debe quedar inmutable.
-   Si la creación es correcta, debe retornar los datos del deporte creado.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Sport` con las siguientes propiedades y restricciones:

-   `id`: UUID. Identificador único del deporte.
-   `name`: String. Nombre del deporte. Debe ser único e inmutable luego de la creación.
-   `description`: String. Descripción del deporte.
-   `max_capacity`: Int. Cupo máximo. Debe ser mayor a cero.
-   `additional_price`: Float. Precio adicional del deporte. Debe ser mayor o igual a cero. Valor por defecto: `0`.
-   `is_federated`: Boolean. Indica si el deporte es federado. Valor por defecto: `false`.
-   `created_at`: DateTime. Fecha de creación.
-   `updated_at`: DateTime. Fecha de última actualización.

Relación futura:

-   Un `Sport` puede tener muchas inscripciones.
-   La cantidad de inscriptos permitirá calcular los cupos disponibles.

### Contrato de API (@alentapp/shared)

-   Endpoint: `POST /api/v1/sports`
-   Request Body (CreateSportRequest):

```ts
{
    name: string;
    description: string;
    maxCapacity: number;
    additionalPrice?: number;
    isFederated?: boolean;
}
```
Response esperada: 201 Created
```ts
{
    id: string;
    name: string;
    description: string;
    maxCapacity: number;
    additionalPrice: number;
    isFederated: boolean;
    enrolledCount: number;
    availableSlots: number;
    createdAt: string;
    updatedAt: string;
}
```

## Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Interface en el Dominio).
   - Método: `findByName(name)` para validar unicidad del nombre.
   - Métodos CRUD: `create()`, `findById()`, `findAll()`, `update()`, `delete()`.
2. **Servicio de Dominio**: `SportValidator` (Encargado de validar la inmutabilidad del nombre, que `max_capacity` sea mayor a cero, y que no sea menor que la cantidad de inscriptos).
3. **Caso de Uso**: `CreateSportUseCase` (Lógica que verifica, utilizando el servicio SportValidator, si el nombre ya existe y valida integridad de datos antes de llamar al repositorio).
   - Validaciones:
     - Nombre único mediante `findByName(name)`.
     - Max capacity > 0.
     - Precio adicional >= 0.
     - Datos de entrada antes de persistir.
4. **Adaptador de Salida**: `PostgresSportRepository` (Implementación real en BD con Prisma).
   - Persistencia de Sports en tabla `sports`.

5. **Adaptador de Entrada**: `SportController` (Ruta HTTP).
   - Endpoint: `POST /api/v1/sports`.
   - Mapeo de excepciones a códigos HTTP.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                   | Código HTTP               |
| -------------------------------- | ---------------------------------------------------- | ------------------------- |
| Nombre duplicado                 | Mensaje: "Ya existe un deporte con ese nombre"       | 409 Conflict              |
| Nombre vacío                     | Mensaje: "El nombre del deporte es obligatorio"      | 400 Bad Request           |
| Descripción vacía                | Mensaje: "La descripción del deporte es obligatoria" | 400 Bad Request           |
| Cupo máximo menor o igual a cero | Mensaje: "El cupo máximo debe ser mayor a cero"      | 400 Bad Request           |
| Precio adicional negativo        | Mensaje: "El precio adicional no puede ser negativo" | 400 Bad Request           |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"        | 500 Internal Server Error |
| Creación exitosa                 | Retorna el deporte creado                            | 201 Created               |


## Plan de Implementación

1. Definir el modelo Sport en schema.prisma.
2. Agregar restricción @unique sobre el campo name.
3. Crear y aplicar la migración correspondiente.
4. Crear los tipos compartidos CreateSportRequest y SportResponse.
5. Crear el puerto SportRepository.
6. Implementar los métodos findByName(name) y create(data).
7. Crear el servicio de dominio SportValidator.
8. Implementar CreateSportUseCase.
9. Crear el endpoint POST /api/v1/sports.
10. Implementar el formulario de alta en frontend.
11. Agregar tests para nombre duplicado, cupo inválido, precio negativo y creación exitosa.