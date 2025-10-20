# 1. Propósito y alcance

Ferrisys Service es un monorepo que contiene un backend Spring Boot (`back-costa/`) y un frontend Angular (`front-costa/`) destinados a una plataforma modular para comercios (ferretería, abarrotería, etc.). El backend expone APIs para autenticación, gestión de módulos/roles y dominios operativos básicos (inventario, clientes, proveedores, compras y cotizaciones). El frontend ofrece una SPA con login, layout principal y páginas iniciales de administración (principalmente simuladas) construidas con ng-zorro-antd.

# 2. Capas lógicas y componentes

| Capa | Implementación | Detalles relevantes |
|------|----------------|----------------------|
| Presentación | Angular 19 standalone components (`front-costa/src/app`) | Rutas divididas en `login`, `main/*`; layout con menú lateral (`MainLayoutComponent`). Muchos listados usan datos simulados y aún no integran servicios reales. |
| API / Controllers | Spring Web MVC (`back-costa/src/main/java/com/ferrisys/controller`) | Controladores REST para auth, módulos, roles, inventario, clientes, proveedores, compras y cotizaciones. Context path global `/ferrisys-service`. |
| Servicios de dominio | Interfaces en `com.ferrisys.service` y `com.ferrisys.service.business`; implementaciones en `impl` | Encapsulan lógica CRUD y proyecciones `PageResponse`. Manejan validaciones básicas y casting DTO ↔ entidad. |
| Persistencia | Spring Data JPA (`com.ferrisys.repository`) | Repositorios por agregado, con consultas derivadas y una consulta JPQL para módulos por rol. No hay migraciones ni DDL automático (ddl-auto: none). |
| Seguridad | Spring Security + filtro JWT | `SecurityConfig` define CORS, endpoints públicos, sesión stateless y filtro `JwtFilterRequest` que valida tokens con `JWTUtil`. |
| Infraestructura común | `com.ferrisys.common` | DTOs, entidades JPA, auditoría básica (`Auditable`), enums con IDs fijos, excepciones custom. |

# 3. Dependencias externas clave

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| Spring Boot starters (web, data-jpa, security) | 3.4.3 | API REST, acceso a datos, seguridad. 【F:back-costa/pom.xml†L21-L41】|
| io.jsonwebtoken (jjwt-api/impl/jackson) | 0.11.5 | Generación y validación de JWT HS256. 【F:back-costa/pom.xml†L43-L58】|
| PostgreSQL Driver | 42.x (gestionado por Spring Boot) | Conexión a Supabase Postgres. 【F:back-costa/pom.xml†L60-L63】|
| Lombok | provided | Generación de getters/setters/builders. 【F:back-costa/pom.xml†L65-L69】|
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
| `spring.datasource.url` | Supabase Postgres SSL (`sslmode=require`) | Usuario `postgres`, contraseña embebida. Recomendar mover a variables de entorno. 【F:back-costa/src/main/resources/application.yml†L9-L22】|
| `spring.jpa.hibernate.ddl-auto` | `none` | Requiere migraciones manuales. |
| `spring.jpa.open-in-view` | `false` | Evita sesiones largas para serialización. |
| `jwt.secret` | Llave HS256 en texto plano | Debe rotarse y externalizarse. 【F:back-costa/src/main/resources/application.yml†L32-L34】|
| Front `environment.ts` | `apiUrl: http://localhost:8081/ferrisys-service/v1/` | Base URL para servicios HttpClient. 【F:front-costa/src/environments/environment.ts†L3-L7】|
| Front `environment.prod.ts` | `apiUrl: https://back.clarifyerp.qbit-gt.com/ferrisys-service/v1/` | Producción apunta a backend remoto. 【F:front-costa/src/environments/environment.prod.ts†L1-L4】|

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

