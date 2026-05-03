---
id: 0014
estado: Propuesto
autor: Maria Pia Porzio
fecha: 2026-04-30
titulo: Eliminación de Deportes Existentes
---

# TDD-0014: Eliminación de Deportes Existentes

## 1. Contexto de Negocio (PRD)

### 1.1 Objetivo

Permitir que un administrativo dé de baja un deporte que ya no se ofrece en el club, evitando que siga disponible para nuevas inscripciones y conservando la información histórica asociada.

### 1.2 User Persona

- **Rol:** Administrador.
- **Necesidad:** Dar de baja un deporte que fue cargado incorrectamente o que dejó de ofrecerse, evitando que siga disponible para nuevas inscripciones sin perder el historial asociado.

### 1.3 Criterios de Aceptación

*   Como administrador, quiero dar de baja un deporte para que deje de estar disponible en el catálogo sin eliminar su historial de inscripciones. 
    - Escenario de éxito: "Si el usuario da de baja un deporte existente y activo, el sistema debe marcarlo como inactivo y notificar al usuario".
    - Escenario de fallo: "Si el usuario intenta dar de baja un deporte inexistente, el sistema debe cancelar la acción y notificar al usuario".
    - Escenario de fallo: "Si el usuario intenta dar de baja un deporte que ya se encuentra inactivo, el sistema debe bloquear la acción y notificar que el deporte ya fue dado de baja".
    - Escenario de fallo: "Si ocurre un error de conexión con la base de datos, el sistema debe informar un error interno".

## 2. Diseño Técnico (RFC)

### 2.1 Modelo de Dominio

La entidad de dominio `Sport` mantiene los mismos campos definidos para el alta. En esta funcionalidad se modifica únicamente el campo `is_active`.

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto obligatoria, única e inmutable.
- `description`: Cadena de texto obligatoria.
- `max_capacity`: Número entero obligatorio. Debe ser mayor a cero.
- `additional_price`: Número decimal obligatorio. No puede ser negativo.
- `requires_medical_certificate`: Booleano obligatorio.
- `is_active`: Booleano obligatorio. Si es `true`, el deporte está activo en el catálogo. Si es `false`, el deporte fue dado de baja.

### 2.2 Contrato de API (@alentapp/shared)

- **Endpoint:** `DELETE /api/v1/sports/:id`
- **Request Body:** `None`

### 2.3 Esquema de Persistencia

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

1. **Puerto (Domain):** `SportRepository`, con métodos como `findById(id)` y `softDelete(id)`. 
2. **Adaptador de Entrada (Delivery):** `SportController`, encargado de recibir el `id` desde la URL y delegar al caso de uso. 
3. **Adaptador de Salida (Infrastructure):** `PostgresSportRepository`, implementa los métodos `findById` y `softDelete`. 

### 3.2 Lógica del Caso de Uso

**Caso de Uso:** `DeleteSportUseCase`

1. Recibir el `id` del deporte a dar de baja desde el controlador.
2. Buscar el deporte mediante su id.
3. Si el deporte no existe, cancelar la operación y notificar el error.
4. Verificar que el deporte no se encuentre ya inactivo. 
5. Marcar el deporte como inactivo, asignando `is_active = false`.
6. Persistir el cambio a través de `SportRepository`.
7. Retornar respuesta de éxito vacía.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --------- | ------------------ | ----------- |
| Deporte inexistente | Mensaje: "El deporte no existe" | 404 Not Found |
| ID con formato inválido | Mensaje: "Formato de ID inválido" | 400 Bad Request | 
| Deporte ya inactivo | "El deporte ya fue dado de baja" | 409 Conflict | 
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |
| Baja exitosa | Respuesta vacía | 204 No Content |

## 5. Plan de Implementación

1. Ampliar el puerto `SportRepository` con los métodos necesarios para consultar y dar de baja un deporte. 
2. Implementar el caso de uso `DeleteSportUseCase`.
3. Implementar la baja lógica en `PostgresSportRepository`, actualizando `is_active` a `false`. 
4. Crear el endpoint `DELETE /api/v1/sports/:id` en `SportController`.
5. Conectar la funcionalidad en el frontend agregando confirmación previa a la baja. 
6. Agregar tests para los escenarios principales de éxito y error. 

## 6. Observaciones Adicionales 

* Antes de dar de baja un deporte, el frontend debería mostrar una confirmación al usuario para evitar bajas accidentales.
* Esta operación realiza una baja lógica: el deporte no se elimina físicamente de la base de datos, sino que se marca como inactivo mediante `is_active = false`.
* Las inscripciones asociadas al deporte no se eliminan, ya que se conserva el historial de actividades e inscripciones.
* Los deportes inactivos no deberían estar disponibles para nuevas inscripciones.
* Las consultas utilizadas para mostrar deportes disponibles deberían filtrar únicamente aquellos registros con `is_active = true`.
