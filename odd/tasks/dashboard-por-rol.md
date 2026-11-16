# Dashboard por rol

Objetivo: un único punto de entrada para el dashboard que separa la vista según el rol del usuario (Ministerio, Owner/Admin, Operador), respetando la arquitectura actual y reutilizando el contrato de la API de estadísticas existente.
Rama: feat/dashboard-por-rol
Estrategia de entrega: ask-on-risk
Test runner: `pnpm test` (vitest), `pnpm build`, `pnpm lint`

## Specs

- S1: "Mantené un único punto de entrada para el dashboard y separaría las vistas por rol." — `DashboardPage` resuelve el rol y renderiza una sola vista.
- S2: Vista Owner/Admin — "Vista del establecimiento". Encabezado: "Saludo personalizado", "Nombre del alojamiento", "Selector de período". Indicadores: "Visitantes" (total del período), "Días con carga" (cantidad de días registrados). Gráficos: "Visitantes por semana", "Distribución por motivo del viaje", "Evolución diaria de huspedes". "Estado de carga semanal" con tres estados: "Verde: estadística cargada", "Gris: pendiente", "Azul: día actual". Acciones rápidas: "Nueva carga diaria", "Mis registros", "Reportes", "Administrar miembros, si tiene los permisos correspondientes".
- S3: Vista Operador — "Vista operativa" más sencilla. Encabezado: "Saludo personalizado", "Nombre del alojamiento", "Fecha actual". Indicadores: "Días con carga en el mes", "Visitantes registrados en el mes", "Lugares de origenes en el mes (Provincias o Paises)". "Estado de carga semanal": "los siete días de la semana".
- S4: Organización de carpetas: `src/modules/dashboard/` con `pages/DashboardPage.tsx`, `components/` (MinistryDashboard, OwnerDashboard, OperatorDashboard, DashboardHeader, DashboardFilters, StatCard, WeeklyLoadStatus, RecentRecords), `hooks/` (useMinistryDashboard, useOwnerDashboard, useOperatorDashboard), `types/dashboard.types.ts`.
- S5: "Quiero que respete la arquitectura y la organizacion del codigo, adapta el contrato del backend api, no modifique el backend solo el fronend." — Sin cambios en backend; reutiliza `accommodation-statistics` API y hooks existentes.
- S6: "Utiliza los componentes shadcn." — Usar `@/components/ui/*`.

## Tasks

- T1 (S1, S4, S5) route=inline — `types/dashboard.types.ts` + `utils/dashboard.utils.ts` (resolución de rol y métricas puras) + tests. commit=—
- T2 (S4, S6) route=inline — Componentes compartidos: StatCard, DashboardHeader, DashboardFilters, WeeklyLoadStatus, RecentRecords. commit=—
- T3 (S2, S3, S5) route=inline — Hooks: useMinistryDashboard, useOwnerDashboard, useOperatorDashboard. commit=—
- T4 (S2, S3, S6) route=inline — Componentes de vista: MinistryDashboard, OwnerDashboard, OperatorDashboard. commit=—
- T5 (S1) route=inline — `pages/DashboardPage.tsx`, cablear ruta en App.tsx, retirar Dashboard.tsx anterior. commit=—

## Log

- L1: "quiero mejorar el dashboard del frontend, cada usuarios tiene su su propio dashboard de inicio. ... (spec completa Owner/Admin, Operador, estructura de carpetas, shadcn)"
