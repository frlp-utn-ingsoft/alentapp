# Guia de Contribucion

¡Gracias por contribuir a Alentapp! Para mantener el proyecto organizado y profesional, seguimos estas guias.

## Formato de Mensajes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/). El formato debe ser:

`<tipo>(<alcance>): <descripcion>`

- **feat**: Una nueva funcionalidad.
- **fix**: Correccion de un error.
- **docs**: Cambios en la documentacion (ej. TDDs).
- **style**: Cambios que no afectan el significado del codigo (espacios, formato, etc.).
- **refactor**: Cambio de codigo que no corrige un error ni añade una funcionalidad.

Ejemplo: `docs(tdd): agrega tdd de emision de cuotas`

## Creacion de TDDs

1. Usa la plantilla en `docs/TDDs/TEMPLATE.md`.
2. Asegurate de que el ID sea correlativo.
3. El autor debe ser tu nombre completo.
4. No usar tildes en el cuerpo tecnico para evitar errores de visualizacion en diferentes entornos.

## Flujo de Trabajo

1. Crea una rama desde `main`: `feature/nombre-de-la-funcionalidad`.
2. Realiza tus cambios y commitea siguiendo el formato.
3. Abre un Pull Request hacia `main`.
4. Espera la revision de al menos un companero.
