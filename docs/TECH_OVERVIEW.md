# 1. Propósito y alcance

Ferrisys Service es un monorepo que contiene un backend Spring Boot (`back-costa/`) y un frontend Angular (`front-costa/`) destinados a una plataforma modular para comercios (ferretería, abarrotería, etc.). El backend expone APIs para autenticación, gestión de módulos/roles y dominios operativos básicos (inventario, clientes, proveedores, compras y cotizaciones). El frontend ofrece una SPA con login, layout principal y páginas iniciales de administración (principalmente simuladas) construidas con ng-zorro-antd.

# 2. Capas lógicas y componentes

| Capa | Implementación | Detalles relevantes |
|------|----------------|----------------------|
| Presentación | Angular 19 standalone components (`front-costa/src/app`) | Rutas divididas en `login` y `main/*`; layout con menú lateral (`MainLayoutComponent`). `AuthInterceptor` agrega el JWT y `PermissionGuard` filtra rutas según los módulos almacenados en `SessionService`, pero la llamada actual a `/v1/auth/modules` no entrega el formato esperado (el backend devuelve un `PageResponse`). 【F:front-costa/src/app/core/interceptors/auth.interceptor.ts†L1-L33】【F:front-costa/src/app/services/auth.service.ts†L37-L46】【F:front-costa/src/app/layout/main-layout.component.ts†L212-L233】【F:back-costa/src/main/java/com/ferrisys/controller/AuthRestController.java†L40-L52】|
| API / Controllers | Spring Web MVC (`back-costa/src/main/java/com/ferrisys/controller`) | Controladores REST para auth, módulos, roles, inventario, clientes, proveedores, compras y cotizaciones. Context path global `/ferrisys-service`. Varios controladores de negocio están condicionados por `@ConditionalOnProperty` y anotaciones `@PreAuthorize` que delegan en `FeatureFlagService`. 【F:back-costa/src/main/java/com/ferrisys/controller/InventoryController.java†L23-L71】【F:back-costa/src/main/java/com/ferrisys/service/impl/FeatureFlagServiceImpl.java†L17-L102】|
| Servicios de dominio | Interfaces en `com.ferrisys.service` y `com.ferrisys.service.business`; implementaciones en `impl` | Encapsulan lógica CRUD y proyecciones `PageResponse`. Manejan validaciones básicas, composición de detalles y filtros de licencias por módulo antes de exponer datos al usuario. 【F:back-costa/src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L108-L154】【F:back-costa/src/main/java/com/ferrisys/service/business/impl/QuoteServiceImpl.java†L25-L98】|
| Persistencia | Spring Data JPA + Flyway (`com.ferrisys.repository`) | Repositorios por agregado con consultas derivadas y una JPQL para módulos por rol. Flyway gestiona `V1__baseline`, `V2__seed_base` y `V3__module_license`; Hibernate está en modo `ddl-auto: validate`. 【F:back-costa/src/main/resources/db/migration/V1__baseline.sql†L1-L120】【F:back-costa/src/main/resources/db/migration/V2__seed_base.sql†L1-L24】【F:back-costa/src/main/resources/db/migration/V3__module_license.sql†L1-L23】【F:back-costa/src/main/resources/application.yml†L21-L27】|
| Seguridad | Spring Security + filtro JWT | `SecurityConfig` define CORS, endpoints públicos, sesión stateless y filtro `JwtFilterRequest` que valida tokens con `JWTUtil`; `CustomUserDetailsService` agrega authorities `ROLE_*` y `MODULE_*`. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L21-L53】【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L21-L63】【F:back-costa/src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L31-L68】|
| Infraestructura común | `com.ferrisys.common` | DTOs, entidades JPA, auditoría básica (`Auditable`), enums con IDs fijos, excepciones custom, utilidades JWT. 【F:back-costa/src/main/java/com/ferrisys/common/audit/Auditable.java†L13-L30】【F:back-costa/src/main/java/com/ferrisys/config/security/JWTUtil.java†L19-L63】|

