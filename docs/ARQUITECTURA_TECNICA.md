# Arquitectura técnica de Qbit-SasS / Ferrisys

## Resumen del proyecto
Aplicación SaaS de ferretería con backend Spring Boot y frontend Angular. Provee autenticación JWT, catálogo de módulos habilitados por rol y pantallas iniciales para inventario, clientes, proveedores, cotizaciones y compras.

## Tecnologías principales
- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Flyway, Lombok, JJWT.
- **Frontend:** Angular standalone con routing modular, NG-ZORRO, RxJS.
- **Base de datos:** PostgreSQL, migraciones gestionadas con Flyway.
- **Seguridad:** JWT stateless, authorities basadas en rol y módulos/licencias.

## Arquitectura backend
- **Capas:** `controller` (REST) → `service` (casos de uso) → `repository` (Spring Data) → `entity` (JPA) → PostgreSQL.
- **Paquetes clave:**
  - `com.ferrisys.config.security`: configuración de seguridad, filtros JWT, carga de usuarios y authorities.【F:src/main/java/com/ferrisys/config/security/SecurityConfig.java†L20-L62】【F:src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L24-L69】
  - `com.ferrisys.controller`: controladores REST para auth, módulos, inventario, clientes, proveedores, cotizaciones y compras.【F:src/main/java/com/ferrisys/controller/AuthRestController.java†L13-L50】【F:src/main/java/com/ferrisys/controller/InventoryController.java†L20-L63】
  - `com.ferrisys.service` y `impl`: lógica de negocio y acceso a datos (p. ej. autenticación, inventario).【F:src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L25-L118】
  - `com.ferrisys.repository`: interfaces JPA para usuarios, roles, módulos, productos, etc.
  - `com.ferrisys.common.entity`: entidades JPA de seguridad (usuarios, roles, módulos), negocio (inventario, clientes, proveedores) y licencias.【F:src/main/java/com/ferrisys/common/entity/user/AuthModule.java†L18-L35】【F:src/main/java/com/ferrisys/common/entity/user/AuthRoleModule.java†L18-L36】
- **Configuración y migraciones:**
  - Flyway ejecuta migraciones en `src/main/resources/db/migration` (baseline, seed de roles, módulos y licencias). El archivo `V99__seed_auth_modules.sql` define el catálogo completo de módulos funcionales.【F:src/main/resources/db/migration/V99__seed_auth_modules.sql†L1-L64】

## Modelo de seguridad
- **Tablas principales:** `auth_user`, `auth_role`, `auth_module`, `auth_role_module`, `auth_user_role`, `module_license` (habilita módulos por tenant), `auth_user_status`.
- **Construcción de `UserDetails`:** `CustomUserDetailsService` carga el usuario activo, recupera su rol y añade authorities `ROLE_<ROL>` y `MODULE_<MÓDULO>` normalizados según los módulos asociados al rol y habilitados por `FeatureFlagService`/licencias.【F:src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L28-L66】
- **Token JWT:** `JWTUtil` genera tokens HS256 con subject = username y expiración de 10 horas; `JwtFilterRequest` los valida en cada petición y pobla el `SecurityContext` si son válidos.【F:src/main/java/com/ferrisys/config/security/JWTUtil.java†L21-L47】【F:src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L31-L63】
- **Autorización:** `SecurityConfig` expone `/v1/auth/login`, `/v1/auth/register` y `/actuator/health` como públicos; el resto exige autenticación. Validaciones adicionales se realizan con `@PreAuthorize` usando authorities de módulo y flags de licencia en los controladores de negocio.【F:src/main/java/com/ferrisys/config/security/SecurityConfig.java†L34-L52】【F:src/main/java/com/ferrisys/controller/InventoryController.java†L24-L59】

## Arquitectura frontend
- **Estructura:** Angular standalone con rutas en `app.routes.ts`, layout principal `MainLayoutComponent` y módulos de páginas bajo `app/pages` (categorías, productos, inventario, clientes, proveedores, cotizaciones, compras, welcome).【F:src/app/app.routes.ts†L7-L47】
- **Layout:** `main` agrupa el `MainLayoutComponent` (sidebar + header) y carga rutas hijas dinámicamente.
- **Autenticación en cliente:**
  - `AuthService` realiza login contra `/v1/auth/login`, guarda el token en `sessionStorage` y ofrece `logout`.【F:src/app/services/auth.service.ts†L21-L66】
  - `AuthInterceptor` adjunta el JWT a todas las peticiones (excepto login/register), maneja 401 y limpia estado/redirige a `/login`.【F:src/app/core/interceptors/auth.interceptor.ts†L21-L63】
  - `ModulesService` consume `/v1/auth/modules` paginado y cachea los módulos habilitados; `ModuleGuard` usa esa lista para permitir acceso a rutas protegidas por módulo.【F:src/app/core/services/modules.service.ts†L20-L66】【F:src/app/core/guards/module.guard.ts†L15-L38】
  - `MenuBuilderService` construye el sidebar con secciones visibles sólo si el usuario tiene módulos requeridos (normalizados).【F:src/app/core/services/menu-builder.service.ts†L23-L86】

