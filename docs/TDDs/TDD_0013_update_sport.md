---
id: 0013
estado: Propuesto
autor: Maria Pia Porzio
fecha: 2026-04-30
titulo: Actualización de Deportes Existentes
---

# TDD-0013: Actualización de Deportes Existentes

## 1. Contexto de Negocio

### 1.1 Objetivo

Permitir que un administrativo actualice los datos editables de un deporte existente, manteniendo inmutable su `name` y respetando las reglas de validación propias de la entidad.

### 1.2 User Persona

* **Rol**: Administrador.
* **Necesidad**: Actualizar la configuración de un deporte cuando cambian sus condiciones, sin alterar el nombre del deporte.

### 1.3 Criterios de Aceptación

*   Como administrador, quiero modificar los datos editables de un deporte para mantener actualizadas las condiciones de la actividad. 
    - Escenario de éxito: "Si el usuario modifica datos editables del deporte con valores válidos, el sistema debe guardar los cambios y notificar al usuario".
    - Escenario de fallo: "Si el usuario intenta modificar el nombre del deporte, el sistema debe bloquear la acción y notificar que el nombre no puede modificarse después de la creación".
    - Escenario de fallo: "Si la petición intenta modificar `deleted_at`, el sistema debe bloquear la acción y notificar que la baja solo puede realizarse mediante la operación correspondiente".
    - Escenario de fallo: "Si el usuario intenta asignar un cupo máximo menor o igual a cero, el sistema debe bloquear la acción y notificar que el cupo máximo debe ser mayor a cero".
    - Escenario de fallo: "Si el usuario intenta asignar un precio adicional negativo, el sistema debe bloquear la acción y notificar que el precio adicional no puede ser negativo".
    - Escenario de fallo: "Si el usuario intenta modificar un deporte inexistente, el sistema debe responder indicando el error y cancelar la operación".

## 2. Diseño Técnico

### 2.1 Modelo de Dominio 

La entidad de dominio `Sport` mantiene los mismos campos definidos para el alta. En esta funcionalidad no se permite modificar `name`. El campo `deleted_at` tampoco se modifica desde este endpoint, ya que su cambio corresponde al caso de uso de baja lógica.

* `id`: Identificador único universal (UUID).
* `name`: Cadena de texto obligatoria e inmutable.
* `description`: Cadena de texto obligatoria y editable.
* `max_capacity`: Número entero obligatorio y editable. Debe ser mayor a cero.
* `additional_price`: Número decimal obligatorio. No puede ser negativo.
* `requires_medical_certificate`: Booleano obligatorio.
* `deleted_at`: Fecha de baja lógica, opcional. Si es `null`, el deporte se considera activo dentro del catálogo.

### 2.2 Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido `@alentapp/shared` para definir una actualización parcial.

* **Endpoint**: `PATCH /api/v1/sports/:id`
* **Request Body (UpdateSportRequest)**:

```ts
{
    description?: string;
    max_capacity?: number;
    additional_price?: number;
    requires_medical_certificate?: boolean;
}
```

* **Response (Success)**: `200 OK`
* **Response Body**: `SportResponseDTO`

```ts
type SportResponseDTO = {
  id: string;
  name: string;
  description: string;
  max_capacity: number;
  additional_price: number;
  requires_medical_certificate: boolean;
  deleted_at: string | null; // ISO DateTime
};

type ErrorResponse = {
  message: string;
};
```

### 2.3 Esquema de Persistencia

No se requiere crear una nueva tabla. Se actualiza el registro existente del modelo `Sport`.

```prisma
model Sport {
  id                           String       @id @default(uuid())
  name                         String       
  description                  String
  max_capacity                 Int
  additional_price             Float
  requires_medical_certificate Boolean
  deleted_at                   DateTime?
}
```

## 3. Arquitectura y Flujo

### 3.1 Componentes de Arquitectura Hexagonal

1. **Puerto (Domain)**: `SportRepository`, con métodos como `findById(id)` y `update(id, data)`.
2. **Adaptador de Entrada (Delivery)**: `SportController`, encargado de recibir el `id` de la URL y el body de la petición, delegando al caso de uso.
3. **Adaptador de Salida (Infrastructure)**: `PostgresSportRepository`, implementa los métodos `findById` y `update`.

### 3.2 Lógica del Caso de Uso

**Caso de Uso:** `UpdateSportUseCase`

1. Recibir el `id` del deporte a actualizar.
2. Buscar el deporte mediante su id.
3. Si el deporte no existe, retornar error.
4. Validar que la petición incluya al menos un campo para actualizar. 
5. Verificar que la petición no intente modificar `name`.
6. Verificar que la petición no intente modificar `deleted_at`. 
7. Si se recibe `max_capacity`, verificar que sea mayor a cero.
8. Si se recibe `additional_price`, verificar que no sea negativo.
9. Mapear el DTO a la entidad de dominio `Sport`.
10. Persistir los cambios a través de `SportRepository`.
11. Retornar el deporte actualizado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| :--- | :--- | :--- |
| Deporte inexistente | "El deporte no existe" | 404 Not Found |
| Intento de modificar `name` | "El nombre del deporte no puede modificarse después de la creación" | 400 Bad Request |
| Intento de modificar `deleted_at` desde este endpoint | "La baja del deporte solo puede modificarse mediante la operación correspondiente" | 400 Bad Request |
| `max_capacity` menor o igual a cero | "El cupo máximo debe ser mayor a cero" | 400 Bad Request |
| `additional_price` negativo | "El precio adicional no puede ser negativo" | 400 Bad Request |
| Request sin campos para actualizar | "Debe enviar al menos un campo para actualizar" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |
| Actualización exitosa | Retorna el deporte actualizado | 200 OK |

## 5. Plan de Implementación

1. Actualizar los tipos en `@alentapp/shared`.
2. Ampliar el puerto `SportRepository` con los métodos necesarios para consultar y actualizar deportes.
3. Implementar el caso de uso `UpdateSportUseCase`, validando existencia del deporte, inmutabilidad de `name`, restricción de modificación de `deleted_at`, `max_capacity` y `additional_price`.
4. Implementar la actualización en `PostgresSportRepository`.
5. Implementar el endpoint `PATCH /api/v1/sports/:id` en `SportController`.
6. Conectar el formulario de edición con el endpoint del backend.
7. Agregar tests para los escenarios principales de éxito y error. 

## 6. Observaciones Adicionales

* No se permite modificar el `name` desde este endpoint, ya que identifica funcionalmente al deporte dentro del catálogo.
* La actualización debe ser parcial: solo los campos enviados en el body deben modificarse.
* El campo `deleted_at` no puede modificarse manualmente por API desde este endpoint; es un efecto de la operación de baja lógica.
* Se decidió permitir la modificación de todos los campos de `Sport` excepto `name`, ya que `name` funciona como identificador funcional del deporte y debe mantenerse estable después de la creación. Los demás campos representan condiciones administrativas de la actividad y pueden requerir correcciones o actualizaciones sin alterar la identidad del deporte.  