# 1. Inventario actual de módulos

| Módulo | Backend | Frontend | Comentarios |
|--------|---------|----------|-------------|
| Autenticación / Roles | Sí (`AuthRestController`, `RoleController`, `ModuleController`) | Login y layout base | Backend funcional; frontend carece de guards e interceptores. |
| Inventario (categorías, productos) | Sí (`InventoryController`) | Pantalla de categorías con datos mock y servicios `CategoryService`/`ProductService` sin integrar | Endpoints de frontend no coinciden con backend (`/list` vs `/categories`). |
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
- Crear configuración `modules.<nombre>.enabled=true` en `application-*.yml` y usar `@ConditionalOnProperty` en servicios/controladores opcionales.
- Persistir licencias por cliente en tabla `module_license(tenant_id, module_id, enabled, expires_at)`.
- Implementar `FeatureFlagService` que consulte licencias y ofrezca métodos `checkModuleEnabled("inventory")` usados en servicios y filtros.
- Extender seguridad para añadir `GrantedAuthority` por módulo, permitiendo aplicar `@PreAuthorize("hasAuthority('MODULE_INVENTORY')")`.

## Frontend
- Consumir `/v1/auth/modules` tras login y almacenar lista de módulos habilitados.
- Crear `PermissionGuard` que verifique si la ruta solicitada está en módulos habilitados.
- Generar menú dinámico a partir de la lista (en lugar de menú hardcodeado en `MainLayoutComponent`).
- Implementar `FeatureToggleDirective` para mostrar/ocultar componentes según permisos.

# 4. Próximos pasos

1. Normalizar catálogo de módulos en BD y asegurar que UUID/slug coincidan entre backend y frontend.
2. Definir naming convention (`MODULE_INVENTORY`, `MODULE_SALES`) para authorities/flags.
3. Implementar seeds por vertical que habiliten módulos apropiados y creen roles base (ej. `Ferreteria-Admin`, `Abarrotes-Operador`).
4. Ajustar servicios Angular para usar un `ApiService` central con inyección del token y manejo de permisos.
5. Documentar en runbook cómo habilitar/deshabilitar módulos por tenant.