# 3. Dependencias externas clave

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| Spring Boot starters (web, data-jpa, security, actuator) | 3.4.3 | API REST, acceso a datos, seguridad y endpoints de salud/info. 【F:back-costa/pom.xml†L21-L41】【F:back-costa/pom.xml†L33-L40】|
| io.jsonwebtoken (jjwt-api/impl/jackson) | 0.11.5 | Generación y validación de JWT HS256. 【F:back-costa/pom.xml†L43-L58】|
| PostgreSQL Driver | 42.x (gestionado por Spring Boot) | Acceso a bases PostgreSQL mediante HikariCP. 【F:back-costa/pom.xml†L60-L63】【F:back-costa/src/main/resources/application.yml†L9-L24】|
| Flyway Core | 10.x (gestionado por Spring Boot) | Versionado de esquema (`V1`-`V3`). 【F:back-costa/pom.xml†L65-L68】【F:back-costa/src/main/resources/db/migration/V1__baseline.sql†L1-L120】|
| Lombok | provided | Generación de getters/setters/builders. 【F:back-costa/pom.xml†L70-L74】|
| ng-zorro-antd | 19.3.0 | Componentes UI Angular. 【F:front-costa/package.json†L17-L24】|
| Angular CLI | 19.2.13 | Build y tooling frontend. 【F:front-costa/package.json†L26-L36】|

# 4. Tabla de endpoints

> Todos los paths están precedidos por el context-path `/ferrisys-service`.

| Recurso | Método | Path | Autenticación | Request | Respuesta | HTTP codes |
|---------|--------|------|---------------|---------|-----------|------------|
| Auth | POST | `/v1/auth/register` | Público | `RegisterRequest` | `AuthResponse` con token y rol | 201, 400 (duplicado), 500 |
| Auth | POST | `/v1/auth/login` | Público | `LoginRequest` | `AuthResponse` | 200, 400 (credenciales), 404 (usuario) |
| Auth | POST | `/v1/auth/change-password` | Público (via token reset) | Query `newPassword`, `confirmPassword`, `userToken` | `AuthResponse` | 200, 400, 404 |
| Auth | POST | `/v1/auth/modules` | JWT requerido | Query `page`, `size` | `PageResponse<ModuleDTO>` | 200, 401 |
| Modules | POST | `/v1/modules/save` | JWT requerido | `ModuleDTO` | vacío | 200, 400 |
| Modules | GET | `/v1/modules/list` | JWT requerido | Query `page`, `size` | `PageResponse<ModuleDTO>` | 200 |
| Modules | POST | `/v1/modules/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Roles | POST | `/v1/roles/save` | JWT requerido | `RoleDTO` | `"Rol procesado correctamente"` | 200, 400 |
| Roles | POST | `/v1/roles/list` | JWT requerido | Query `page`, `size` | `PageResponse<RoleDTO>` | 200 |
| Roles | POST | `/v1/roles/disable` | JWT requerido | Query `roleId` | `"Rol deshabilitado"` | 200, 404 |
| Inventory | POST | `/v1/inventory/category/save` | JWT requerido | `CategoryDTO` | vacío | 200, 404 (padre) |
| Inventory | POST | `/v1/inventory/product/save` | JWT requerido | `ProductDTO` | vacío | 200, 404 (categoría) |
| Inventory | POST | `/v1/inventory/category/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Inventory | POST | `/v1/inventory/product/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Inventory | GET | `/v1/inventory/categories` | JWT requerido | Query `page`, `size` | `PageResponse<CategoryDTO>` | 200 |
| Inventory | GET | `/v1/inventory/products` | JWT requerido | Query `page`, `size` | `PageResponse<ProductDTO>` | 200 |
| Clients | POST | `/v1/clients/save` | JWT requerido | `ClientDTO` | vacío | 200 |
| Clients | POST | `/v1/clients/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Clients | GET | `/v1/clients/list` | JWT requerido | Query `page`, `size` | `PageResponse<ClientDTO>` | 200 |
| Providers | POST | `/v1/providers/save` | JWT requerido | `ProviderDTO` | vacío | 200 |
| Providers | POST | `/v1/providers/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Providers | GET | `/v1/providers/list` | JWT requerido | Query `page`, `size` | `PageResponse<ProviderDTO>` | 200 |
| Purchases | POST | `/v1/purchases/save` | JWT requerido | `PurchaseDTO` (con detalles) | vacío | 200, 404 |
| Purchases | POST | `/v1/purchases/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Purchases | GET | `/v1/purchases/list` | JWT requerido | Query `page`, `size` | `PageResponse<PurchaseDTO>` | 200 |
| Quotes | POST | `/v1/quotes/save` | JWT requerido | `QuoteDTO` (con detalles) | vacío | 200, 404 |
| Quotes | POST | `/v1/quotes/disable` | JWT requerido | Query `id` | vacío | 200, 404 |
| Quotes | GET | `/v1/quotes/list` | JWT requerido | Query `page`, `size` | `PageResponse<QuoteDTO>` | 200 |
| Salud | GET | `/actuator/health` | Público | – | `"pong"` | 200 |

