# Módulo administrativo de Core de Autenticación

## Alcance
- CRUD de **usuarios**, **roles** y **módulos**.
- Asignación de **roles a usuarios** y **módulos a roles** (matriz de permisos).
- Gestión de **licencias de módulo por tenant**.
- Rutas bajo `/main/auth/*` protegidas por `ModuleGuard` con el módulo `Core de Autenticación`.

## Frontend (Angular)
- **Rutas:** definidas en `src/app/pages/auth-admin/auth-admin.routes.ts` y registradas como hijas de `main/auth` en `app.routes.ts`.
- **Componentes standalone:**
  - Usuarios: `UsersListComponent`, `UserFormComponent`, `UserRoleAssignmentComponent`.
  - Roles: `RolesListComponent`, `RoleFormComponent`, `RoleModulesAssignmentComponent`.
  - Módulos: `ModulesListComponent`, `ModuleFormComponent`.
  - Permisos: `PermissionsMatrixComponent` (checkbox por rol/módulo).
  - Licencias: `ModuleLicensesComponent`.
- **Servicios:** ubicados en `src/app/core/services/auth-admin/`, consumen `/v1/auth/admin/*`.
- **Menú:** sección “Core de Autenticación” añadida en `MenuBuilderService` visible sólo con el módulo habilitado.

## Backend (Spring Boot)
- **Controlador:** `AuthAdminController` (`/v1/auth/admin`) protegido con `@PreAuthorize("hasAuthority('MODULE_CORE_DE_AUTENTICACION')")`.
- **Endpoints clave:**
  - `GET/POST/PUT/DELETE /users`, `/roles`, `/modules` para CRUD.
  - `POST /role-modules` y `/user-roles` para asignaciones.
  - `GET/POST /module-licenses` para licencias de módulo.
- **Repositorios utilizados:** `UserRepository`, `RoleRepository`, `ModuleRepository`, `RoleModuleRepository`, `AuthUserRoleRepository`, `ModuleLicenseRepository`.

### Notas sobre estado de usuarios
- Los formularios trabajan con un status numérico (1 activo / 0 inactivo) y el backend lo convierte a `UserStatus` usando los IDs de `DefaultUserStatus` (`ACTIVE`/`INACTIVE`).

## Consideraciones
- Las peticiones frontend utilizan `ApiService`, por lo que heredan headers JWT del interceptor existente.
- Los nombres de módulo se normalizan a mayúsculas y guiones bajos (e.g. `CORE_DE_AUTENTICACION`) para ser compatibles con `ModuleGuard` y authorities.
- El controlador usa DTOs internos simples para mantener bajo acoplamiento y se apoya en `UserService` para altas de usuarios (incluye hashing de contraseña y rol por defecto).
