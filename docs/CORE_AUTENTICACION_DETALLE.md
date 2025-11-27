# Core de Autenticación

## Flujo de login (texto)
1. **Cliente Angular** envía `POST /v1/auth/login` con `username` y `password` (`LoginRequest`).【F:src/main/java/com/ferrisys/controller/AuthRestController.java†L26-L34】
2. `UserService.authenticate` valida usuario activo, verifica contraseña con BCrypt y obtiene rol del usuario (`AuthUserRole`).【F:src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L73-L111】
3. `JWTUtil.generateToken` emite JWT HS256 (10h) con `sub = username`.【F:src/main/java/com/ferrisys/config/security/JWTUtil.java†L21-L35】
4. Respuesta `AuthResponse` entrega `token`, `username`, `email` y `role`. El frontend lo guarda en `sessionStorage` vía `AuthService.saveToken`.【F:src/app/services/auth.service.ts†L39-L49】
5. Peticiones posteriores pasan por `AuthInterceptor`, que adjunta `Authorization: Bearer <token>` y redirige a `/login` ante 401.【F:src/app/core/interceptors/auth.interceptor.ts†L21-L63】
6. En backend, `JwtFilterRequest` valida token, carga `UserDetails` y setea `SecurityContext` con authorities de rol y módulos habilitados. Controladores usan `@PreAuthorize` para verificar `MODULE_*` y flags de licencia antes de ejecutar la lógica.【F:src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L31-L63】【F:src/main/java/com/ferrisys/controller/InventoryController.java†L24-L59】

## Archivos clave
- `src/main/java/com/ferrisys/controller/AuthRestController.java`: endpoints `register`, `login`, `change-password`, `modules`.
- `src/main/java/com/ferrisys/service/impl/UserServiceImpl.java`: autenticación, registro, cambio de contraseña y obtención de módulos por usuario.
- `src/main/java/com/ferrisys/config/security/SecurityConfig.java`: `SecurityFilterChain`, CORS, endpoints públicos y sesión stateless.
- `src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java`: filtro `OncePerRequestFilter` que valida y propaga el JWT.
- `src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java`: creación de `UserDetails` con authorities `ROLE_*` y `MODULE_*` según rol/módulos licenciados.【F:src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L28-L66】
- `src/app/services/auth.service.ts`: login y almacenamiento del token en cliente.【F:src/app/services/auth.service.ts†L21-L66】
- `src/app/core/services/modules.service.ts`: consumo paginado de `/v1/auth/modules` y caché en frontend.【F:src/app/core/services/modules.service.ts†L20-L66】
- `src/app/core/guards/module.guard.ts`: bloquea rutas si el módulo requerido no está activo para el usuario.【F:src/app/core/guards/module.guard.ts†L15-L38】
- `src/app/core/services/menu-builder.service.ts`: arma el sidebar mostrando sólo secciones con módulos habilitados.【F:src/app/core/services/menu-builder.service.ts†L23-L86】

## Resolución de permisos de módulos
- **Asignación:** `CustomUserDetailsService` agrega authorities `MODULE_<NOMBRE>` para cada módulo asociado al rol y habilitado por `FeatureFlagService`.【F:src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L40-L66】
- **Validación backend:** Controladores usan `@PreAuthorize` con `hasAuthority('MODULE_<...>')` y `@featureFlagService.enabledForCurrentUser('<módulo>')` para reforzar licencias por tenant.【F:src/main/java/com/ferrisys/controller/InventoryController.java†L24-L59】
- **Frontend:** `ModulesService` obtiene los módulos del usuario; `ModuleGuard` normaliza nombres (`normalizeModuleName`) y permite/niega navegación. `MenuBuilderService` usa el mismo set para mostrar opciones en el sidebar.【F:src/app/core/guards/module.guard.ts†L15-L38】【F:src/app/core/constants/module-route-map.ts†L1-L35】

## TODOs / mejoras sugeridas
- Incorporar refresh tokens y expiración configurable.
- Agregar endpoints y UI para recuperación/cambio de contraseña guiada (actualmente requiere `userToken`).
- Validar expiración de licencias en frontend (no sólo filtrado por `status`).
- Centralizar persistencia de sesión (token en memoria + storage) y manejo de expiración visible para el usuario.