# 5. Tabla de entidades JPA

| Tabla | Clase | Campos clave / relaciones |
|-------|-------|---------------------------|
| `auth_user` | `User` | `id` (UUID), `username`, `password`, `email`, `fullName`, `status`→`UserStatus`. Hereda audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/User.java†L14-L43】|
| `user_status` | `UserStatus` | `statusId` (UUID), `name`, `description`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/UserStatus.java†L18-L34】|
| `auth_role` | `Role` | `id` (UUID), `name`, `description`, `status`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/Role.java†L21-L38】|
| `auth_module` | `AuthModule` | `id`, `name`, `description`, `status`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/AuthModule.java†L19-L38】|
| `auth_role_module` | `AuthRoleModule` | `id`, `role`→`Role`, `module`→`AuthModule`, `status`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/AuthRoleModule.java†L23-L46】|
| `auth_user_role` | `AuthUserRole` | `id`, `user`→`User`, `role`→`Role`, `status`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/AuthUserRole.java†L23-L43】|
| `module_license` | `ModuleLicense` | `id`, `tenantId`, `module`→`AuthModule`, `enabled`, `expiresAt`. 【F:back-costa/src/main/java/com/ferrisys/common/entity/license/ModuleLicense.java†L21-L55】|
| `inv_category` | `Category` | `id`, `name`, `description`, `parentCategoryId`, `status`. Audit heredado. 【F:back-costa/src/main/java/com/ferrisys/common/entity/inventory/Category.java†L21-L40】|
| `inv_product` | `Product` | `id`, `name`, `description`, `category`→`Category`, `companyId`, `status`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/inventory/Product.java†L21-L46】|
| `bus_client` | `Client` | `id`, `name`, `email`, `phone`, `address`, `status`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/Client.java†L19-L41】|
| `bus_provider` | `Provider` | `id`, `name`, `contact`, `phone`, `address`, `ruc`, `status`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/Provider.java†L19-L43】|
| `bus_quote` | `Quote` | `id`, `client`→`Client`, `description`, `date`, `total`, `status`, `details` (one-to-many). Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/Quote.java†L21-L48】|
| `bus_quote_detail` | `QuoteDetail` | `id`, `quote`→`Quote`, `product`→`Product`, `quantity`, `unitPrice`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/QuoteDetail.java†L21-L47】|
| `bus_purchase` | `Purchase` | `id`, `provider`→`Provider`, `description`, `date`, `total`, `status`, `details`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/Purchase.java†L21-L49】|
| `bus_purchase_detail` | `PurchaseDetail` | `id`, `purchase`→`Purchase`, `product`→`Product`, `quantity`, `unitPrice`. Audit. 【F:back-costa/src/main/java/com/ferrisys/common/entity/business/PurchaseDetail.java†L21-L47】|

# 6. Configuración por entorno

