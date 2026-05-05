# Guía de Contribución - Alentapp

¡Gracias por querer contribuir a Alentapp! Para mantener el código limpio y organizado, seguimos estas reglas de contribución.

## 1.🌿 Estrategia de Ramas (Branching)

No se permite pushear directamente a la rama `main`. Todas las contribuciones deben hacerse a través de **Feature Branches**.

###1.1 Formato de nombres de rama:

*   `feature/nombre-de-la-funcionalidad` (para nuevas características)
*   `fix/descripcion-del-error` (para corrección de bugs)
*   `docs/mejoras-en-documentacion` (para cambios en docs)
*   `refactor/nombre-del-cambio` (para mejoras de código sin cambio de lógica)

---

## 2. 🛠 Flujo de Trabajo (Workflow)

###2.1.  **Sincronizar**: Asegúrate de tener la última versión de `main`:
    ```bash
    git checkout main
    git pull origin main
    ```
###2.2.  **Crear Rama**: Crea tu rama de trabajo:
    ```bash
    git checkout -b feature/nueva-funcionalidad
    `
###2.3.  **Desarrollar**: Escribe tu código siguiendo los estándares del proyecto.

###2.4.  **Verificar**: Antes de subir tus cambios, **todos los tests deben pasar**. Consulta la [Guía de Testing](./TESTING.md) para más detalles.
    *   `npm run test` (Unitarios)
    *   `npm run e2e:fullstack:run` (E2E Full-stack)

###2.5.  **Commit**: 

    **Estructura de commits**:

        '<tipo-de-commit>[scope]: <descripcion>'

    Ejemplos:
        `feat(backend): add filter for cars`
        `fix(web): remove wrong color`

    **Prefijos aceptados**: 

    *   `feat: Una nueva característica para el usuario.`
    *   `fix: Arregla un bug que afecta al usuario.`
    *   `perf: Cambios que mejoran el rendimiento del sitio.`
    *   `build: Cambios en el sistema de build, tareas de despliegue o instalación.`
    *   `ci: Cambios en la integración continua.`
    *   `docs: Cambios en la documentación.`
    *   `refactor: Refactorización del código como cambios de nombre de variables o funciones.`
    *   `style: Cambios de formato, tabulaciones, espacios o puntos y coma, etc; no afectan al usuario.`
    *   `test: Añade tests o refactoriza uno existente.`


###2.6.  **Pull Request (PR)**: 

    Este repositorio utiliza templates estandarizados para Pull Requests.
    Los mismos se encuentran en:

    ```
    .github/PULL_REQUEST_TEMPLATE/
    ```

    ### 📂 Templates disponibles

    * `feature.md` → nuevas funcionalidades
    * `fix.md` → corrección de bugs
    * `refactor.md` → mejoras internas sin cambio funcional
    * `docs.md` → cambios en documentación

    ### 🧭 Cómo usarlos

    1. Crear un Pull Request desde GitHub
    2. Seleccionar el template correspondiente en el selector
    3. Completar todas las secciones requeridas

    ### ⚠️ Reglas

    * Todo PR debe usar un template
    * Completar secciones de testing y evidencia cuando aplique
    * Asociar el PR a un issue cuando corresponda (`Closes #ID` o `Refs #ID`)

    ### 📝 Template por defecto

    Si no se selecciona uno específico, se utilizará:

    ```
    .github/pull_request_template.md
    ```

---

## 3. 🎨 Estándares de Código
*   **Linting**: Asegúrate de correr `npm run lint` antes de commitear.
*   **Tipado**: No uses `any` en TypeScript. Define interfaces o tipos para todo.
*   **Documentación**: Si agregas una funcionalidad compleja, actualiza los docs correspondientes.

---

## 4. ✅ Checklist para Pull Requests
* [ ] ¿Pasan todos los tests locales?
* [ ] ¿La rama tiene un nombre descriptivo?
* [ ] ¿Se eliminaron `console.log` o comentarios innecesarios?
* [ ] ¿Se actualizó la documentación si era necesario?
