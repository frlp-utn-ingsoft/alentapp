---
id: 0004
estado: Propuesto
autor: Santiago Gonzalez D'Angelo
fecha: 2026-04-30
titulo: Registro de Sanciones Disciplinarias
---

# TDD-0004: Registro de Sanciones Disciplinarias

## 1. Contexto de Negocio 

### 1.1. Objetivo

Permitir a los administradores registrar sanciones disciplinarias a los socios del club, estableciendo un período de inhibición durante el cual el socio no podrá realizar acciones dentro del club.

### 1.2. User Persona
*   **Rol**: Administrador
*   **Necesidad**: Registrar una sanción asociada a un socio, indicando el período de suspensión de la misma.

### 1.3. Criterios de Aceptación
*   Como administrador, quiero registrar una sanción para bloquear al socio para que no pueda interactuar con las instalaciones.
    - Escenario de éxito: "Si el usuario completa el registro con los datos correctos, el sistema debe responder creando la sanción y notificando al usuario".
    - Escenario de fallo: "Si el usuario ingresa una fecha de fin menor o igual a la fecha de inicio, el sistema debe bloquear la acción y notificar al usuario que la fecha de fin debe ser estrictamente posterior a la fecha de inicio".
    - Escenario de fallo: "Si el usuario ingresa un socio que no existe, el sistema debe responder indicando el error y cancelando la operación".

## 2. Diseño Técnico 

### 2.1. Modelo de Dominio

Se definirá la entidad "Discipline" con las siguientes propiedades:

*   `id`: Identificador único universal (UUID).
*   `reason`: Cadena de texto, obligatoria.
*   `start_date`: Fecha, obligatoria.
*   `end_date`: Fecha, obligatoria.
*   `is_total_suspension`: Booleano, obligatorio.
*   `deleted_at`: Fecha de eliminación lógica, opcional. Si es `null`, la sanción está activa en el sistema.
*   `member_id`: Identificador del socio sancionado, obligatorio.


### 2.2. Contrato de API (@alentapp/shared)

*   **Endpoint**: `POST /api/v1/disciplines`
*   **Request Body**:
```
{
    reason: string;
    start_date: string en formato ISO 8601 datetime 
    end_date: string en formato ISO 8601 datetime 
    is_total_suspension: boolean;
    member_id: string;
}
```

### 2.3. Esquema de Persistencia

```prisma
model Discipline {
  id                  String   @id @default(uuid())
  reason              String
  start_date          DateTime
  end_date            DateTime
  is_total_suspension Boolean
  deleted_at          DateTime?
  member_id           String
  member              Member   @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

*   **Puerto (Domain)**: `DisciplineRepository` con método `create(data)`.
*   **Adaptador de Entrada (Delivery)**: `DisciplineController`, recibe la request HTTP, extrae el body y delega al caso de uso.
*   **Adaptador de Salida (Infrastructure)**: `PostgresDisciplineRepository`, implementa el método `create`.


### 3.2. Lógica del Caso de Uso

**Caso de Uso**: `NewDisciplineUseCase`.
1. Validar los datos de entrada.
2. Verificar que `end_date` sea estrictamente posterior a `start_date`.
3. Validar que `start_date` y `end_date` cumplan con el formato ISO 8601.
4. Verificar que el socio exista mediante su `member_id`.
5. Verificar que no exista superposición con otras sanciones activas del mismo socio.
6. Mapear el DTO a Entidad de Dominio.
7. Persistir la entidad a través de `DisciplineRepository`.
8. Retornar la sanción creada.

## 4. Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Socio inexistente     | "El socio no existe"       | 404 Not Found              |
| Fecha de fin menor a fecha de inicio | "La fecha de fin debe ser estrictamente posterior a la fecha de inicio"              | 400 Bad Request           |
| Campos obligatorios faltantes | "Todos los campos son requeridos" | 400 Bad Request |
| Formato de fecha inválido | "Formato de fecha inválido" | 400 Bad Request |
| Superposición de sanciones | "Ya existe una sanción activa en ese período" | 409 Conflict |
| Error de conexión a DB     | "Error interno, reintente más tarde" | 500 Internal Server Error |

## 5. Plan de Implementación

1. Definir el esquema de persistencia de `Discipline` y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto `DisciplineRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `NewDisciplineUseCase`, validando fechas y existencia del socio.
4. Crear formulario y conectar con el endpoint `POST /api/v1/disciplines`.

## 6. Observaciones Adicionales

* Al crear una sanción, `deleted_at` debe inicializarse en `null`.
* Las sanciones con `deleted_at` distinto de `null` no deben considerarse activas.
* La consulta de si un socio está suspendido actualmente debería resolverse comparando la fecha actual con `start_date` y `end_date`.
* Las operaciones sobre sanciones deben verse reflejadas en el estado disciplinario del socio.
* El estado del socio debe recalcularse en función de las sanciones activas.