| Variable / Propiedad | Desarrollo (application.yml) | Notas |
|----------------------|-------------------------------|-------|
| `server.port` | 8081 | Puertos alineados con README y frontend. 【F:back-costa/src/main/resources/application.yml†L1-L6】|
| `server.servlet.context-path` | `/ferrisys-service` | Debe considerarse en llamados desde frontend. |
| `spring.datasource.url` | Placeholder `PLEASE_SET_SPRING_DATASOURCE_URL` | Obligatorio definirlo vía variable de entorno; Hikari se configura con `minimum-idle=5`, `max-pool-size=10`. 【F:back-costa/src/main/resources/application.yml†L9-L22】|
| `spring.jpa.hibernate.ddl-auto` | `validate` | Obliga a que el esquema coincida con las migraciones Flyway. 【F:back-costa/src/main/resources/application.yml†L21-L27】|
| `spring.jpa.open-in-view` | `false` | Evita sesiones largas para serialización. |
| `modules.*.enabled` | inventario, compras, clientes, proveedores, quotes en `true` | Usado por `@ConditionalOnProperty` para exponer cada controlador. 【F:back-costa/src/main/resources/application.yml†L36-L45】|
| `jwt.secret` | Placeholder `PLEASE_SET_JWT_SECRET` | Debe sobreescribirse con clave HS256 (>=32 chars) en despliegue. 【F:back-costa/src/main/resources/application.yml†L29-L34】|
| Front `environment.ts` | `apiBaseUrl: 'http://localhost:8081/ferrisys-service'` | La capa HTTP concatena rutas relativas (sin `/v1`). 【F:front-costa/src/environments/environment.ts†L1-L6】【F:front-costa/src/app/core/services/api.service.ts†L21-L34】|
| Front `environment.prod.ts` | `apiBaseUrl: 'https://back.clarifyerp.qbit-gt.com/ferrisys-service'` | Debe revisarse al desplegar backend en otra URL. 【F:front-costa/src/environments/environment.prod.ts†L1-L4】|

# 7. Guía de build & run local

## Backend
1. Requisitos: JDK 17, Maven Wrapper incluido.
2. Configurar variables sensibles (URL DB, usuario, password, jwt.secret) mediante `application-local.yml` o variables de entorno (recomendado) antes de ejecutar.
3. Ejecutar:
   ```bash
   cd back-costa
   ./mvnw spring-boot:run
   ```
4. El servicio expone APIs en `http://localhost:8081/ferrisys-service`. Verificar `/actuator/health`.

## Frontend
1. Requisitos: Node.js 22.x (alineado con Angular 19) y npm.
2. Instalar dependencias:
   ```bash
   cd front-costa
   npm ci
   ```
3. Ejecutar servidor de desarrollo:
   ```bash
   npx ng serve -o
   ```
4. La SPA estará disponible en `http://localhost:4200`. Ajustar `environment.ts` si el backend corre en otro host/puerto.

# 8. Seguridad, autenticación y autorización

- **JWT**: tokens HS256 de 10 horas, `sub` = `username`. No se incluyen claims de roles/permisos; la autorización se resuelve contra repositorios y licencias. 【F:back-costa/src/main/java/com/ferrisys/config/security/JWTUtil.java†L24-L55】
- **Filtro**: `JwtFilterRequest` valida `Authorization: Bearer <token>`, maneja expiración/errores y puebla el `SecurityContext` con el `UserDetails` autenticado. 【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L21-L63】
- **Authorities dinámicas**: `CustomUserDetailsService` agrega authorities `ROLE_<NOMBRE>` y `MODULE_<SLUG>` sólo si `FeatureFlagService` confirma que el módulo está habilitado para el tenant. 【F:back-costa/src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L31-L68】【F:back-costa/src/main/java/com/ferrisys/service/impl/FeatureFlagServiceImpl.java†L17-L102】
- **Method security**: `@EnableMethodSecurity` activa expresiones `@PreAuthorize`; inventario y dominios de negocio usan `@featureFlagService.enabledForCurrentUser('<slug>')` como guardia. 【F:back-costa/src/main/java/com/ferrisys/config/security/MethodSecurityConfig.java†L1-L8】【F:back-costa/src/main/java/com/ferrisys/controller/ProviderController.java†L18-L45】
- **CORS**: orígenes permitidos `https://clarifyerp.qbit-gt.com` y `http://localhost:4200`, métodos GET/POST/PUT/DELETE/PATCH/OPTIONS y headers `Authorization`, `Content-Type`, `Accept`. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L33-L51】
- **Endpoints públicos**: `/v1/auth/login`, `/v1/auth/register`, `/v1/auth/change-password`, `/actuator/health`; el resto exige JWT. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L24-L33】
- **Catálogos base**: `DefaultUserStatus` y `DefaultRole` fijan los UUID que deben existir vía migraciones/seed. 【F:back-costa/src/main/java/com/ferrisys/common/enums/DefaultUserStatus.java†L5-L12】【F:back-costa/src/main/java/com/ferrisys/common/enums/DefaultRole.java†L5-L17】

# 9. Matriz de deuda técnica y quick wins