- **JWT**: tokens HS256 de 10 horas, `sub` = `username`. No se incluyen claims de roles/permisos; el backend resuelve módulos desde la base de datos con la sesión actual. 【F:back-costa/src/main/java/com/ferrisys/config/security/JWTUtil.java†L24-L55】
- **Filtro**: `JwtFilterRequest` valida encabezado `Authorization: Bearer <token>`, carga el `User` y marca `SecurityContext` sin authorities (lista `null`), lo cual limita la integración con anotaciones `@PreAuthorize`. 【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L24-L58】
- **CORS**: permitidos `https://clarifyerp.qbit-gt.com` y `http://localhost:4200`; métodos y headers básicos. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L24-L44】
- **Endpoints públicos**: `/v1/auth/login`, `/v1/auth/register`, `/v1/auth/change-password`, `/actuator/health`. Resto requiere token válido. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L21-L33】
- **Estados por defecto**: `DefaultUserStatus.ACTIVE` y `DefaultRole.USER/ADMIN` definen UUIDs esperados en BD. 【F:back-costa/src/main/java/com/ferrisys/common/enums/DefaultUserStatus.java†L5-L12】【F:back-costa/src/main/java/com/ferrisys/common/enums/DefaultRole.java†L5-L17】

# 9. Matriz de deuda técnica y quick wins

| Prioridad | Tipo | Descripción |
|-----------|------|-------------|
| Alta | Seguridad | Exponer authorities reales en `SecurityContext` y aplicar restricciones por rol en controladores. |
| Alta | Seguridad | Externalizar `jwt.secret` y credenciales de DB en variables de entorno/secret manager. |
| Alta | Persistencia | Incorporar herramienta de migraciones (Flyway/Liquibase) para versionar el esquema. |
| Alta | API Contract | Alinear respuestas HTTP (usar `ResponseEntity` con códigos consistentes, body estructurado). |
| Alta | Frontend | Crear `AuthInterceptor` y `AuthGuard` para inyectar token y proteger rutas (archivo guard está vacío). |
| Media | DX/Infra | Añadir perfiles `application-local.yml` y `application-prod.yml` con placeholders, evitar secretos en repo. |
| Media | Observabilidad | Configurar logging estructurado y Spring Boot Actuator adicional (info/metrics). |
| Media | Testing | Agregar pruebas unitarias y de integración (no hay tests en backend). |
| Media | Frontend | Reemplazar datos simulados en componentes por llamadas reales con `CategoryService`/`ProductService`. |
| Media | Frontend-Backend | Corregir URLs inconsistentes (`inventory/category/list` vs `/inventory/categories`). |
| Baja | Arquitectura | Crear capa de mapeo (MapStruct o manual) para evitar duplicación en services. |
| Baja | Docs | Generar OpenAPI (`springdoc-openapi`) y compartir colección de ejemplos. |
| Baja | UX | Implementar cierre de sesión real y feedback en layout. |

# 10. Backlog sugerido (10-20 ítems)

1. **security:** Implementar `UserDetailsService` y authorities reales para roles/módulos.
2. **security:** Configurar rotación y externalización del `jwt.secret` usando variables de entorno.
3. **security:** Implementar `AuthInterceptor` y `AuthGuard` funcional en Angular para añadir header `Authorization`.
4. **security:** Crear pruebas e2e que verifiquen flujos CORS y expiración de token.
5. **persistence:** Integrar Flyway con migración baseline de todas las tablas existentes.
6. **persistence:** Implementar versionado de datos maestros (roles, módulos, estados) mediante scripts.
7. **api:** Documentar la API con `springdoc-openapi` y publicar Swagger UI.
8. **api:** Ajustar controladores para devolver DTOs consistentes (evitar `void`) y códigos semánticos.
9. **frontend:** Centralizar consumo HTTP en un `ApiService` reutilizable con manejo de errores.
10. **frontend:** Sincronizar endpoints de `CategoryService`/`ProductService` con rutas reales del backend.
11. **frontend:** Implementar lazy loading efectivo y guards por módulo/permiso.
12. **frontend:** Diseñar layout base reutilizable con ng-zorro y soportar theming.
13. **infra:** Crear scripts `run-all` (bash/powershell) para levantar backend y frontend simultáneamente.
14. **infra:** Configurar pipelines CI con matrices (JDK17 + Node22) y análisis estático.
15. **observability:** Añadir logs estructurados y configuración de niveles por paquete.
16. **observability:** Habilitar Spring Boot Actuator `/info`, `/metrics`, `/prometheus` con seguridad.
17. **domain:** Crear servicios para ventas (órdenes) y enlazar inventario con movimientos reales.
18. **architecture:** Definir convención para multi-tenant (`company_id` en entidades o esquemas dedicados).
19. **docs:** Completar ADR sobre monorepo y reglas de branching.
20. **ux:** Añadir flows de onboarding (reset password, email templates) con notificaciones reales.
