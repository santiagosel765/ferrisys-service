# 1. Visión general

La solución sigue un modelo cliente-servidor clásico. El frontend Angular consume APIs REST JSON expuestas por un backend Spring Boot desplegado bajo el contexto `/ferrisys-service`. El backend persiste datos en PostgreSQL (Supabase) usando Spring Data JPA.

# 2. Diagrama de componentes

```mermaid
flowchart LR
    subgraph Frontend [Frontend (Angular 19)]
        Login[LoginComponent]
        Layout[MainLayoutComponent]
        Services[AuthService / CategoryService / ProductService]
    end

    subgraph Backend [Backend (Spring Boot 3.4)]
        Controller[REST Controllers]
        ServicesB[Domain Services]
        Security[SecurityConfig + JwtFilterRequest]
        Repos[JPA Repositories]
    end

    subgraph Database [PostgreSQL]
        Tables[(Auth / Inventario / Negocio)]
    end

    Login -->|HTTP POST /v1/auth/login| Controller
    Layout -->|HTTP GET/POST CRUD| Controller
    Services -->|HttpClient| Controller
    Controller --> ServicesB --> Repos --> Tables
    Security -. valida token .-> Controller
```

# 3. Secuencia de login

```mermaid
sequenceDiagram
    participant UI as Angular LoginComponent
    participant AuthSvc as AuthService
    participant API as POST /v1/auth/login
    participant UserSvc as UserServiceImpl
    participant JWT as JWTUtil

    UI->>AuthSvc: submit(credentials)
    AuthSvc->>API: POST /ferrisys-service/v1/auth/login
    API->>UserSvc: authenticate(username, password)
    UserSvc->>UserSvc: busca usuario activo y rol
    UserSvc->>JWT: generateToken(user)
    JWT-->>UserSvc: JWT HS256 (10h)
    UserSvc-->>API: AuthResponse(token, username, email, role)
    API-->>AuthSvc: 200 OK + JSON
    AuthSvc-->>UI: guarda token en sessionStorage
    UI-->>Router: navega a /main/welcome
```

# 4. Flujo CRUD típico

```mermaid
sequenceDiagram
    participant UI as Angular Component
    participant Http as HttpClient
    participant Ctrl as REST Controller
    participant Svc as Service Impl
    participant Repo as Spring Data Repository
    participant DB as PostgreSQL

    UI->>Http: invoca método (ej. saveCategory)
    Http->>Ctrl: POST /v1/inventory/category/save
    Ctrl->>Svc: saveOrUpdate(dto)
    Svc->>Repo: findById / save
    Repo->>DB: SELECT/INSERT/UPDATE
    DB-->>Repo: resultado
    Repo-->>Svc: entidad persistida
    Svc-->>Ctrl: void / DTO
    Ctrl-->>Http: 200 OK
    Http-->>UI: promesa resuelta / error
```

# 5. Decisiones de seguridad

- **Stateless JWT**: No se mantiene estado de sesión en el servidor; `SessionCreationPolicy.STATELESS`. 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L24-L32】
- **Filtro personalizado**: `JwtFilterRequest` valida la firma y caducidad, carga al usuario desde base de datos y rellena el `SecurityContext`. Authorities no se establecen (queda por mejorar). 【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L24-L58】
- **CORS restringido**: Solo dos orígenes permitidos (localhost:4200 y dominio de producción). 【F:back-costa/src/main/java/com/ferrisys/config/security/SecurityConfig.java†L33-L43】
- **Contraseñas**: Se almacenan con `BCryptPasswordEncoder` en los flujos de registro y cambio de contraseña. 【F:back-costa/src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L62-L73】【F:back-costa/src/main/java/com/ferrisys/service/impl/UserServiceImpl.java†L91-L100】

# 6. Paginación, validación y logging

- **Paginación**: Todos los listados usan `PageRequest` con respuesta `PageResponse<T>` (content, totalPages, totalElements, currentPage, pageSize). No hay validaciones de límites máximos. 【F:back-costa/src/main/java/com/ferrisys/service/impl/InventoryServiceImpl.java†L63-L76】
- **Validación**: Se realizan validaciones básicas (existencia de IDs, coincidencia de contraseñas). No se usan anotaciones Bean Validation en DTOs/controladores.
- **Logging**: No hay configuración dedicada; se apoya en logging estándar de Spring Boot. Frontend usa `console.log` para debug (debe limpiarse).

# 7. Observabilidad

- **Actuator**: Solo `/actuator/health` está expuesto manualmente; no se configuró el starter Actuator completo. 【F:back-costa/src/main/java/com/ferrisys/controller/HealthController.java†L8-L12】
- **Métricas**: No existen dashboards ni exportadores (Prometheus/Zipkin). Recomendado habilitar `spring-boot-starter-actuator` y configurar endpoints seguros.
- **Trazas**: No se implementa tracing distribuido.

# 8. Evolución a plataforma multi-vertical

## Dominios sugeridos (DDD ligero)
- **Catálogo**: Productos, categorías, atributos específicos por vertical.
- **Inventarios**: Existencias, movimientos, lotes.
- **Ventas**: Órdenes, facturación, pagos.
- **Compras**: Órdenes a proveedores, recepción.
- **Precios & Promociones**: Tarifas por vertical (mayoreo, ferretería, abarrotes).
- **Clientes & Proveedores**: Gestión de terceros y segmentación.
- **Caja & Finanzas**: Pagos, arqueos, conciliaciones.
- **Seguridad & Licencias**: Gestión de módulos habilitados por cliente.

## Estrategia backend
- Implementar configuración modular usando `@ConditionalOnProperty("modules.<dominio>.enabled")` para exponer beans/controladores por vertical.
- Crear `FeatureFlagService` que consulte permisos por compañía/tenant (tabla `module_license`) y exponga helpers para servicios.
- Añadir `tenant_id` (UUID) a entidades o separar por esquema (por ejemplo `tenant_<id>`). Comenzar con columna y filtros por `@EntityGraph`/`@Where`.
- Unificar `AuthUserRole` y `AuthRoleModule` con un catálogo de licencias para habilitar rutas.

## Estrategia frontend
- Construir un `MenuBuilderService` que reciba módulos habilitados del endpoint `/v1/auth/modules` y genere menús dinámicos.
- Implementar `CanActivateFn` o guards clásicos que validen permisos antes de entrar a cada ruta.
- Crear lazy modules por dominio (`catalog`, `sales`, `purchases`, etc.) y cargar solo los habilitados.

## Extensibilidad de catálogo
- Diseñar entidades con campos genéricos (`attributes` JSONB) para reglas por vertical (ej. calibre de ferretería, caducidad en abarrotes).
- Crear servicios plugin que apliquen validaciones específicas según `tenant.vertical`.

## Data governance
- Estandarizar auditoría (ya se usa `Auditable`) agregando `created_by` y `updated_by` mediante `AuditorAware`.
- Versionar migraciones con Flyway (baseline actual) y aplicar seeds por vertical (roles, módulos, catálogos base).
- Gestionar seeds multi-tenant mediante scripts idempotentes ejecutados tras habilitar una licencia.

# 9. Consideraciones adicionales

- **Persistencia**: Actualmente se usan búsquedas `findById().orElseThrow` sin manejo transaccional avanzado; al habilitar multi-tenant se deben añadir filtros globales.
- **Integración frontend-backend**: Algunos endpoints en servicios Angular no coinciden con los reales; se requiere alineación antes de habilitar consumo real.
- **Despliegue**: Dockerfiles existen para ambos módulos pero no se incluye orquestación. Se recomienda definir compose/k8s para despliegue multi-servicio.
