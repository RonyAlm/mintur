import { Outlet } from "react-router"

const AuthLayout = () => {
    return (
        <div className="h-screen bg-linear-to-tr from-green-400 to-green-600 w-full flex items-center justify-center">
            <Outlet />
        </div>
    )
}

export default AuthLayout