---
id: 0013
estado: Propuesto
autor: Maria Pia Porzio
fecha: 2026-04-30
titulo: Actualización de Deportes Existentes
---

# TDD-0013: Actualización de Deportes Existentes

## 1. Contexto de Negocio (PRD)

### 1.1 Objetivo

Permitir que un administrativo actualice los datos editables de un deporte existente. El `name` se mantiene inmutable después de la creación, y cualquier modificación del `max_capacity` debe respetar la cantidad actual de inscriptos.

### 1.2 User Persona

- **Rol:** Administrador.
- **Necesidad:** Actualizar la configuración de un deporte cuando cambian sus condiciones, sin alterar el nombre del deporte ni generar inconsistencias con las inscripciones ya existentes.

### 1.3 Criterios de Aceptación

*   Como administrador, quiero modificar los datos editables de un deporte para mantener actualizadas las condiciones de la actividad. 
    - Escenario de éxito: "Si el usuario modifica datos editables del deporte con valores válidos, el sistema debe guardar los cambios y notificar al usuario".
    - Escenario de fallo: "Si el usuario intenta modificar el nombre del deporte, el sistema debe bloquear la acción y notificar que el nombre no puede modificarse después de la creación".
    - Escenario de fallo: "Si el usuario intenta modificar el estado del deporte, el sistema debe bloquear la acción y notificar que el estado solo puede modificarse mediante la baja lógica del deporte".
    - Escenario de fallo: "Si el usuario intenta asignar un cupo máximo menor o igual a cero, el sistema debe bloquear la acción y notificar que el cupo máximo debe ser mayor a cero".
    - Escenario de fallo: "Si el usuario intenta reducir el cupo máximo por debajo de la cantidad actual de inscriptos, el sistema debe bloquear la acción y notificar que el cupo no puede ser menor a los inscriptos actuales".
    - Escenario de fallo: "Si el usuario intenta asignar un precio adicional negativo, el sistema debe bloquear la acción y notificar que el precio adicional no puede ser negativo".
    - Escenario de fallo: "Si el usuario intenta modificar un deporte inexistente, el sistema debe responder indicando el error y cancelar la operación".

## 2. Diseño Técnico (RFC)

### 2.1 Modelo de Dominio 

La entidad de dominio `Sport` mantiene los mismos campos definidos para el alta. En esta funcionalidad no se permite modificar `name`. El campo `is_active` tampoco se modifica desde este endpoint, ya que su cambio corresponde al caso de uso de baja lógica. 

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto obligatoria, única e inmutable.
- `description`: Cadena de texto obligatoria y editable.
- `max_capacity`: Número entero obligatorio y editable. Debe ser mayor a cero.
- `additional_price`: Número decimal obligatorio. No puede ser negativo.
- `requires_medical_certificate`: Booleano obligatorio.
- `is_active`: Booleano obligatorio. Indica si el deporte se encuentra activo dentro del catálogo.

### 2.2 Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido `@alentapp/shared` para definir una actualización parcial. Aunque el endpoint utiliza `PUT`, solo se modificarán los campos enviados en el request. 

- **Endpoint:** `PUT /api/v1/sports/:id`
- **Request Body (UpdateSportRequest):**

```ts
{
    description?: string;
    max_capacity?: number;
    additional_price?: number;
    requires_medical_certificate?: boolean;
}
```

### 2.3 Esquema de Persistencia

No se requiere crear una nueva tabla. Se actualiza el registro existente del modelo `Sport`.

```prisma
model Sport {
  id                           String       @id @default(uuid())
  name                         String       @unique
  description                  String
  max_capacity                 Int
  additional_price             Float
  requires_medical_certificate Boolean
  is_active                    Boolean      @default(true)

  enrollments                  Enrollment[]
}
```

## 3. Arquitectura y Flujo

### 3.1 Componentes de Arquitectura Hexagonal

