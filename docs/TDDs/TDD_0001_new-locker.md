---
id: 0001
estado: pendiente
autor: Cesar Huari
fecha: 2026-05-01
titulo: Alta de nuevo locker
---

# TDD-[0001]: Alta de nuevo locker

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un administrador pueda dar de alta un locker

### User Persona
*   Nombre: Alberto (Tesorero/Administrativo).
*   Necesidad: Poder dar de alta un locker dentro del sistema para que los socios puedan reservar, evitando la duplicacion o la reserva de un locker que no existe

### Criterios de Aceptación
- El sistema debe permitir dar de alta un nuevo locker para los socios con numero y estado
- El sistema debe validar que no se repita el numero de cada locker
- El sistema al finalzar el sistema debe dar un mensaje de exito y mostrar los datos del locker 

## Diseño Técnico (RFC)

### Modelo de Datos
[Descripción de cambios en Prisma o nuevas entidades.]
*   `id`: Identificador unico universal (UUID).
*   `number`: Numero entero mayor a cero.
*   `status`: Enumeracion (`Reserved`,`Maintenance`,`Unreserved`) con valor por defecot `Unreserved`.

### Contrato de API (@alentapp/shared)
Se definira el contrato compartido para crear deportes desde el frontend y mantener sincronizacion con el backend
*   Endpoint: `POST /api/v1/Locker`
*   Request Body:(`CreateSportRequest`):
```ts
{
    number:number;
    status: 'Reserved' | 'Maintenance' | 'Unreserved';
}
```
### Componentes de Arquitectura Hexagonal
[Cómo se distribuye la lógica en las capas.]
*   Domain:Entidad `locker` y reglas de negocio sobre numero de locker unico y no permite su reserva si su estado en "maintenance".
*   Application: Caso de uso `CreateLockerUseCase`,encargado de validar el numero y crear el locker.
*   Infrastructure: `PostgresSportRepository`,encargado de persistir la entidad en la base de datos.
*   Adaptador de entrada: `LockerController`,encargado de recibir la peticion http y mapear errores a codigos http
*   Frontend: Formulario de alta de deporte conectado al endpoint de creacion

## Casos de Borde y Errores
| Escenario                  | Resultado Esperado                            | Código HTTP               |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Numero ya creado           | Mensaje: "Ya existe un locker con ese numero" | 409 Conflict              |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |
| Creacion exitosa           | Retorna el locker creado                      | 201 Created               |

## Plan de Implementación
1. Definir esquema de persistencia y correr migración.
2. Crear tipos en shared y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso.
4. Crear formulario en React y conectar con el endpoint del backend.