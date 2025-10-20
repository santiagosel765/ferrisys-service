Contexto de repositorio (monorepo):

back-costa/ → Spring Boot 3.4.x, Java 17, JPA, Security JWT, PostgreSQL (Supabase, sslmode=require), context-path: /ferrisys-service.

front-costa/ → Angular 19, ng-zorro-antd, HttpClient, base URL dev esperada: http://localhost:8081/ferrisys-service.

Objetivo de negocio: plataforma modular y escalable para múltiples verticales (ferretería, abarrotería, etc.), con habilitación selectiva de módulos por cliente (feature toggles / perfiles / licencias).

Tu tarea (muy importante):

Leer código real del repo (no inventar APIs ni clases).

Mapear el estado actual: arquitectura, módulos, endpoints, entidades, flujos de auth, configuración, build y run.

Detectar huecos y proponer un plan de evolución modular (ej. Domain-Driven Design + toggles de módulos).

Entregar archivos Markdown en /docs (ver “Entregables”).

1) Inspección técnica

Backend (back-costa/):

Lee pom.xml, paquetes, SecurityConfig, filtros JWT, controladores, servicios, repositorios, DTOs, application*.yml.

Lista todos los endpoints con: método, path (sin/ con context-path), request/response y códigos.

Describe autenticación/ autorización (roles, filtros), CORS, mecanismo JWT (claim set, expiración, issuer si existe).

Detalla persistencia: entidades JPA, relaciones, convenciones (ej. audit: created_at, created_by, etc.), HikariCP, dialecto.

Señala dependencias críticas y versiones (Spring Boot, jjwt, postgresql, lombok, etc.).

Frontend (front-costa/):

Lee package.json, angular.json, src/environments/*, módulos, rutas, servicios HttpClient que consumen backend.

Identifica componentes críticos (login, listados, CRUDs) y cómo forman la UI-base.

Entrega en tablas + listas, sin omitir imports en snippets que incluyas.

2) Documentación solicitada (crear/actualizar estos archivos en /docs)

TECH_OVERVIEW.md

Propósito del sistema, alcance actual, capas lógicas (web/controller, service, repository), dependencias externas.

Tabla de endpoints (método, path, seguridad, request DTO, response DTO, códigos).

Tabla de entidades (tabla, campos clave, relaciones).

Configuración por entorno: variables y perfiles (DB, puertos, context-path, CORS, JWT secret).

Guía de build & run local:

Backend: .\mvnw spring-boot:run (o mvn), requisitos JDK 17, sslmode=require.

Frontend: npm ci && npx ng serve -o.

Matriz de deudas técnicas y quick wins (priorizadas).

ARCHITECTURE.md

Diagramas Mermaid (mínimo 3):

Diagrama de componentes (Frontend ↔ Backend ↔ DB).

Secuencia login (Angular → /v1/auth/login → JWT → Interceptor → API).

Flujo CRUD típico (UI → Service → Controller → Service → Repository → DB).

Decisiones de seguridad (stateless, filtros, CORS), paginación/validación/logging si existen.

Consideraciones de observabilidad (logs, Actuator si aplica).

API_CATALOG.md

Catálogo exhaustivo de endpoints (por recurso):

Sección por controlador con ejemplos de request/response (JSON).

Estados de error comunes.

Si falta OpenAPI/Swagger, proponer mapeo inicial (sin inventar, basado en el código) y sugerir dónde colocar springdoc-openapi o similar.

DATA_MODEL.md

Diagramas de tablas (texto + Mermaid ER simple).

Campos audit, índices, claves foráneas, y convenciones de nombres.

Recomendaciones de migraciones (Flyway/Liquibase) si no existen.

MODULES_MATRIX.md

Lista de módulos actuales (inventario, ventas, compras, etc.) y capas afectadas (UI/servicios/DB).

Propuesta de segmentación por vertical (ferretería, abarrotería…) con una matriz:

| Módulo               | Core | Ferretería | Abarrotería | Otros |
|----------------------|:----:|:----------:|:-----------:|:-----:|
| Productos            |  ✅  |     ✅     |      ✅     |  ✅   |
| Ventas               |  ✅  |     ✅     |      ✅     |  ✅   |
| Compras              |  ✅  |     ✅     |      ✅     |  ✅   |
| Inventario (lotes)   |  ✅  |     ✅     |      ⚠️     |  ?    |
| Precios mayoreo      |  ✅  |     ✅     |      ✅     |  ?    |
| …                    |      |            |             |       |


Sugerir feature toggles / “licencias” a nivel backend (anotaciones/condicionales por módulo) y frontend (rutas/menús por permisos).

RUNBOOK.md

Arranque local end-to-end (backend+frontend), migraciones, variables mínimas.

Troubleshooting común (errores CORS, DB SSL, JWT inválido, puertos ocupados).

Checklist de pre-PR y post-merge.

ADR/ADR-0001-monorepo.md

Decisión de monorepo en desarrollo (pros/cons, cómo se separará en producción en 2 repos).

Reglas de carpetas, gitignore y standarización.

Formato: Markdown claro, tablas donde aporte valor, y secciones numeradas.
IMPORTANTÍSIMO: Si algo no existe en el código, marcar como TODO con sugerencia concreta (no inventar).

3) Plan de escalabilidad modular (propuesta concreta)

Entregar en ARCHITECTURE.md una sección “Evolución a plataforma multi-vertical” con:

Dominios sugeridos (DDD ligero): Catálogo, Inventarios, Ventas, Compras, Precios, Clientes/Proveedores, Caja, etc.

Strategy de módulos:

Backend: @ConditionalOnProperty("modules.X.enabled"), configuración por company/tenant, FeatureFlagService, guards en servicios/controladores.

Frontend: route guards + menu builder según permisos/módulos habilitados.

Multi-tenant (si aplica): recomendaciones de inicio (por esquema vs por columna tenant_id).

Extensibilidad: catálogo común + plug-ins por vertical (p.ej., reglas de unidades para ferretería vs abarrotes).

Data governance: convención de auditoría (ya existente), versionado de migraciones, seed por vertical.

4) Issues sugeridos (crear lista en TECH_OVERVIEW.md)

Crear un backlog inicial (10–20 ítems) etiquetado por prioridad:

docs: integrar springdoc-openapi y UI Swagger.

security: test e2e de CORS + interceptor JWT Angular.

persistence: agregar Flyway y primera migración baseline.

frontend: servicio ApiService central, AuthInterceptor, lazy loading por módulo.

infra: scripts run-all.ps1, matrices de CI (JDK 17 + Node 22).

ux: patrón de diseño base ng-zorro + layout.

config: externalizar secretos (env vars), perfiles dev/test/prod.

5) Reglas de respuesta

Trabaja basado en el código real del repo. Si algo no está, marca TODO con instrucción exacta (archivo y snippet sugerido).

No inventes endpoints ni entidades. Extrae nombres tal cual del código.

Incluye rutas con context-path (/ferrisys-service) cuando muestres URLs completas.

Sé explícito en paths de archivo (ej: back-costa/src/main/java/.../SecurityConfig.java).

Entrega todos los archivos en /docs listados arriba, con contenido completo.