| Prioridad | Tipo | Descripción |
|-----------|------|-------------|
| Alta | API Contract | Alinear `/v1/auth/modules`: el backend expone `POST` con `PageResponse<ModuleDTO>` mientras el frontend hace `GET` y espera `string[]`. |
| Alta | Seguridad | Añadir `@PreAuthorize`/feature flags a `ModuleController` y `RoleController` (hoy cualquier usuario autenticado puede modificarlos). 【F:back-costa/src/main/java/com/ferrisys/controller/ModuleController.java†L13-L33】【F:back-costa/src/main/java/com/ferrisys/controller/RoleController.java†L13-L37】|
| Alta | Seguridad | Externalizar `jwt.secret` y credenciales (`PLEASE_SET_*`) antes de desplegar. |
| Alta | Frontend | Reemplazar servicios `CategoryService`/`ProductService` que usan IDs numéricos y datos mock por consumo real con UUID/paginación. 【F:front-costa/src/app/services/category/category.service.ts†L7-L53】【F:front-costa/src/app/pages/categories/panel-categories/panel-categories.component.ts†L1-L130】|
| Media | Observabilidad | Eliminar o securizar `HealthController` duplicado y habilitar Actuator `/actuator/health`/`/actuator/info` nativo. 【F:back-costa/src/main/java/com/ferrisys/controller/HealthController.java†L7-L12】|
| Media | Testing | No existen pruebas automáticas (unitarias/integración) en backend ni frontend. |
| Media | Experiencia Dev | Proveer `application-local.yml` basado en el sample y scripts para ejecutar Flyway (`./mvnw flyway:migrate`). |
| Media | API Contract | Normalizar respuestas de controladores `void` (guardar/deshabilitar) para devolver DTO o `204`. |
| Baja | Arquitectura | Introducir capa de mapeo (MapStruct o records) para reducir repetición en services. |
| Baja | UX | Implementar logout real (limpiar token, redirigir) y manejo de errores en HttpClient. |

# 10. Backlog sugerido (10-20 ítems)

1. **api/security:** Alinear contrato y método de `/v1/auth/modules` y actualizar frontend para manejar `PageResponse<ModuleDTO>`. 【F:back-costa/src/main/java/com/ferrisys/controller/AuthRestController.java†L40-L52】【F:front-costa/src/app/services/auth.service.ts†L37-L46】
2. **security:** Añadir `@PreAuthorize` + verificación de licencias a `ModuleController` y `RoleController`. 【F:back-costa/src/main/java/com/ferrisys/controller/ModuleController.java†L13-L33】
3. **frontend:** Sustituir datos simulados (categorías/productos) por consumo real, actualizando DTOs a UUID y paginación. 【F:front-costa/src/app/pages/categories/panel-categories/panel-categories.component.ts†L60-L149】
4. **frontend:** Implementar logout real y manejo centralizado de errores en `ApiService`/interceptor. 【F:front-costa/src/app/layout/main-layout.component.ts†L228-L234】【F:front-costa/src/app/core/interceptors/auth.interceptor.ts†L1-L33】
5. **infra:** Externalizar `jwt.secret` y credenciales vía variables o `application-local.yml`, documentando pasos. 【F:back-costa/src/main/resources/application.yml†L9-L34】
6. **observability:** Reemplazar `HealthController` por Actuator y habilitar `/actuator/info` protegido. 【F:back-costa/src/main/java/com/ferrisys/controller/HealthController.java†L7-L12】【F:back-costa/src/main/resources/application.yml†L47-L52】
7. **api:** Homogeneizar respuestas de controladores `void` (usar `ResponseEntity<Void>` o DTO) y documentar códigos 204/200. 【F:back-costa/src/main/java/com/ferrisys/controller/InventoryController.java†L31-L69】
8. **persistence:** Ampliar seeds/migraciones para `module_license` creando ejemplo de licencia activa/inactiva. 【F:back-costa/src/main/resources/db/migration/V3__module_license.sql†L1-L23】
9. **testing:** Agregar pruebas unitarias de servicios (UserServiceImpl, FeatureFlagServiceImpl) y e2e básicos en Angular. 【F:back-costa/src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L38-L156】
10. **docs:** Generar especificación OpenAPI (springdoc) y sincronizar menú frontend con módulos retornados. 【F:back-costa/src/main/java/com/ferrisys/config/OpenApiConfig.java†L1-L23】【F:front-costa/src/app/core/services/menu-builder.service.ts†L21-L108】
