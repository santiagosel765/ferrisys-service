# 1. Modelo de datos actual

## 1.1 Esquema de autenticación

| Tabla | Campos principales | Relaciones |
|-------|--------------------|------------|
| `auth_user` | `id` (UUID), `username` único, `password` (BCrypt), `email`, `full_name`, `status_id`, timestamps | FK `status_id` → `user_status.status_id` |
| `user_status` | `status_id` (UUID), `name`, `description` | Referenciada por usuarios |
| `auth_role` | `id`, `name` único, `description`, `status` | Asociada a usuarios y módulos |
| `auth_module` | `id`, `name` único, `description`, `status` | Catálogo de módulos habilitables |
| `auth_user_role` | `id`, `auth_user_id`, `auth_role_id`, `status` | FK a usuario y rol |
| `auth_role_module` | `id`, `auth_role_id`, `auth_module_id`, `status` | FK a rol y módulo |
| `module_license` | `id`, `tenant_id`, `module_id`, `enabled`, `expires_at`, timestamps | FK `module_id` → `auth_module.id`; índice único `(tenant_id, module_id)` |

## 1.2 Esquema de inventario

| Tabla | Campos principales | Relaciones |
|-------|--------------------|------------|
| `inv_category` | `id`, `name` único, `description`, `parent_category_id`, `status`, auditoría | jerarquía simple por UUID padre |
| `inv_product` | `id`, `name`, `description`, `category_id`, `company_id`, `status`, auditoría | FK `category_id` → `inv_category.id` |

## 1.3 Esquema de negocio

| Tabla | Campos principales | Relaciones |
|-------|--------------------|------------|
| `bus_client` | `id`, `name`, `email`, `phone`, `address`, `status`, auditoría | — |
| `bus_provider` | `id`, `name`, `contact`, `phone`, `address`, `ruc`, `status`, auditoría | — |
| `bus_quote` | `id`, `client_id`, `description`, `quote_date`, `total`, `status`, auditoría | FK `client_id` → `bus_client.id` |
| `bus_quote_detail` | `id`, `quote_id`, `product_id`, `quantity`, `unit_price`, auditoría | FK a `bus_quote.id` y `inv_product.id` |
| `bus_purchase` | `id`, `provider_id`, `description`, `purchase_date`, `total`, `status`, auditoría | FK `provider_id` → `bus_provider.id` |
| `bus_purchase_detail` | `id`, `purchase_id`, `product_id`, `quantity`, `unit_price`, auditoría | FK a `bus_purchase.id` y `inv_product.id` |

## 1.4 Auditoría

Todas las entidades que extienden `Auditable` incluyen `created_at` y `updated_at` (set por callbacks `@PrePersist`/`@PreUpdate`). No se almacenan `created_by`/`updated_by`. 【F:back-costa/src/main/java/com/ferrisys/common/audit/Auditable.java†L14-L31】

# 2. Diagrama ER (Mermaid)

```mermaid
erDiagram
    auth_user {
        UUID id
        string username
        string password
        string email
        string full_name
        UUID status_id
    }
    user_status {
        UUID status_id
        string name
        string description
    }
    auth_role {
        UUID id
        string name
        string description
        int status
    }
    auth_module {
        UUID id
        string name
        string description
        int status
    }
    auth_user_role {
        UUID id
        UUID auth_user_id
        UUID auth_role_id
        int status
    }
    auth_role_module {
        UUID id
        UUID auth_role_id
        UUID auth_module_id
        int status
    }
    inv_category {
        UUID id
        string name
        UUID parent_category_id
        int status
    }
    inv_product {
        UUID id
        string name
        string description
        UUID category_id
        UUID company_id
        int status
    }
    bus_client {
        UUID id
        string name
        string email
        string phone
        string address
        int status
    }
    bus_provider {
        UUID id
        string name
        string contact
        string phone
        string address
        string ruc
        int status
    }
    bus_quote {
        UUID id
        UUID client_id
        date quote_date
        decimal total
        int status
    }
    bus_quote_detail {
        UUID id
        UUID quote_id
        UUID product_id
        int quantity
        decimal unit_price
    }
    bus_purchase {
        UUID id
        UUID provider_id
        date purchase_date
        decimal total
        int status
    }
    bus_purchase_detail {
        UUID id
        UUID purchase_id
        UUID product_id
        int quantity
        decimal unit_price
    }

    auth_user ||--o{ auth_user_role : tiene
    auth_role ||--o{ auth_user_role : asigna
    auth_role ||--o{ auth_role_module : habilita
    auth_module ||--o{ auth_role_module : disponible
    auth_user }o--|| user_status : estado

    inv_category ||--o{ inv_category : subcategoria
    inv_category ||--o{ inv_product : agrupa

    bus_client ||--o{ bus_quote : solicita
    bus_provider ||--o{ bus_purchase : atiende
    inv_product ||--o{ bus_quote_detail : cotizado
    inv_product ||--o{ bus_purchase_detail : comprado
    bus_quote ||--o{ bus_quote_detail : detalle
    bus_purchase ||--o{ bus_purchase_detail : detalle
```

# 3. Convenciones e índices
- Claves primarias UUID generadas vía `org.hibernate.id.UUIDGenerator` en todas las entidades. 【F:back-costa/src/main/java/com/ferrisys/common/entity/user/User.java†L24-L31】
- Campos `status` (Integer) funcionan como soft delete (1 activo, 0 inactivo) sin índices dedicados.
- `inv_category.name` y `auth_module.name`/`auth_role.name` tienen restricciones `unique` aplicadas en JPA (deben confirmarse en DB).
- No existen índices explícitos para búsquedas por `username`, `email`, `status`; recomendable crear índices btree.

# 4. Recomendaciones de migraciones
- Ya se usa **Flyway** con `V1__baseline.sql` (esquema completo), `V2__seed_base.sql` (catálogos iniciales) y `V3__module_license.sql` (tabla de licencias). Mantener nuevas alteraciones como migraciones incrementales.
- Ampliar seeds para crear licencias de ejemplo por módulo/tenant (tabla `module_license`) alineadas con los UUID de `DefaultRole`/`DefaultUserStatus`.
- Añadir columnas `created_by` y `updated_by`, respaldadas por auditoría Spring Security (`AuditorAware`).
- Definir restricciones `ON DELETE` apropiadas (actualmente rely on cascada JPA). Ej.: `ON DELETE CASCADE` en detalles de compras/cotizaciones.
- Evaluar índice compuesto `(status, name)` en catálogos y `(status, provider_id)` en compras para acelerar filtros activos.
- Preparar scripts para soporte multi-tenant: agregar columna `tenant_id` (UUID) con índice compuesto `(tenant_id, status)`.
