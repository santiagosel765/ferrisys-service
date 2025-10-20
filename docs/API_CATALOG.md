# Catálogo de API REST

Todos los endpoints comparten el prefijo `/ferrisys-service` y retornan/aceptan JSON UTF-8. Autenticación mediante header `Authorization: Bearer <token>` salvo endpoints públicos indicados.

## 1. Autenticación (`AuthRestController`)

### 1.1 POST `/v1/auth/register`
- **Descripción**: Registra un usuario con rol por defecto (`USER`).
- **Body**:
  ```json
  {
    "username": "demo",
    "password": "ChangeMe123",
    "email": "demo@example.com",
    "fullName": "Demo User"
  }
  ```
- **Respuesta 201**:
  ```json
  {
    "token": "<jwt>",
    "username": "demo",
    "email": "demo@example.com",
    "role": "USER"
  }
  ```
- **Errores**: 400 `Username already exists`, 500 estado/rol no encontrado.

### 1.2 POST `/v1/auth/login`
- **Descripción**: Autentica y devuelve token JWT de 10 horas.
- **Body**:
  ```json
  {
    "username": "demo",
    "password": "ChangeMe123"
  }
  ```
- **Respuesta 200**: Igual formato que registro.
- **Errores**: 400 `Invalid credentials`, 404 `User not found`.

### 1.3 POST `/v1/auth/change-password`
- **Descripción**: Cambia contraseña utilizando token de recuperación.
- **Query params**: `newPassword`, `confirmPassword`, `userToken` (JWT emitido previamente).
- **Respuesta 200**: `AuthResponse` con nuevo token.
- **Errores**: 400 si contraseñas no coinciden, 404 usuario inexistente.

### 1.4 POST `/v1/auth/modules`
- **Descripción**: Lista módulos asociados al usuario autenticado. El método exige JWT y lee módulos habilitados según licencias; el frontend actual realiza `GET` y espera `string[]`, por lo que debe adaptarse al `PageResponse<ModuleDTO>` real.
- **Query params**: `page` (0), `size` (10).
- **Respuesta 200**:
  ```json
  {
    "content": [
      { "id": "uuid", "name": "Inventario", "description": "Gestión de inventario", "status": 1 }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "currentPage": 0,
    "pageSize": 10
  }
  ```

## 2. Módulos (`ModuleController`)

