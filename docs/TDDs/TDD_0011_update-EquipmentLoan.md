---
id: 0011
estado: En revisión
autor: Juan Bautista Flores
fecha: 2026-05-03
titulo: Actualización de Préstamo de Equipamiento
---

# TDD-0011: Actualización de Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir al personal encargado del equipamiento actualizar el estado de un préstamo vigente (por ejemplo, para asentar devoluciones o roturas), extender la fecha de vencimiento o corregir datos ingresados erróneamente en el registro original.

### User Persona

- Nombre: Martin (Encargado de Pañol / Utilería).
- Necesidad: Modificar rápidamente el estado de un préstamo cuando un socio devuelve el material. Necesita poder marcar si el elemento volvió en buenas condiciones o si sufrió algún daño para el control de inventario.

### Criterios de Aceptación

- El sistema debe permitir actualizar uno, varios o todos los campos modificables del préstamo.
- El sistema debe permitir actualizar el `status` del préstamo exclusivamente a los valores permitidos: "Loaned", "Returned" o "Damaged".
- Si durante la actualización se modifica el `member_id` (reasignación a otro socio), el sistema debe validar obligatoriamente que el nuevo socio posea categoría "Senior" o "Lifetime".
- El sistema debe rechazar la actualización si el nuevo socio referenciado pertenece a la categoría "Cadet", ya que tienen prohibido solicitar material.
- Si la edición es correcta, debe retornar los nuevos datos del préstamo actualizados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Se utilizará el paquete compartido para definir el cuerpo de la petición. Todos los campos son opcionales ya que se trata de una actualización parcial (PATCH a nivel de negocio, aunque el endpoint implemente PUT).

- Endpoint: `PUT /api/v1/equipment-loans/:id`
- Request Body (UpdateEquipmentLoanRequest):
```ts
{
    item_name?: string;
    status?: 'Loaned' | 'Returned' | 'Damaged';
    due_date?: string;
    member_id?: string; 
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EquipmentLoanRepository` (Método update(id, data)).
2. **Servicio de Dominio**: `EquipmentLoanValidator` (Encargado de verificar si en la actualización viene un nuevo member_id y, de ser así, validar su categoría consultando la entidad Member).
3. **Caso de Uso**: `UpdateEquipmentLoanUseCase` (Orquesta la validación de la regla de negocio y llama al repositorio).
4. **Adaptador de Salida**: `PostgresEquipmentLoanRepository` (Actualización en la base de datos, implementado con Prisma o la herramienta definida en el proyecto).
5. **Adaptador de Entrada**: `EquipmentLoanController` (Ruta HTTP que extrae el id de la URL y mapea excepciones a códigos HTTP correspondientes).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                             | Código HTTP actual        |
| -------------------------- | -------------------------------------------------------------- | ------------------------- |
| Préstamo inexistente       | Mensaje: "El préstamo referenciado no existe"                  | 404 Not Found             |
| Reasignación a socio Cadet | Mensaje: "Los socios Cadet tiene prohibido solicitar material" | 403 Forbidden             |
| Cambio a estado inválido   | Mensaje: "El estado ingresado no es válido"                    | 400 Bad Request           |
| Socio nuevo no existe      | Mensaje: "El socio referenciado no existe"                     | 400 Bad Request           |           
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"                  | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar las interfaces en el paquete @alentapp/shared agregando el tipo `UpdateEquipmentLoanRequest`.
2. Ampliar el `EquipmentLoanRepository` con el método update.
3. Implementar la lógica en `UpdateEquipmentLoanUseCase`, asegurando que la validación de categoría se ejecute solo si data.member_id está presente en el payload.
4. Crear la ruta PUT en el controlador y enlazarla a la aplicación.
5. Consumir el endpoint desde el frontend, permitiendo cambiar el estado del préstamo mediante un menú desplegable o botones de acción rápida ("Marcar Devuelto" / "Reportar Daño").