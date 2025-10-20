Contexto del repo
- Monorepo con:
  - back-costa/ (Spring Boot 3.4.x, Java 17, Security JWT, JPA, Flyway si ya existe, Actuator, OpenAPI/Swagger)
  - front-costa/ (Angular 19, ng-zorro, AuthInterceptor, ApiService)
- Context-path backend: /ferrisys-service
- Base URL dev frontend: http://localhost:8081/ferrisys-service
- Objetivo de negocio: plataforma modular multi-vertical (inventario, compras, ventas, etc.) con toggles/licencias.

Tu objetivo
1) Re-auditar el código REAL (no inventar) y actualizar la documentación técnica con el estado actual tras los últimos PRs.
2) Verificar consistencia entre código y docs (rutas, modelos, seguridad, migraciones, CORS).
3) Generar un “diff de arquitectura” (qué cambió vs. docs anteriores) y un plan corto de siguientes pasos.

Alcance concreto
- Inspeccionar:
  - back-costa/pom.xml y configuración (SecurityConfig, JwtFilterRequest, OpenApiConfig, Flyway migrations, application*.yml)
  - Controllers/Services/Repositories/DTOs/Entities
  - front-costa/package.json, angular.json, environments, interceptors/guards/servicios y rutas
- Validar:
  - OpenAPI: que Swagger UI apunte a /ferrisys-service y documente Bearer.
  - Actuator: health/info expuestos como se definió.
  - CORS: orígenes, headers, OPTIONS.
  - Authorities: UserDetailsService/roles/módulos, @EnableMethodSecurity, @PreAuthorize aplicados.
  - Flyway: existencia de V1__baseline.sql y seeds; jpa ddl-auto=validate.
  - Alineación FE/BE: que servicios Angular llamen a endpoints correctos.

Entregables (archivos en /docs)
1) Actualiza **TECH_OVERVIEW.md** (secciones y tablas con el estado real).
2) Actualiza **ARCHITECTURE.md** (diagramas Mermaid si cambiaron flujos).
3) Actualiza **API_CATALOG.md** (extrae endpoints de OpenAPI si existe; si no, del código).
4) Actualiza **DATA_MODEL.md** (ER y notas de índices/uniques; reflejar Flyway actual).
5) Actualiza **MODULES_MATRIX.md** (si hay toggles/licencias implementados).
6) Actualiza **RUNBOOK.md** (build & run ahora, con comandos exactos).
7) Crea **docs/AUDIT_REPORT.md** con:
   - “Delta” respecto a la versión anterior de docs (qué se añadió/modificó/eliminó).
   - Riesgos abiertos y quick wins.
   - Lista de TODOs detectados (máx. 10–15), cada uno con archivo/línea aproximada.

Reglas de redacción
- Basarte SÓLO en el código del repo; si algo no existe, márcalo como TODO explícito (no inventes).
- Escribir rutas FULL con el context-path cuando muestres URLs de consumo.
- Incluir paths de archivo al referenciar clases clave.
- Mantener tablas y ejemplos JSON breves pero correctos.

Criterios de aceptación
- Los docs reflejan exactamente lo que hay en el código (rutas, modelos, seguridad, migraciones).
- Se listan problemas de consistencia si los hay (p. ej., endpoint documentado pero no implementado).
- RUNBOOK tiene pasos probables de ejecución (sin hardcodear secretos).
- AUDIT_REPORT muestra cambios detectados y próximos pasos priorizados.

Entrega
- Devuélveme los diffs/archivos completos actualizados en /docs y un breve resumen final de hallazgos.
