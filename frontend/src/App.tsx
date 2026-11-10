
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";

import RootLayout from "@/components/layout/RootLayout";
import { ProtectedRoute } from "@/modules/auth/components/protected-route";
import { PermissionRoute } from "@/modules/auth/components/permission-route";

// Code splitting por ruta.
const AuthLayout = lazy(() => import("@/modules/auth/pages/AuthLayout"));
const Login = lazy(() => import("@/modules/auth/pages/Login"));
const Dashboard = lazy(() => import("@/modules/dashboard/pages/Dashboard"));
const Profile = lazy(() => import("@/modules/profile/pages/Profile"));
const ProfileAccount = lazy(() => import("@/modules/profile/pages/ProfileAccount"));
const ProfilePassword = lazy(() => import("@/modules/profile/pages/ProfilePassword"));
const UsersPage = lazy(() => import("@/modules/users/pages/UsersPage"));
const RolesPage = lazy(() => import("@/modules/roles/pages/RolesPage"));
const MyOrganizationsPage = lazy(() => import("@/modules/organizations/pages/MyOrganizationsPage"));
const AccommodationsPage = lazy(() => import("@/modules/accommodations/pages/AccommodationsPage"));
const AccommodationDetailPage = lazy(() => import("@/modules/accommodations/pages/AccommodationDetailPage"));
const AccommodationStatisticsPage = lazy(() => import("@/modules/accommodations/pages/AccommodationStatisticsPage"));
const OrganizationStatisticsPage = lazy(() => import("@/modules/accommodations/pages/OrganizationStatisticsPage"));
const AccommodationDailyStatisticDetailPage = lazy(() => import("@/modules/accommodations/pages/AccommodationDailyStatisticDetailPage"));
const NotFound = lazy(() => import("@/modules/system/pages/NotFound"));
const Forbidden = lazy(() => import("@/modules/system/pages/Forbidden"));


const RouteFallback = () => (
  <div
    className="flex min-h-screen items-center justify-center gap-3 bg-background"
    role="status"
    aria-label="Cargando"
  >
    <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <span className="text-sm text-muted-foreground">
      Cargando página...
    </span>
  </div>
)

function App() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>

          {/* Rutas que requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route index element={<Dashboard />} />

              {/* Organizaciones propias; la API entrega solo las membresías del usuario autenticado. */}
              <Route path="mis-organizaciones" element={<MyOrganizationsPage />} />

              <Route
                path="dashboard"
                element={<Navigate to="/" replace />}
              />

              <Route element={<PermissionRoute permission="accommodation-statistics:read" />}>
                <Route path="reportes" element={<Navigate to="/estadisticas/reportes" replace />} />
                <Route path="estadisticas/carga-diaria" element={<OrganizationStatisticsPage view="entry" />} />
                <Route path="estadisticas/registros" element={<OrganizationStatisticsPage view="records" />} />
                <Route path="estadisticas/registros/:recordId" element={<AccommodationDailyStatisticDetailPage />} />
                {/* Legacy URLs remain available for existing bookmarks. */}
                <Route path="estadisticas/mis-registros" element={<OrganizationStatisticsPage view="records" />} />
                <Route path="estadisticas/mis-registros/:recordId" element={<AccommodationDailyStatisticDetailPage />} />
                <Route path="estadisticas/reportes" element={<OrganizationStatisticsPage view="reports" />} />
              </Route>

              {/* Perfil del usuario autenticado */}
              <Route path="perfil" element={<Profile />}>
                <Route index element={<ProfileAccount />} />
                <Route path="cambiar-password" element={<ProfilePassword />} />
              </Route>

              {/* Administración de usuarios */}
              <Route element={<PermissionRoute permission="users:read" />}>
                <Route path="usuarios" element={<UsersPage />} />
              </Route>

              {/* Administración de roles y permisos */}
              <Route element={<PermissionRoute permission="roles:read" />}>
                <Route path="roles" element={<RolesPage />} />
              </Route>

              {/* Administración de alojamientos */}
              <Route element={<PermissionRoute permission="accommodations:read" />}>
                <Route path="alojamientos" element={<AccommodationsPage />} />
                <Route path="alojamientos/:id" element={<AccommodationDetailPage />} />
                <Route element={<PermissionRoute permission="accommodation-statistics:read" />}>
                  <Route path="alojamientos/:id/estadisticas" element={<AccommodationStatisticsPage />} />
                </Route>
              </Route>

              {/* Acceso denegado: no requiere el permiso faltante */}
              <Route path="403" element={<Forbidden />} />
            </Route>
          </Route>

          {/* Ruta no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
