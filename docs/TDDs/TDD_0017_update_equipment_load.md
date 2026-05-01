---
id: 0017
estado: Propuesto
autor: Martina García Améndola
fecha: 2026-05-01
titulo: Actualización de Préstamos de un Equipo Existentes
---

# TDD-0017: Actualización de Préstamos de un Equipo Existentes

## Contexto de Negocio (PRD)

### Objetivo

---
# A definir

¿La modificación de un prestamos serian cuando el prestamo pasa a estado `Returned` o `Demaged`?
- En el caso de `Returned` -> el prestamo cambiaria de estado cuando se ACTUALIZA el prestamo-> POCESO ACTIVADO MANUALMENTE:
-> Endpoint: `POST /api/v1/equipment-load/{id}`
-> Request Body (`ReturnEquipmentLoad`): 
```{

} --> ¿request body vacio?
```
- En el caso de `Demaged` -> el prestamo cambia de estado cuando la fecha actual supera la fecha limitre-> POCESO ACTIVADO AUTOMATICAMENTE
---