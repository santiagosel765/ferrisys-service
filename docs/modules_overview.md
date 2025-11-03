# Ferrisys - Qbit-SaaS Overview

## Resumen ejecutivo
- Visión: Automatizar la gestión administrativa, inventarios y finanzas de ferreterías y negocios de materiales.
- Stack: Angular, Spring Boot, PostgreSQL, Docker, Maven, JWT, Flyway, Lombok, MapStruct.
- Beneficios: Eficiencia operativa, control de inventario, trazabilidad, modularidad, escalabilidad, multitenant.

## Lista de módulos
### Core de Autenticación (CORE_AUTH)
- Objetivo: Garantizar acceso seguro y trazable a todos los módulos Ferrisys.
- Capacidades: login, roles, permisos, tokens
- Dependencias: Ninguna
- Feature Flags: otp, sessionTimeout, globalCors
- Estado: Desarrollado

### Sucursales y Organizaciones (ORG_BRANCH)
- Objetivo: Modelar multi-empresa y delegar permisos por ubicación.
- Capacidades: multiTenant, branchControl, geocoding
- Dependencias: CORE_AUTH, MASTER_DATA
- Feature Flags: multiBranch, geoTagging
- Estado: En progreso

### Datos Maestros (MASTER_DATA)
- Objetivo: Centralizar catálogos para asegurar consistencia y trazabilidad.
- Capacidades: catalogos, localizacion, taxes
- Dependencias: CORE_AUTH
- Feature Flags: multiCurrency, regionalCatalogs
- Estado: En progreso

### Productos y Servicios (PRODUCTS)
- Objetivo: Mantener catálogo completo de bienes comercializados.
- Capacidades: sku, attributes, pricingLink
- Dependencias: CORE_AUTH, MASTER_DATA
- Feature Flags: kitSupport, variantMatrix
- Estado: En progreso

### Inventario (INVENTORY)
- Objetivo: Garantizar trazabilidad y disponibilidad de stock.
- Capacidades: stock, movimientos, ajustes
- Dependencias: CORE_AUTH, PRODUCTS, MASTER_DATA
- Feature Flags: multiWarehouse, lots, serials
- Estado: Planificado

### Gestión Documental (DOCUMENTS)
- Objetivo: Centralizar comprobantes y evidencias adjuntas.
- Capacidades: storage, templates, search
- Dependencias: CORE_AUTH
- Feature Flags: s3Storage, retentionPolicies
- Estado: Planificado

### Notificaciones (NOTIFICATIONS)
- Objetivo: Informar oportunamente eventos críticos y operativos.
- Capacidades: email, sms, inApp
- Dependencias: CORE_AUTH, WORKFLOWS
- Feature Flags: webPush, whatsapp
- Estado: Planificado

### Clientes (CLIENTS)
- Objetivo: Centralizar información comercial y crediticia de clientes.
- Capacidades: crm, creditProfile, segmentation
- Dependencias: CORE_AUTH, MASTER_DATA
- Feature Flags: scoreCards, preferredPricing
- Estado: En progreso

### Proveedores (SUPPLIERS)
- Objetivo: Optimizar compras con visibilidad de condiciones y entregas.
- Capacidades: suppliers, rating, contracts
- Dependencias: CORE_AUTH, MASTER_DATA
- Feature Flags: slaTracking, integrationEDI
- Estado: En progreso

### Gestión de Precios (PRICING)
- Objetivo: Administrar precios dinámicos y promociones.
- Capacidades: priceLists, discounts, approvals
- Dependencias: CORE_AUTH, PRODUCTS
- Feature Flags: dynamicPricing, volumeDiscounts
- Estado: Planificado

### Ventas (SALES)
- Objetivo: Controlar pipeline de ventas y convertir oportunidades en ingresos.
- Capacidades: orders, fulfillment, pricing
- Dependencias: CORE_AUTH, CLIENTS, PRODUCTS, INVENTORY, PRICING
- Feature Flags: partialFulfillment, creditHold
- Estado: Planificado

### Compras (PURCHASE)
- Objetivo: Garantizar abastecimiento oportuno y controlado.
- Capacidades: purchaseOrders, receipts, threeWayMatch
- Dependencias: CORE_AUTH, SUPPLIERS, PRODUCTS, INVENTORY
- Feature Flags: automaticReorder, approvalFlows
- Estado: Planificado

### Punto de Venta (POS)
- Objetivo: Acelerar ventas retail con integración a inventario en tiempo real.
- Capacidades: fastCheckout, cashControl, receiptPrint
- Dependencias: CORE_AUTH, SALES, INVENTORY, PRICING
- Feature Flags: offlineMode, tipManagement
- Estado: Planificado