## Flujo de autenticación
1. **Login:** Cliente envía credenciales a `POST /v1/auth/login` (DTO `LoginRequest`). `UserService.authenticate` valida usuario activo, verifica contraseña y emite `AuthResponse` con JWT y rol.【F:src/main/java/com/ferrisys/controller/AuthRestController.java†L26-L34】【F:src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L79-L111】
2. **Generación de JWT:** `JWTUtil.generateToken` firma con HS256 y expiración de 10 horas.【F:src/main/java/com/ferrisys/config/security/JWTUtil.java†L21-L35】
3. **Validación:** `JwtFilterRequest` intercepta peticiones, extrae Bearer token, valida firma/expiración y carga `UserDetails` para poblar `SecurityContext` con authorities de rol/módulo.【F:src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L36-L64】
4. **Autorización de endpoints:** Anotaciones `@PreAuthorize` verifican flags/módulos según autoridades (`MODULE_*`) y roles; solicitudes no autorizadas reciben 401/403.
5. **Frontend:** `AuthInterceptor` agrega el token a headers; `ModulesStore` carga una vez los módulos del usuario y `ModuleGuard` restringe rutas. El sidebar se arma según módulos activos devueltos por `/v1/auth/modules`.

## Mapa resumido de endpoints
| Módulo | Método | Ruta | Controlador | Servicio | Descripción |
| --- | --- | --- | --- | --- | --- |
| Core Auth | POST | `/v1/auth/register` | `AuthRestController` | `UserService` | Alta de usuario y emisión de JWT inicial. |
| Core Auth | POST | `/v1/auth/login` | `AuthRestController` | `UserService` | Autenticación y entrega de token. |
| Core Auth | GET | `/v1/auth/modules` | `AuthRestController` | `UserService` | Lista paginada de módulos habilitados del usuario. |
| Gestión de módulos | POST | `/v1/modules/save` | `ModuleController` | `ModuleServiceImpl` | Crea/actualiza metadatos de módulo. |
| Gestión de módulos | GET | `/v1/modules/list` | `ModuleController` | `ModuleServiceImpl` | Consulta paginada de módulos. |
| Inventario | POST | `/v1/inventory/category/save` | `InventoryController` | `InventoryService` | Alta/edición de categoría (requiere MODULE_INVENTORY + flag). |
| Inventario | GET | `/v1/inventory/categories` | `InventoryController` | `InventoryService` | Listado paginado de categorías habilitadas. |
| Inventario | POST | `/v1/inventory/product/save` | `InventoryController` | `InventoryService` | Alta/edición de producto. |
| Inventario | GET | `/v1/inventory/products` | `InventoryController` | `InventoryService` | Listado paginado de productos. |
| Clientes | POST | `/v1/clients/save` | `ClientController` | `ClientService` | Alta/edición de cliente. |
| Clientes | GET | `/v1/clients/list` | `ClientController` | `ClientService` | Listado paginado de clientes. |
| Proveedores | POST | `/v1/providers/save` | `ProviderController` | `ProviderService` | Alta/edición de proveedor. |
| Proveedores | GET | `/v1/providers/list` | `ProviderController` | `ProviderService` | Listado paginado de proveedores. |
| Cotizaciones | POST | `/v1/quotes/save` | `QuoteController` | `QuoteService` | Alta/edición de cotización. |
| Compras | POST | `/v1/purchases/save` | `PurchaseController` | `PurchaseService` | Alta/edición de compra. |
| Core Auth Admin | GET/POST/PUT/DELETE | `/v1/auth/admin/users`, `/v1/auth/admin/roles`, `/v1/auth/admin/modules` | `AuthAdminController` | `UserService` + repositorios JPA | CRUD administrativo de usuarios, roles y módulos con protección `MODULE_CORE_DE_AUTENTICACION`. |
| Core Auth Admin | POST | `/v1/auth/admin/role-modules`, `/v1/auth/admin/user-roles` | `AuthAdminController` | `RoleModuleRepository` / `AuthUserRoleRepository` | Asigna módulos a roles y roles a usuarios. |
| Core Auth Admin | GET/POST | `/v1/auth/admin/module-licenses` | `AuthAdminController` | `ModuleLicenseRepository` | Licencias de módulos por tenant. |

> Los endpoints de negocio usan `@ConditionalOnProperty` para activarse por módulo y `@PreAuthorize` para validar licencias/authorities antes de ejecutar la lógica.
