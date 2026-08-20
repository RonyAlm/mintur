import { Outlet } from "react-router"

const AuthLayout = () => {
    return (
        <div className="h-screen bg-slate-800 w-full flex items-center justify-center">
            <Outlet />
        </div>
    )
}

export default AuthLayout