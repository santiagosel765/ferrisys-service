# ADR-0001: Monorepo para Ferrisys Service

- **Estado**: Propuesto (aceptar tras revisión)
- **Fecha**: 2025-10-20

## 1. Contexto
El proyecto actual combina backend (`back-costa/`, Spring Boot) y frontend (`front-costa/`, Angular) en un mismo repositorio Git. No existe aún una guía formal que documente la motivación, reglas de carpetas ni estrategia de despliegue. A mediano plazo se planea separar los repositorios para operaciones independientes.

## 2. Decisión
Mantener un **monorepo** durante la fase de desarrollo inicial para facilitar:
- Evolución coordinada de contratos API/UI.
- Gestión centralizada de issues y documentación compartida (`docs/`).
- Automatización de pipelines que construyen backend y frontend en conjunto.

Definir desde ahora convenciones que permitan una futura separación limpia en dos repositorios (backend y frontend).

## 3. Lineamientos
1. **Estructura**
   - `back-costa/`: código y recursos backend. Mantener módulos Java dentro de `src/main/java` siguiendo paquete `com.ferrisys`.
   - `front-costa/`: código Angular. Mantener assets en `src/assets`, usar standalone components.
   - `docs/`: documentación técnica (overview, arquitectura, ADRs).
2. **Git**
   - Usar ramas feature `feature/<area>/<descripcion>` y PRs que incluyan cambios coherentes en ambos lados cuando se afecte el contrato.
   - Aplicar etiquetas en commits/PRs (`[backend]`, `[frontend]`) cuando corresponda.
3. **Dependencias**
   - Backend: administrar versiones vía `pom.xml` (Spring Boot 3.4.x). Evitar dependencias circulares.
   - Frontend: bloquear versiones en `package-lock.json`. Mantener Node LTS.
4. **Build**
   - Scripts de automatización deben vivir en la raíz (`scripts/`). Agregar `run-backend.sh`, `run-frontend.sh`, `run-all.sh` a futuro.
   - Configurar pipelines CI con matrices (JDK 17, Node 22) que construyan ambos proyectos en paralelo.
5. **Despliegue**
   - Contenerización independiente: `back-costa/Dockerfile`, `front-costa/Dockerfile` (ya presentes). Mantener sincronizados.
   - Publicar imágenes con tags alineados (`backend:<version>`, `frontend:<version>`).

## 4. Consecuencias
- **Positivas**:
  - Facilita cambios coordinados y documentación compartida.
  - Simplifica onboarding de equipos que trabajan full-stack.
  - Una sola fuente de verdad para issues y ADRs.
- **Negativas**:
  - Historial y pipelines más pesados (instalación de Node + Maven).
  - Riesgo de PRs grandes; se deben reforzar revisiones segmentadas.
  - Mayor dificultad para otorgar permisos de acceso diferenciados.

## 5. Estrategia de separación futura
- Establecer `git subtree` o `git filter-repo` para extraer `back-costa` y `front-costa` cuando la organización lo requiera.
- Mantener documentación replicable: cada repo deberá incluir README, runbook y pipeline propios.
- Definir artefactos compartidos (p.ej. esquemas OpenAPI, paquetes npm/Java) hospedados en repositorios dedicados.

## 6. Próximos pasos
1. Aprobar este ADR y comunicarlo al equipo.
2. Añadir ADRs específicos para pipelines CI/CD y estrategia de versionamiento.
3. Automatizar verificación de formato y pruebas por carpeta (`back-costa`, `front-costa`).
4. Preparar scripts de sincronización (`run-all`) que respeten la estructura acordada.