### Devoluciones (RETURNS)
- Objetivo: Controlar reingresos y notas de crédito asociadas.
- Capacidades: returns, creditMemo, inspection
- Dependencias: CORE_AUTH, SALES, INVENTORY
- Feature Flags: reverseLogistics, qualityHold
- Estado: Planificado

### WMS (WMS)
- Objetivo: Optimizar operaciones logísticas y picking.
- Capacidades: wavePicking, slotting, rfid
- Dependencias: CORE_AUTH, INVENTORY
- Feature Flags: rfScanning, laborTracking
- Estado: Planificado

### Producción (PRODUCTION)
- Objetivo: Coordinar procesos de manufactura ligera.
- Capacidades: bom, workOrders, backflush
- Dependencias: CORE_AUTH, PRODUCTS, INVENTORY
- Feature Flags: finiteCapacity, qualityChecks
- Estado: Planificado

### Órdenes de Servicio (SERVICE_ORDERS)
- Objetivo: Brindar soporte postventa y servicios de campo.
- Capacidades: dispatch, warranty, mobileChecklist
- Dependencias: CORE_AUTH, CLIENTS, PRODUCTS
- Feature Flags: fieldApp, slaAlerts
- Estado: Planificado

### Cuentas por Cobrar (AR)
- Objetivo: Acelerar recuperación de ingresos con visibilidad total.
- Capacidades: aging, creditLimits, collection
- Dependencias: CORE_AUTH, SALES, CLIENTS
- Feature Flags: dunning, promissoryNotes
- Estado: Planificado

### Cuentas por Pagar (AP)
- Objetivo: Optimizar pagos y descuentos por pronto pago.
- Capacidades: paymentSchedule, matching, cashflow
- Dependencias: CORE_AUTH, PURCHASE, SUPPLIERS
- Feature Flags: paymentBatches, earlyPayment
- Estado: Planificado

### Contabilidad (ACCOUNTING)
- Objetivo: Proveer información financiera integrada.
- Capacidades: ledger, financialStatements, fiscalReports
- Dependencias: CORE_AUTH, AR, AP, BANKS
- Feature Flags: multiGaap, consolidation
- Estado: Planificado

### Bancos (BANKS)
- Objetivo: Sincronizar movimientos bancarios y flujo de caja.
- Capacidades: bankFeeds, reconciliation, cashPosition
- Dependencias: CORE_AUTH
- Feature Flags: openBanking, cashPooling
- Estado: Planificado

### Reportes y BI (REPORTING_BI)
- Objetivo: Entregar información accionable a directivos y operativos.
- Capacidades: dashboards, exports, adHoc
- Dependencias: CORE_AUTH
- Feature Flags: embeddedBI, scheduledReports
- Estado: En progreso

### Auditoría y Logs (AUDIT_LOGS)
- Objetivo: Cumplir normativas y brindar trazabilidad completa.
- Capacidades: changeLog, securityAlerts, retention
- Dependencias: CORE_AUTH
- Feature Flags: siemIntegration, anomalyDetection
- Estado: En progreso

### Workflows (WORKFLOWS)
- Objetivo: Automatizar procesos críticos con reglas configurables.
- Capacidades: processDesigner, approvals, sla
- Dependencias: CORE_AUTH
- Feature Flags: bpmn, conditionalRouting
- Estado: Planificado

### Integraciones (INTEGRATIONS)
- Objetivo: Extender Ferrisys hacia ecosistemas ERP, eCommerce y SAT.
- Capacidades: apiGateway, webhooks, connectors
- Dependencias: CORE_AUTH, WORKFLOWS
- Feature Flags: edi, satFiscal
- Estado: Planificado

### Configuración (SETTINGS)
- Objetivo: Configurar reglas operativas y parametrizar módulos.
- Capacidades: featureFlags, branding, taxConfig
- Dependencias: CORE_AUTH, MASTER_DATA
- Feature Flags: darkMode, customDomains
- Estado: En progreso

## Matriz de dependencias

