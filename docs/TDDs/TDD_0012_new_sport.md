---
id: 0012
estado: Propuesto
autor: Maria Pia Porzio
fecha: 2026-04-30
titulo: Registro de Nuevos Deportes
---

# TDD-0012: Registro de Nuevos Deportes

## 1. Contexto de Negocio (PRD)

### 1.1 Objetivo

Permitir que un administrativo registre nuevos deportes en el catálogo del club, definiendo la información necesaria para que puedan ser ofrecidos y gestionados dentro del sistema. 

### 1.2 User Persona

- **Rol:** Administrador.
- **Necesidad:** Cargar nuevos deportes ofrecidos por el club de manera simple y consistente, evitando duplicados y asegurando que cada deporte tenga una capacidad válida. 

### 1.3 Criterios de Aceptación

*   Como administrador, quiero registrar un nuevo deporte para incorporarlo al catálogo de actividades ofrecidas por el club.
    - Escenario de éxito: "Si el usuario completa el registro con los datos correctos, el sistema debe crear el deporte como activo y notificar al usuario".
    - Escenario de fallo: "Si el usuario ingresa un nombre de deporte activo ya existente, el sistema debe bloquear la acción y notificar que ya existe un deporte activo con ese nombre".
    - Escenario de fallo: "Si el usuario ingresa un cupo máximo menor o igual a cero, el sistema debe bloquear la acción y notificar que el cupo máximo debe ser mayor a cero".
    - Escenario de fallo: "Si el usuario ingresa un precio adicional negativo, el sistema debe bloquear la acción y notificar que el precio adicional no puede ser negativo".
    - Escenario de fallo: "Si el usuario no completa campos obligatorios, el sistema debe bloquear la acción y notificar que todos los campos requeridos deben estar presentes".

## 2. Diseño Técnico (RFC)

### 2.1 Modelo de Dominio 

Se definirá la entidad `Sport` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto obligatoria e inmutable luego de la creación. No debe repetirse entre deportes activos. 
- `description`: Cadena de texto obligatoria.
- `max_capacity`: Número entero obligatorio. Debe ser mayor a cero.
- `additional_price`: Número decimal obligatorio. No puede ser negativo.
- `requires_medical_certificate`: Booleano obligatorio. Indica si para inscribirse al deporte se requiere certificado médico vigente.
- `deleted_at`: Fecha de baja lógica, opcional. Si es `null`, el deporte se considera activo dentro del catálogo.

### 2.2 Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido `@alentapp/shared` para definir el cuerpo de la petición y mantener sincronizado el contrato entre frontend y backend.

- **Endpoint:** `POST /api/v1/sports`
- **Request Body (CreateSportRequest):**

```ts
{
    name: string;
    description: string;
    max_capacity: number;
    additional_price: number;
    requires_medical_certificate: boolean;
}
```

### 2.3 Esquema de Persistencia

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

1. **Puerto (Domain):** `SportRepository` con métodos `create(data)` y `findActiveByName(name)`.
2. **Adaptador de Entrada (Delivery):** `SportController`, encargado de recibir la petición HTTP y llamar al caso de uso correspondiente.
3. **Adaptador de Salida (Infrastructure):** `PostgresSportRepository`, implementa los métodos `create` y `findActiveByName` usando Prisma.

### 3.2 Lógica del Caso de Uso

**Caso de Uso:** `CreateSportUseCase`

1. Validar los datos de entrada.
2. Verificar que `name`, `description`, `max_capacity`, `additional_price` y `requires_medical_certificate` estén presentes.
3. Verificar que `max_capacity` sea mayor a cero.
4. Verificar que `additional_price` no sea negativo.
5. Verificar que no exista otro deporte activo con el mismo `name`, considerando activos aquellos cuyo `deleted_at` sea `null`.
6. Mapear el DTO a la entidad de dominio `Sport`.
7. Crear el deporte con `deleted_at = null` por defecto.
8. Persistir la entidad a través de `SportRepository`.
9. Retornar el deporte creado.

## 4. Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --------- | ------------------ | ----------- |
| Campos obligatorios faltantes | Mensaje: "Todos los campos obligatorios deben estar presentes" | 400 Bad Request |
| `max_capacity` menor o igual a cero | Mensaje: "El cupo máximo debe ser mayor a cero" | 400 Bad Request |
| `additional_price` negativo | Mensaje: "El precio adicional no puede ser negativo" | 400 Bad Request |
| Nombre de deporte duplicado en un deporte activo | Mensaje: "Ya existe un deporte activo con ese nombre" | 409 Conflict |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |
| Alta exitosa | Retorna el deporte creado con `deleted_at = null` | 201 Created |

## 5. Plan de Implementación

1. Definir el esquema de persistencia de `Sport` y correr la migración correspondiente. 
2. Crear los tipos necesarios en `@alentapp/shared` y el puerto `SportRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `CreateSportUseCase`, validando campos obligatorios, nombre duplicado entre deportes activos, `max_capacity` mayor a cero, `additional_price` no negativo y creación del deporte como activo.
4. Crear el endpoint `POST /api/v1/sports` en `SportController`.
5. Conectar el formulario de alta en el frontend.
6. Agregar tests para los escenarios principales de éxito y error. 

## 6. Observaciones Adicionales

* El nombre del deporte no debe repetirse entre deportes activos. Puede existir un deporte dado de baja con el mismo nombre, considerando como activo aquel cuyo `deleted_at` sea `null`.
* El campo `name` debe tratarse como identificador funcional del deporte, por eso no debería modificarse después de la creación.
* El campo `deleted_at` no se recibe en el request de creación, ya que el sistema debe inicializarlo en `null` al registrar un nuevo deporte.
* El campo `max_capacity` representa el cupo máximo permitido, por lo que debe validarse desde el alta.
* El alta de un deporte lo deja disponible dentro del catálogo únicamente si se crea con `deleted_at = null`.
* En futuras consultas de deportes disponibles, deberían mostrarse únicamente aquellos deportes cuyo `deleted_at` sea `null`.