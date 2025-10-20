# Auditoría técnica - Revisión de re-auditoría

## 1. Delta frente a la documentación anterior
- **TECH_OVERVIEW.md** se actualizó para reflejar Flyway activo (`ddl-auto: validate`), las propiedades `modules.*.enabled` y la presencia de `FeatureFlagService`/authorities dinámicas. También se corrigieron tablas de dependencias, entidades y el backlog con los problemas reales de integración FE/BE. 【F:docs/TECH_OVERVIEW.md†L11-L136】
- **ARCHITECTURE.md** ahora documenta a `FeatureFlagServiceImpl`, la generación de authorities `MODULE_*`, el uso efectivo de Actuator y el desalineamiento FE/BE (GET vs POST, UUID vs number). 【F:docs/ARCHITECTURE.md†L9-L118】
- **API_CATALOG.md** incorpora requisitos de seguridad (`@PreAuthorize`, feature flags) y señala el contrato real de `/v1/auth/modules` y el health custom. 【F:docs/API_CATALOG.md†L1-L214】
- **DATA_MODEL.md** incluye la tabla `module_license` y la secuencia de migraciones `V1`–`V3`. 【F:docs/DATA_MODEL.md†L1-L103】
- **MODULES_MATRIX.md** describe el flujo actual de toggles/licencias y la discrepancia del frontend al consumir módulos e inventario. 【F:docs/MODULES_MATRIX.md†L4-L88】
- **RUNBOOK.md** añade pasos para copiar `application-local.yml`, ejecutar Flyway antes del arranque y un troubleshooting específico para `/v1/auth/modules`. 【F:docs/RUNBOOK.md†L8-L74】

## 2. Riesgos abiertos y quick wins
1. **Contrato roto `/v1/auth/modules`**: backend expone `POST` con `PageResponse<ModuleDTO>` mientras el frontend hace `GET` y espera `string[]`, provocando errores tras login. 【F:back-costa/src/main/java/com/ferrisys/controller/AuthRestController.java†L40-L52】【F:front-costa/src/app/services/auth.service.ts†L37-L46】
2. **Endpoints críticos sin guardas**: `ModuleController` y `RoleController` carecen de `@PreAuthorize`, permitiendo cambios administrativos a cualquier usuario autenticado. 【F:back-costa/src/main/java/com/ferrisys/controller/ModuleController.java†L13-L33】【F:back-costa/src/main/java/com/ferrisys/controller/RoleController.java†L13-L37】
3. **Servicios Angular desalineados**: `CategoryService`/`ProductService` usan IDs numéricos y rutas erróneas, por lo que cualquier consumo real fallará (404/400). 【F:front-costa/src/app/services/category/category.service.ts†L7-L53】【F:front-costa/src/app/services/product/product.service.ts†L7-L54】
4. **Licencias sin seeds**: Tabla `module_license` carece de datos iniciales; sin inserciones manuales los módulos condicionados no se habilitan, dificultando QA. 【F:back-costa/src/main/resources/db/migration/V3__module_license.sql†L1-L23】
5. **Salud duplicada**: `HealthController` devuelve texto plano y oculta la respuesta JSON estándar de Actuator; se recomienda consolidar y añadir protección cuando se exponga info. 【F:back-costa/src/main/java/com/ferrisys/controller/HealthController.java†L7-L12】
6. **Ausencia de pruebas**: No existen suites unitarias/integración en backend o frontend, lo que impide detectar regresiones en seguridad de módulos/licencias. 【F:back-costa/src/main/java/com/ferrisys/service/impl/FeatureFlagServiceImpl.java†L17-L102】

## 3. TODOs priorizados
| # | Descripción | Ubicación |
|---|-------------|-----------|
| 1 | Alinear `AuthService.fetchEnabledModules()` para enviar `POST` y mapear `PageResponse<ModuleDTO>` a la lista esperada por `SessionService`. | `front-costa/src/app/services/auth.service.ts` L37-L52 / `front-costa/src/app/services/session.service.ts` L9-L40 |
| 2 | Exponer `@PreAuthorize` (p.ej. `hasRole('ADMIN')`) en `ModuleController` y `RoleController` para proteger creación/edición de catálogos. | `back-costa/src/main/java/com/ferrisys/controller/ModuleController.java` L13-L33 / `.../RoleController.java` L13-L37 |
| 3 | Actualizar `CategoryService` y `ProductService` para usar UUID (`string`), query params `page/size` y endpoints `/categories`/`/products`. | `front-costa/src/app/services/category/category.service.ts` L7-L53 / `.../product/product.service.ts` L7-L54 |
| 4 | Reemplazar datos mock en `PanelCategoriesComponent` por consumo real paginado, reutilizando los servicios corregidos. | `front-costa/src/app/pages/categories/panel-categories/panel-categories.component.ts` L55-L210 |
| 5 | Añadir seeds de ejemplo a `module_license` (por tenant/rol) para que `FeatureFlagService` habilite módulos durante pruebas. | `back-costa/src/main/resources/db/migration` (nueva `V4__module_license_seed.sql`) |
| 6 | Consolidar `/actuator/health` eliminando el controlador custom o delegando en Actuator, y habilitar `/actuator/info` protegido. | `back-costa/src/main/java/com/ferrisys/controller/HealthController.java` L7-L12 / `back-costa/src/main/resources/application.yml` L47-L52 |
| 7 | Implementar pruebas unitarias para `FeatureFlagServiceImpl` cubriendo casos de licencia deshabilitada/expirada. | `back-costa/src/test/java/com/ferrisys/service/impl/FeatureFlagServiceImplTest.java` (nuevo) |
| 8 | Agregar manejo centralizado de errores HTTP en `ApiService`/interceptor (ej. reintentos, mensajes) en lugar de `console.log`. | `front-costa/src/app/core/services/api.service.ts` L21-L46 / `front-costa/src/app/core/interceptors/auth.interceptor.ts` L1-L33 |
| 9 | Documentar y automatizar carga de `application-local.yml` en README/CI para evitar valores `PLEASE_SET_*` en entornos reales. | `back-costa/README.md` / `docs/RUNBOOK.md` |
|10 | Crear endpoints/servicios administrativos para gestionar `module_license` (alta/baja/renovación) con validaciones de expiración. | `back-costa/src/main/java/com/ferrisys/service/FeatureFlagService.java` / nuevo controlador |
