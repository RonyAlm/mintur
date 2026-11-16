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
- S7: Vista Ministerio — "Vista global" de supervisión. Encabezado: "Saludo personalizado", "Nombre del usuario", "Selector de período: últimos 7 días, 30 días, mes actual o personalizado", "Notificaciones". Indicadores: "Visitantes" (total), "Alojamientos activos" (habilitados), "Cargas registradas" (estadísticas diarias). Gráficos: "Evolución de visitantes", "Motivos del viaje", "Procedencia de visitantes", "Comparación entre períodos". Secciones: "Estado de carga" (registraron vs pendientes), "Últimos registros" (alojamiento, fecha, visitantes, estado). Acciones rápidas: "Ver alojamientos", "Consultar registros diarios", "Ver reportes", "Administrar organizaciones". Recomendación: "alertas de alojamientos que llevan varios días sin cargar estadísticas". Mantener "los modulos habilitados".

## Tasks

- [x] T1 (S1, S4, S5) route=inline — `types/dashboard.types.ts` + `utils/dashboard.utils.ts` (resolución de rol y métricas puras) + tests. commit=5a4d985
- [x] T2 (S4, S6) route=inline — Componentes compartidos: StatCard, DashboardHeader, DashboardFilters, WeeklyLoadStatus, RecentRecords. commit=5a4d985
- [x] T3 (S2, S3, S5) route=inline — Hooks: useMinistryDashboard, useOwnerDashboard, useOperatorDashboard. commit=d1c5472
- [x] T4 (S2, S3, S6) route=inline — Componentes de vista: MinistryDashboard, OwnerDashboard, OperatorDashboard. commit=d1c5472
- [x] T5 (S1) route=inline — `pages/DashboardPage.tsx`, cablear ruta en App.tsx, retirar Dashboard.tsx anterior. commit=1db50ef
- [x] T6 (S7) route=inline — Vista global Ministerio: períodos/rangos, `useMinistryDashboard` con resumen global + comparación + detalle por alojamiento, `MinistryPeriodFilters`, `NotificationsMenu`, `MinistryDashboard` (indicadores, 4 gráficos, estado de carga, últimos registros, alertas, acciones rápidas, módulos). commit=4b19fe6,0ccadd2
- [x] T7 (S7) route=inline — Endpoint backend global `GET /accommodation-statistics` (listar todos los registros diarios, solo system admin) y uso en el frontend reemplazando el N+1. commit=58fe4a3,e844502

## Log

- L1: "quiero mejorar el dashboard del frontend, cada usuarios tiene su su propio dashboard de inicio. ... (spec completa Owner/Admin, Operador, estructura de carpetas, shadcn)"
- L2 (verificación): `tsc -b` OK, `eslint src/modules/dashboard src/App.tsx` OK, `pnpm build` OK, tests de `dashboard.utils` 10/10 verdes. Fallas preexistentes en `accommodations` (4 timeouts) no relacionadas con este cambio.
- L3: "Ahora el usuario de sistema, quiero tenga los siguientes; Administrador del Ministerio — Vista global ..." (spec completa). Implementado frontend-only: el backend no expone serie diaria global ni listado de últimos registros, por lo que se combinan registros por alojamiento (`listByAccommodation` por cada alojamiento activo) con `Promise.allSettled`.
- L4 (verificación T6): `tsc -b` OK, `eslint` OK, `pnpm build` OK, tests `dashboard.utils` 18/18 verdes.
- L5: "si implementa ese enpoint en el backend" — Autorizado explícitamente tocar backend. Agregado `ListAllAccommodationStatisticsUseCase` + `GET /accommodation-statistics` (system admin). Frontend ahora usa `listAll` en `useMinistryDashboard` en una sola consulta, eliminando el N+1.
- L6 (verificación T7): backend `tsc -p tsconfig.build.json` OK, jest `accommodation-statistics` 6 suites/13 tests verdes. Frontend `tsc -b`, `eslint`, tests dashboard+api 20/20 verdes.


