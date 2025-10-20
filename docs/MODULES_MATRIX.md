# 1. Inventario actual de módulos

| Módulo | Backend | Frontend | Comentarios |
|--------|---------|----------|-------------|
| Autenticación / Roles | Sí (`AuthRestController`, `RoleController`, `ModuleController`) | Login, `AuthInterceptor`, `PermissionGuard`, menú dinámico | Front consume `/v1/auth/modules` pero espera `string[]`; backend entrega `PageResponse<ModuleDTO>`. |
| Inventario (categorías, productos) | Sí (`InventoryController`) con `@PreAuthorize` + feature flags | Pantalla de categorías con datos mock y servicios `CategoryService`/`ProductService` sin integrar | Front usa IDs numéricos y endpoints `GET` sin paginación; backend usa UUID y `PageResponse`. |
| Clientes | Sí (`ClientController`) | No hay vistas dedicadas | Requiere UI CRUD. |
| Proveedores | Sí (`ProviderController`) | No hay vistas dedicadas | Requiere UI CRUD. |
| Compras | Sí (`PurchaseController`) | No implementado | Falta UI y consumo. |
| Cotizaciones | Sí (`QuoteController`) | No implementado | Falta UI y consumo. |
| Ventas | No | Menús placeholder | Dominio pendiente. |
| Reportes | No | Menús placeholder | Requiere definición. |
| Configuración avanzada | Parcial (módulos/roles) | Menú placeholder | Falta lógica real. |

# 2. Matriz multi-vertical propuesta

| Módulo                | Core | Ferretería | Abarrotería | Otros (Retail) | Notas |
|-----------------------|:----:|:----------:|:-----------:|:--------------:|-------|
| Autenticación & Roles | ✅  | ✅        | ✅         | ✅            | Base obligatoria con licencias por módulo. |
| Catálogo Productos    | ✅  | ✅        | ✅         | ✅            | Añadir atributos específicos (calibre, perecibilidad). |
| Inventario Básico     | ✅  | ✅        | ⚠️        | ✅            | Manejo de lotes requerido en abarrotes (perishables). |
| Compras               | ✅  | ✅        | ✅         | ✅            | Integrar con proveedores y recepciones. |
| Cotizaciones          | ✅  | ✅        | ⚠️        | ✅            | En abarrotes puede reemplazarse por pedidos recurrentes. |
| Ventas POS            | ✅  | ✅        | ✅         | ✅            | Crear módulo nuevo con integraciones fiscales. |
| Precios Mayoreo       | ✅  | ✅        | ✅         | ?             | Reglas diferenciadas por vertical. |
| Caja / Finanzas       | ⚠️  | ✅        | ✅         | ✅            | Requiere conciliaciones y arqueos. |
| Reportes & Analytics  | ✅  | ✅        | ✅         | ✅            | Dashboards por vertical. |
| Integraciones externos| ⚠️  | ✅        | ✅         | ✅            | ERP, facturación electrónica, etc. |

Leyenda: ✅ disponible/planificado, ⚠️ requiere adaptación, ? por definir.

# 3. Estrategia de feature toggles / licencias

## Backend
- Se exponen flags `modules.<slug>.enabled` en `application.yml` y `@ConditionalOnProperty` controla controladores (inventario, clientes, proveedores, compras, cotizaciones). 【F:back-costa/src/main/resources/application.yml†L36-L45】
- `FeatureFlagServiceImpl` consulta `module_license` (único por `tenant_id` + `module_id`) y expone `enabled(...)` / `enabledForCurrentUser(...)`; actualmente usa `user.id` como tenant. 【F:back-costa/src/main/java/com/ferrisys/service/impl/FeatureFlagServiceImpl.java†L17-L102】
- `CustomUserDetailsService` agrega authorities `MODULE_<SLUG>` cuando la licencia está activa, permitiendo `@PreAuthorize`. 【F:back-costa/src/main/java/com/ferrisys/config/security/CustomUserDetailsService.java†L31-L68】
- Pendiente: exponer endpoints para administrar `module_license` y normalizar el concepto de tenant (hoy = `user.id`).

### Cómo habilitar o deshabilitar módulos

1. **A nivel de despliegue**: en el `application.yml` (o `application-<profile>.yml`) ajustar la propiedad `modules.<slug>.enabled`. Por ejemplo, definir `modules.inventory.enabled=false` evita que Spring exponga los controladores y bloquea cualquier autorización en runtime.
2. **A nivel de tenant**: insertar o actualizar un registro en `module_license` con el `tenant_id` (usar `user_id` como proxy temporal) y el `module_id`. Establecer `enabled=false` o una `expires_at` anterior a la fecha actual revoca el acceso.
3. **Verificación**: el backend usa `FeatureFlagService.enabled(tenantId, moduleSlug)` y `enabledForCurrentUser(moduleSlug)` en los `@PreAuthorize`, garantizando que un módulo sólo responda 200 cuando ambas condiciones (propiedad + licencia vigente) se cumplen.
4. **Lista para frontend**: el endpoint `/v1/auth/modules` consulta las licencias activas para el usuario autenticado, por lo que el cliente puede construir la UI en función de la misma fuente de verdad.

## Frontend
- Consumir `/v1/auth/modules` tras login y almacenar lista de módulos habilitados.
- Crear `PermissionGuard` que verifique si la ruta solicitada está en módulos habilitados.
- Generar menú dinámico a partir de la lista (en lugar de menú hardcodeado en `MainLayoutComponent`).
- Implementar `FeatureToggleDirective` para mostrar/ocultar componentes según permisos.

> **Actualización:** El front invoca `/v1/auth/modules` tras el login y guarda el resultado en `SessionService`, pero debe parsear el `PageResponse<ModuleDTO>` para alimentar `MenuBuilderService`/`PermissionGuard` (hoy espera `string[]`).

# 4. Próximos pasos

1. Normalizar catálogo de módulos en BD y asegurar que UUID/slug coincidan entre backend y frontend.
2. Definir naming convention (`MODULE_INVENTORY`, `MODULE_SALES`) para authorities/flags.
3. Implementar seeds por vertical que habiliten módulos apropiados y creen roles base (ej. `Ferreteria-Admin`, `Abarrotes-Operador`).
4. Ajustar servicios Angular para usar un `ApiService` central con inyección del token y manejo de permisos.
5. Documentar en runbook cómo habilitar/deshabilitar módulos por tenant.