| Módulo | Depende de |
| --- | --- |
| CORE_AUTH | Ninguno |
| ORG_BRANCH | CORE_AUTH, MASTER_DATA |
| MASTER_DATA | CORE_AUTH |
| PRODUCTS | CORE_AUTH, MASTER_DATA |
| INVENTORY | CORE_AUTH, PRODUCTS, MASTER_DATA |
| DOCUMENTS | CORE_AUTH |
| NOTIFICATIONS | CORE_AUTH, WORKFLOWS |
| CLIENTS | CORE_AUTH, MASTER_DATA |
| SUPPLIERS | CORE_AUTH, MASTER_DATA |
| PRICING | CORE_AUTH, PRODUCTS |
| SALES | CORE_AUTH, CLIENTS, PRODUCTS, INVENTORY, PRICING |
| PURCHASE | CORE_AUTH, SUPPLIERS, PRODUCTS, INVENTORY |
| POS | CORE_AUTH, SALES, INVENTORY, PRICING |
| RETURNS | CORE_AUTH, SALES, INVENTORY |
| WMS | CORE_AUTH, INVENTORY |
| PRODUCTION | CORE_AUTH, PRODUCTS, INVENTORY |
| SERVICE_ORDERS | CORE_AUTH, CLIENTS, PRODUCTS |
| AR | CORE_AUTH, SALES, CLIENTS |
| AP | CORE_AUTH, PURCHASE, SUPPLIERS |
| ACCOUNTING | CORE_AUTH, AR, AP, BANKS |
| BANKS | CORE_AUTH |
| REPORTING_BI | CORE_AUTH |
| AUDIT_LOGS | CORE_AUTH |
| WORKFLOWS | CORE_AUTH |
| INTEGRATIONS | CORE_AUTH, WORKFLOWS |
| SETTINGS | CORE_AUTH, MASTER_DATA |

## Packs/licenciamiento sugeridos
- **Starter**: CORE_AUTH, CLIENTS, SUPPLIERS, PRODUCTS, INVENTORY, SALES, PURCHASE, REPORTING_BI
- **Retail**: Starter, POS, PRICING, RETURNS
- **Distribución**: Starter, WMS, WORKFLOWS
- **Manufactura**: Starter, PRODUCTION, WORKFLOWS
- **Finanzas**: Starter, AR, AP, BANKS, ACCOUNTING
- **Enterprise**: Todo, INTEGRATIONS, REPORTING_BI, AUDIT_LOGS

## Contrato de datos (JSON de ejemplo)
```json
{
  "customerId": "UUID",
  "branchId": "UUID",
  "documentType": "COTIZACION",
  "items": [
    {
      "sku": "SKU-001",
      "quantity": 10,
      "unitPrice": 120.5,
      "currency": "GTQ"
    }
  ],
  "totals": {
    "subtotal": 1205.0,
    "tax": 144.6,
    "grandTotal": 1349.6
  },
  "metadata": {
    "approvedBy": "UUID",
    "approvedAt": "2025-11-20T15:30:00Z"
  }
}
```

## Flujos degradados
- Cotizaciones operan sin PRICING avanzado aplicando lista base.
- Compras registran recepciones sin INVENTORY avanzado (movimientos simplificados).
- POS cae a captura manual si WORKFLOWS o NOTIFICATIONS están inactivos.

## Roadmap de futuras integraciones
- Conector SAT para facturación electrónica.
- Integración con ERPs contables (SAP Business One, Odoo).
- API para dispositivos IoT (básculas, sensores de peso).
- Marketplace B2B y sincronización con plataformas eCommerce.

## Tabla de sprints y entregables

| Sprint | Fecha inicio | Fecha fin | Entregables | % avance |
| --- | --- | --- | --- | --- |
| Sprint 1 | 20/10/2025 | 26/10/2025 | Setup base, CI/CD inicial, CORS global, JWT y semillas core. | 12% |
| Sprint 2 | 27/10/2025 | 02/11/2025 | Autenticación, roles, permisos dinámicos y sidebar según perfiles. | 24% |
| Sprint 3 | 03/11/2025 | 09/11/2025 | CRUD Clientes/Proveedores con validaciones, búsqueda y paginación. | 36% |
| Sprint 4 | 10/11/2025 | 16/11/2025 | Cotizaciones con flujo de aprobación degradado (sin PRICING avanzado). | 48% |
| Sprint 5 | 17/11/2025 | 23/11/2025 | Compras enlazadas a inventario, recepción y ajustes básicos. | 60% |
| Sprint 6 | 24/11/2025 | 30/11/2025 | Inventario con movimientos, lotes/series por feature flags. | 72% |
| Sprint 7 | 01/12/2025 | 07/12/2025 | Reportes, auditoría, exportaciones y BI básico. | 86% |
| Sprint 8 | 08/12/2025 | 14/12/2025 | Integraciones mínimas, settings avanzados y hardening final. | 98% |
| Buffer QA | 15/12/2025 | 20/12/2025 | QA final, hardening, release notes y go-live controlado. | 100% |