1. **Puerto (Domain):** `SportRepository`, con métodos como `findById(id)`, `update(id, data)` y `countEnrollmentsBySportId(id)`.
2. **Adaptador de Entrada (Delivery):** `SportController`, encargado de recibir el `id` de la URL y el body de la petición, delegando al caso de uso.
3. **Adaptador de Salida (Infrastructure):** `PostgresSportRepository`, implementa los métodos `findById`, `update` y `countEnrollmentsBySportId`.

### 3.2 Lógica del Caso de Uso

**Caso de Uso:** `UpdateSportUseCase`

1. Recibir el `id` del deporte a actualizar.
2. Buscar el deporte mediante su id.
3. Si el deporte no existe, retornar error.
4. Validar que la petición incluya al menos un campo para actualizar. 
5. Verificar que la petición no intente modificar `name`.
6. Verificar que la petición no intente modificar `is_active`. 
7. Si se recibe `max_capacity`, verificar que sea mayor a cero.
8. Si se reduce el cupo, obtener la cantidad actual de inscriptos.
9. Verificar que el nuevo `max_capacity` no sea menor que la cantidad de inscriptos actuales.
10. Si se recibe `additional_price`, verificar que no sea negativo.
11. Mapear el DTO a la entidad de dominio `Sport`.
12. Persistir los cambios a través de `SportRepository`.
13. Retornar el deporte actualizado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --------- | ------------------ | ----------- |
| Deporte inexistente | "El deporte no existe" | 404 Not Found |
| Intento de modificar `name` | "El nombre del deporte no puede modificarse después de la creación" | 400 Bad Request |
| Intento de modificar `is_active` desde este endpoint | "El estado del deporte solo puede modificarse mediante la baja lógica" | 400 Bad Request |
| `max_capacity` menor o igual a cero | "El cupo máximo debe ser mayor a cero" | 400 Bad Request |
| Nuevo cupo menor que inscriptos actuales | "El cupo máximo no puede ser menor a la cantidad de inscriptos actuales" | 409 Conflict |
| `additional_price` negativo | "El precio adicional no puede ser negativo" | 400 Bad Request |
| Request sin campos para actualizar | "Debe enviar al menos un campo para actualizar" | 400 Bad Request |
| Error de conexión a DB | "Error interno, reintente más tarde" | 500 Internal Server Error |
| Actualización exitosa | Retorna el deporte actualizado | 200 OK |

## 5. Plan de Implementación

1. Actualizar los tipos en `@alentapp/shared`.
2. Ampliar el puerto `SportRepository` con los métodos necesarios para consultar y actualizar deportes.
3. Implementar el caso de uso `UpdateSportUseCase`, validando existencia del deporte, inmutabilidad de `name`, restricción de modificación de `is_active`, `max_capacity`, `additional_price` y cantidad actual de inscriptos.
4. Implementar la actualización en `PostgresSportRepository`.
5. Crear la ruta `PUT /api/v1/sports/:id` en `SportController`.
6. Conectar el formulario de edición con el endpoint del backend.
7. Agregar tests para los escenarios principales de éxito y error. 

## 6. Observaciones Adicionales

* No se permite modificar el `name` desde este endpoint, ya que identifica funcionalmente al deporte dentro del catálogo.
* El campo `is_active` no se modifica desde este endpoint general de actualización. Su modificación corresponde al caso de uso de baja lógica.
* Si se modifica `max_capacity`, debe validarse contra la cantidad actual de inscriptos para evitar inconsistencias con `Enrollment`.
* Se decidió permitir la modificación de todos los campos de `Sport` excepto `name`, ya que la baja de un deporte será lógica mediante `is_active` y no eliminará el registro de la base de datos. Por este motivo, si se necesitara corregir o actualizar datos como `description`, `max_capacity`, `additional_price` o `requires_medical_certificate`, no sería conveniente depender de dar de baja y crear un nuevo deporte, especialmente porque el `name` no podría reutilizarse al mantenerse como identificador único.

