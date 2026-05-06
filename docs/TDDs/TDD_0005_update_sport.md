---
id: 0005
estado: Pendiente
autor: [Facundo Pierrard]
fecha: 2026-05-01
titulo: Actualización de Deporte Existente
---

# TDD-0002: Actualización de Deporte Existente

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo modifique los datos editables de un deporte existente, como su descripción, cupo máximo, precio adicional o si requiere certificado médico, manteniendo la integridad de las reglas de negocio definidas para la entidad.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Actualizar la información de un deporte cuando cambia su cupo, precio o requisito de certificado médico, sin alterar el nombre original con el que fue creado.

### Criterios de Aceptación

- El sistema debe permitir actualizar la descripción del deporte.
- El sistema debe permitir actualizar el cupo máximo, siempre que sea mayor a cero.
- El sistema debe permitir actualizar el precio adicional.
- El sistema debe permitir actualizar si el deporte requiere certificado médico.
- El sistema no debe permitir modificar el campo `name` una vez creado el deporte.
- Si la edición es correcta, debe retornar los datos actualizados del deporte.

## Diseño Técnico (RFC)

### Modelo de Datos

La entidad `Sport` mantiene las siguientes reglas durante la actualización:

- `id`: Identificador único universal (UUID), no modificable.
- `name`: Cadena de texto única e inmutable. No se permite modificar después de la creación.
- `description`: Cadena de texto editable.
- `max_capacity`: Número entero editable, siempre mayor a cero.
- `additional_price`: Número decimal editable.
- `requires_medical_certificate`: Valor booleano editable.

### Contrato de API (@alentapp/shared)

Se utilizará una actualización parcial. Todos los campos son opcionales, excepto que `name` no formará parte del contrato de actualización para evitar modificarlo.

- Endpoint: `PUT /api/v1/deportes/:id`
- Request Body (`UpdateSportRequest`):

```ts
{
    description?: string;
    max_capacity?: number;
    additional_price?: number;
    requires_medical_certificate?: boolean;
}
```

- Response: `200 OK`

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

1. **Domain**: Entidad `Sport` con regla de negocio que impide modificar `name` y valida `max_capacity > 0`.
2. **Application**: Caso de uso `UpdateSportUseCase`, encargado de verificar existencia y aplicar las validaciones antes de actualizar.
3. **Puerto**: `SportRepository`, con métodos `findById(id)` y `update(id, data)`.
4. **Infrastructure**: `PostgresSportRepository`, encargado de actualizar los campos permitidos en base de datos.
5. **Adaptador de Entrada**: `SportController`, encargado de extraer el `id` de la URL y mapear excepciones a códigos HTTP.
6. **Frontend**: Modal o formulario de edición que no permita modificar el nombre del deporte.

## Casos de Borde y Errores

| Escenario                         | Resultado Esperado                                      | Código HTTP               |
| --------------------------------- | ------------------------------------------------------- | ------------------------- |
| Deporte inexistente               | Mensaje: "El deporte no existe"                         | 400 Bad Request           |
| Intento de modificar `name`       | Mensaje: "El nombre del deporte no puede modificarse"   | 400 Bad Request           |
| Cupo menor o igual a cero         | Mensaje: "El cupo máximo debe ser mayor a cero"         | 400 Bad Request           |
| Error de conexión a DB            | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |
| Actualización exitosa             | Retorna el deporte actualizado                           | 200 OK                    |

## Plan de Implementación

1. Definir el tipo `UpdateSportRequest` en `@alentapp/shared` sin incluir el campo `name`.
2. Ampliar el `SportRepository` con los métodos `findById` y `update`.
3. Implementar `UpdateSportUseCase` validando existencia del deporte y `max_capacity > 0`.
4. Asegurar que el backend rechace cualquier intento de modificación del campo `name`.
5. Crear el endpoint `PUT /api/v1/deportes/:id` en `SportController`.
6. Implementar el método de actualización en el servicio frontend de deportes.
7. Reutilizar o crear un formulario de edición que muestre el nombre como dato no editable.
