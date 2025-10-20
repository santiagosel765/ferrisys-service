# 1. Preparación

## 1.1 Requisitos
- JDK 17
- Maven Wrapper (`back-costa/mvnw`)
- Node.js 22.x y npm (Angular 19)
- Acceso a base de datos PostgreSQL con SSL (`sslmode=require`)

## 1.2 Variables sensibles
Configurar mediante variables de entorno o perfiles externos:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SERVER_PORT` (opcional)
- Opcional: copiar `back-costa/src/main/resources/application-local.yml.sample` a `application-local.yml` y reemplazar los valores `PLEASE_SET_*`.

Ejemplo Linux/macOS:
```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://host:5432/postgres?sslmode=require"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="****"
export JWT_SECRET="<clave de 32+ chars>"
```

# 2. Arranque local end-to-end

## 2.1 Backend
```bash
cd back-costa
./mvnw flyway:migrate
./mvnw clean spring-boot:run
```
- Verificar salud en `http://localhost:8081/ferrisys-service/actuator/health`.
- Logs muestran SQL (`spring.jpa.show-sql=true`).

## 2.2 Frontend
```bash
cd front-costa
npm ci
npx ng serve -o
```
- La aplicación abre en `http://localhost:4200`.
- Asegurar que `src/environments/environment.ts` apunte al backend correcto.

# 3. Migraciones y datos
- Las migraciones se administran con Flyway. Ejecutar `./mvnw flyway:migrate` (o dejar que Spring lo haga al arrancar) cuando la base esté vacía.
- Orden actual: `V1__baseline.sql` (crea esquema completo), `V2__seed_base.sql` (carga estados, roles, módulos y relación rol-módulo) y `V3__module_license.sql` (tabla/licencias + trigger `updated_at`).
- Los seeds respetan los UUID fijos definidos en `DefaultRole` y `DefaultUserStatus`; añade registros en `module_license` para habilitar módulos por `tenant_id` (usar `auth_user.id` mientras no exista tabla de tenant).

# 4. Troubleshooting

| Problema | Síntoma | Resolución |
|----------|---------|------------|
| Error CORS en frontend | Consola muestra `Access-Control-Allow-Origin` faltante | Confirmar que el frontend corre en `http://localhost:4200`; si se usa otro host agregarlo en `SecurityConfig` CORS. |
| `Token expired` (401) | Backend responde texto plano | Solicitar nuevo login; token dura 10h. Revisar reloj del servidor. |
| `Invalid token` (400) | Token malformado o firmado con otra clave | Limpiar `sessionStorage` en el navegador, reiniciar sesión. |
| Fallo de conexión DB | Stacktrace `Connection refused` o `sslmode` | Validar credenciales y que la base acepte SSL. Ajustar `SPRING_DATASOURCE_URL`. |
| Endpoints 404 desde frontend | Angular intenta `/inventory/category/list` | Corregir servicios (`CategoryService`, `ProductService`) para usar `/inventory/categories` y `/inventory/products`. |
| Puerto 8081 ocupado | Arranque falla con `Address already in use` | Cambiar `SERVER_PORT` o detener proceso que ocupa el puerto. |
| `/v1/auth/modules` devuelve 405/400 | Front hace `GET` sin body y espera `string[]` | Cambiar a `POST` con `page/size` y mapear el `PageResponse<ModuleDTO>` a un arreglo de `name`. |

## 4.1 Mapeo de errores

El backend normaliza las respuestas de error mediante `GlobalExceptionHandler` con la siguiente estructura JSON:

```json
{
  "timestamp": "2024-06-01T12:34:56.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "detalle del error",
  "path": "/ferrisys-service/..."
}
```

| Excepción | Código | Comentario |
|-----------|--------|------------|
| `MethodArgumentNotValidException`, `BadRequestException`, `IllegalArgumentException` | 400 | Se listan los campos inválidos usando Bean Validation. |
| `ExpiredJwtException` | 401 | Respuesta estándar "Token expired" sin exponer el token original. |
| `AccessDeniedException` | 403 | Indica falta de permisos sobre el recurso solicitado. |
| `EntityNotFoundException`, `NotFoundException` | 404 | El recurso solicitado no existe o está inactivo. |
| `Exception` genérica | 500 | Mensaje genérico, el detalle completo queda en logs. |

# 5. Checklist pre-PR
1. Ejecutar `./mvnw -pl back-costa test` (agregar pruebas cuando existan).
2. Ejecutar `npm run lint/test` (cuando se configuren) en `front-costa`.
3. Verificar que `environment.ts` no contenga secretos ni URLs de producción.
4. Correr `npm run build` y `./mvnw package` para asegurarse de que compilan.
5. Actualizar documentación (API, ADR) si se cambian endpoints o decisiones.
6. Pasar `spotless`/formatters si se integran en el futuro.

# 6. Checklist post-merge
1. Desplegar migraciones (Flyway) antes de iniciar el backend en ambientes compartidos.
2. Rotar secretos si se expusieron temporalmente en pruebas.
3. Actualizar `environment.prod.ts` o variables en pipeline si cambian URLs.
4. Ejecutar smoke test: `POST /v1/auth/login` y `GET /v1/inventory/categories` con token.
5. Sincronizar módulos habilitados con nuevos tenants (actualizar tabla de licencias cuando exista).
