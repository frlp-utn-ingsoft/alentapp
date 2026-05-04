---
id: 0007
estado: pendiente
autor: Cesar Huari
fecha: 2026-05-01
titulo: Alta de nuevo locker
---

# TDD-0007: Alta de nuevo locker

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un administrador pueda dar de alta un locker

### User Persona
*   Nombre: Alberto (Tesorero/Administrativo).
*   Necesidad: Poder dar de alta un locker dentro del sistema para que los socios puedan reservar, evitando la duplicacion o la reserva de un locker que no existe

### Criterios de Aceptación
- El sistema debe permitir dar de alta un nuevo locker para los socios con numero y estado
- El sistema debe validar que no se repita el numero de cada locker
- El locker debe quedar con estado `Available` por defecto
- El sistema al finalzar el sistema debe dar un mensaje de exito y mostrar los datos del locker 

## Diseño Técnico (RFC)

### Modelo de Datos

*   `id`: Identificador unico universal (UUID).
*   `location`:cadena de texto,ubicacion de referencia.
*   `number`: Numero entero mayor a cero.
*   `status`: Enumeracion (`Available`,`Occupied`,`Maintenance`) con valor por defecot `Available`.
*   `memeber_id`: Clave foranea que hace referncia a socio asignado,puede ser null

### Contrato de API (@alentapp/shared)

*   Endpoint: `POST /api/v1/Locker`
*   Request Body:(`CreateLockerRequest`):
```ts
{

    number:number;
    location: string;
}
```
### Componentes de Arquitectura Hexagonal

*   Domain:Entidad `locker` y regla de negocio sobre numero unico de locker
*   Application: Caso de uso `CreateLockerUseCase`,encargado de validar el numero y crear el locker.
*   Infrastructure: `PostgresLockerRepository`,encargado de persistir la entidad en la base de datos.
*   Adaptador de entrada: `LockerController`,encargado de recibir la peticion http y mapear errores a codigos http
*   Frontend: Formulario de alta de deporte conectado al endpoint de creacion

## Casos de Borde y Errores
| Escenario                  | Resultado Esperado                                      | Código HTTP               |
| -------------------------- | --------------------------------------------------------| ------------------------- |
| Numero ya creado           | Mensaje: "Ya existe un locker con ese numero"           | 409 Conflict              |
| Faltan campos obligatorios | Mensaje: "Debe completar todos los campos"           | 400 Bas request           |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |
| Creacion exitosa           | Retorna el locker creado                                | 201 Created               |

## Plan de Implementación
1. Definir esquema de persistencia y correr migración.
2. Crear tipos en shared y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso.
4. Crear formulario en React y conectar con el endpoint del backend.
