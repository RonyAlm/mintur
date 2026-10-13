import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import RootLayout from "./pages/RootLayout"
import { ProtectedRoute } from "./pages/ProtectedRoute"
import { RequireModule } from "./pages/RequireModule"
import { APP_MODULES } from "./lib/modules"

// Code splitting por ruta: el bundle inicial solo carga shell + login.
const AuthLayout = lazy(() => import("./pages/auth/AuthLayout"))
const Login = lazy(() => import("./pages/auth/Login"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const ModuleSoon = lazy(() => import("./pages/ModuleSoon"))
const Profile = lazy(() => import("./pages/perfil/Profile"))
const ProfileAccount = lazy(() => import("./pages/perfil/ProfileAccount"))
const ProfilePassword = lazy(() => import("./pages/perfil/ProfilePassword"))
const UsersPage = lazy(() => import("./pages/users/UsersPage"))
const RolesPage = lazy(() => import("./pages/access/RolesPage"))

const RouteFallback = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-background"
    role="status"
    aria-label="Cargando"
  >
    <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
)

function App() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route index element={<Dashboard />} />
              {/* Enlaces legacy al path /dashboard */}
              <Route path="dashboard" element={<Navigate to="/" replace />} />
              <Route path="perfil" element={<Profile />}>
                <Route index element={<ProfileAccount />} />
                <Route path="contrasena" element={<ProfilePassword />} />
              </Route>
              {/* Módulos por permisos del perfil: sin acceso, responde 404. */}
              <Route path="permisos" element={<Navigate to="/roles?tab=permissions" replace />} />
              {APP_MODULES.map((module) => (
                <Route
                  key={module.id}
                  // `APP_MODULES.path` es absoluto ("/usuarios"): el path del
                  // route va relativo porque cuelga de un layout sin path.
                  path={module.path.replace(/^\//, "")}
                  element={
                    <RequireModule moduleId={module.id}>
                      {module.id === "usuarios" ? <UsersPage /> : module.id === "roles" ? <RolesPage /> : <ModuleSoon
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                      />}
                    </RequireModule>
                  }
                />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
