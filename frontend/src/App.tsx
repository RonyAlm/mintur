import { Routes, Route } from "react-router"
import { useAuth } from "./hooks/useAuth"
import RootLayout from "./pages/RootLayout"
import { ProtectedRoute } from "./pages/ProtectedRoute"
import Login from "./pages/auth/Login"
import AuthLayout from "./pages/auth/AuthLayout"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/dashboard/Dashboard"

function App() {

  const { user } = useAuth()

  return (
    <div className="h-screen w-full">
      <Routes>
        
        <Route path="auth" element={<AuthLayout />}>
          <Route index path="login" element={<Login />} />
          {/* <Route path="register" element={<Register />} /> */}
        </Route>

        
        <Route element={<ProtectedRoute />}>
          <Route element={<RootLayout user={user!} />}>
            <Route path="/" element={<div>Home</div>} />
            <Route index path="dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

    </div>
  )
  
}

export default App