### 2.1 POST `/v1/modules/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "Inventario",
    "description": "Permite administrar inventario",
    "status": 1
  }
  ```
- **Respuesta**: `200 OK` sin cuerpo.
- **Errores**: 404 módulo inexistente en actualización.
- **Seguridad**: Solo requiere JWT; no hay `@PreAuthorize`, por lo que se recomienda añadir validación adicional.

### 2.2 GET `/v1/modules/list`
- **Query params**: `page`, `size`.
- **Respuesta**: `PageResponse<ModuleDTO>`.
- **Seguridad**: JWT obligatorio, sin restricciones por módulo/rol.

### 2.3 POST `/v1/modules/disable`
- **Query param**: `id` (UUID).
- **Respuesta**: `200 OK` sin cuerpo.
- **Seguridad**: JWT obligatorio, sin restricciones adicionales.

## 3. Roles (`RoleController`)

### 3.1 POST `/v1/roles/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "ADMIN",
    "description": "Acceso completo",
    "status": 1,
    "moduleIds": ["uuid-modulo"]
  }
  ```
- **Respuesta 200**:
  ```json
  "Rol procesado correctamente"
  ```
- **Notas**: Los módulos asociados existentes se reemplazan.
- **Seguridad**: JWT obligatorio, no hay `@PreAuthorize`; cualquier usuario autenticado puede crear/editar roles.

### 3.2 POST `/v1/roles/list`
- **Descripción**: Retorna `PageResponse<RoleDTO>`.
- **Seguridad**: JWT obligatorio, sin filtros adicionales.

### 3.3 POST `/v1/roles/disable`
- **Query param**: `roleId`.
- **Respuesta**: `"Rol deshabilitado"`.
- **Seguridad**: Solo JWT.

## 4. Inventario (`InventoryController`)

### 4.1 POST `/v1/inventory/category/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "Herramientas",
    "description": "Categoría ferretería",
    "parentCategoryId": null,
    "status": 1
  }
  ```
- **Respuesta**: `200 OK` sin cuerpo.
- **Errores**: 404 si `parentCategoryId` no existe.
- **Seguridad**: `@PreAuthorize("@featureFlagService.enabledForCurrentUser('inventory') and (hasAuthority('MODULE_INVENTORY') or hasRole('ADMIN'))")`.

### 4.2 POST `/v1/inventory/category/disable`
- **Query param**: `id`.
- **Seguridad**: Misma expresión de feature flag / autoridad que el guardado.

### 4.3 GET `/v1/inventory/categories`
- **Respuesta**: `PageResponse<CategoryDTO>`.
- **Seguridad**: Requiere módulo `INVENTORY` o rol `ADMIN` con flag activo.

### 4.4 POST `/v1/inventory/product/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "Taladro",
    "description": "Taladro percutor",
    "companyId": "uuid empresa opcional",
    "categoryId": "uuid categoría",
    "status": 1
  }
  ```
- **Errores**: 404 si la categoría no existe.
- **Seguridad**: Igual que categorías.

### 4.5 POST `/v1/inventory/product/disable`
- **Query param**: `id`.
- **Seguridad**: Igual que categorías.

### 4.6 GET `/v1/inventory/products`
- **Respuesta**: `PageResponse<ProductDTO>` con `categoryId` dentro de cada DTO.
- **Seguridad**: Igual que categorías.

## 5. Clientes (`ClientController`)

### 5.1 POST `/v1/clients/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "Ferretería San Juan",
    "email": "cliente@correo.com",
    "phone": "502-5555",
    "address": "Zona 1",
    "status": 1
  }
  ```
- **Seguridad**: `@PreAuthorize("@featureFlagService.enabledForCurrentUser('clients')")`.

### 5.2 POST `/v1/clients/disable`
- **Query param**: `id`.
- **Seguridad**: Igual que guardado.

### 5.3 GET `/v1/clients/list`
- **Respuesta**: `PageResponse<ClientDTO>`.
- **Seguridad**: Igual que guardado.

## 6. Proveedores (`ProviderController`)

### 6.1 POST `/v1/providers/save`
- **Body**:
  ```json
  {
    "id": "uuid opcional",
    "name": "Suministros GT",
    "contact": "Juan Pérez",
    "phone": "502-4444",
    "address": "Zona 4",
    "ruc": "1234567-8",
    "status": 1
  }
  ```
- **Seguridad**: `@PreAuthorize("@featureFlagService.enabledForCurrentUser('providers')")`.

### 6.2 POST `/v1/providers/disable`
- **Query param**: `id`.
- **Seguridad**: Igual que guardado.

### 6.3 GET `/v1/providers/list`
- **Respuesta**: `PageResponse<ProviderDTO>`.
- **Seguridad**: Igual que guardado.

## 7. Compras (`PurchaseController`)

### 7.1 POST `/v1/purchases/save`
- **Body**:
  ```json
  {
    "id": null,
    "providerId": "uuid proveedor",
    "description": "Compra semanal",
    "date": "2024-10-18",
    "total": 1500.00,
    "status": 1,
    "details": [
      { "productId": "uuid producto", "quantity": 10, "unitPrice": 150.0 }
    ]
  }
  ```
- **Notas**: Los detalles existentes se eliminan y se recrean en cada guardado. 【F:back-costa/src/main/java/com/ferrisys/service/business/impl/PurchaseServiceImpl.java†L38-L71】
- **Seguridad**: `@PreAuthorize("@featureFlagService.enabledForCurrentUser('purchases')")`.

### 7.2 POST `/v1/purchases/disable`
- **Query param**: `id`.
- **Seguridad**: Igual que guardado.

### 7.3 GET `/v1/purchases/list`
- **Respuesta**: `PageResponse<PurchaseDTO>` con detalles anidados (`productId`, `quantity`, `unitPrice`).
- **Seguridad**: Igual que guardado.

## 8. Cotizaciones (`QuoteController`)

### 8.1 POST `/v1/quotes/save`
- **Body**:
  ```json
  {
    "id": null,
    "clientId": "uuid cliente",
    "description": "Cotización agosto",
    "date": "2024-08-01",
    "total": 2500.00,
    "status": 1,
    "details": [
      { "productId": "uuid producto", "quantity": 5, "unitPrice": 500.0 }
    ]
  }
  ```
- **Notas**: Se reemplazan los detalles igual que en compras. 【F:back-costa/src/main/java/com/ferrisys/service/business/impl/QuoteServiceImpl.java†L38-L71】
- **Seguridad**: `@PreAuthorize("@featureFlagService.enabledForCurrentUser('quotes')")`.

### 8.2 POST `/v1/quotes/disable`
- **Query param**: `id`.
- **Seguridad**: Igual que guardado.

### 8.3 GET `/v1/quotes/list`
- **Respuesta**: `PageResponse<QuoteDTO>` con detalles.
- **Seguridad**: Igual que guardado.

## 9. Salud (`HealthController`)

### 9.1 GET `/actuator/health`
- **Descripción**: Endpoint simple para chequeo de disponibilidad. Con el controlador custom responde texto plano `"pong"`; sin él, Actuator entrega JSON estándar.
- **Respuesta 200**: `"pong"` (custom) o JSON de Actuator.

## 10. Estados de error comunes
- `Token expired` (401): Devuelto por `JwtFilterRequest` al detectar expiración. 【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L41-L46】
- `Invalid token` (400): Token corrupto o firma inválida. 【F:back-costa/src/main/java/com/ferrisys/config/security/filter/JwtFilterRequest.java†L46-L49】
- `RuntimeException` genéricas se propagan como 500 en ausencia de manejadores globales.

## 11. Recomendaciones OpenAPI
- Agregar dependencia `org.springdoc:springdoc-openapi-starter-webmvc-ui` en `pom.xml`.
- Crear clase de configuración `@OpenAPIDefinition` en `back-costa` y exponer Swagger UI en `/swagger-ui.html`.
- Documentar esquemas para `AuthResponse`, `PageResponse<T>` y DTOs de dominio.
- Configurar seguridad JWT mediante `@SecurityScheme` y ejemplos de `Bearer` para cada operación.
