
import { useAuth } from "../hooks/useAuth"
import { Button } from "./ui/button"


type User = {
    name?: string
    email: string
}

export interface HeaderProps {
    user?: User
}

function Header({ user }: HeaderProps) {
    const { logout } = useAuth();

    return (
        <header className="w-full flex flex-row items-center justify-between bg-blue-50 p-2 px-4 border-b border-gray-400">
            <h2 className="text-2xl font-bold text-sky-600">Mintur</h2>
            <section className="flex flex-row justify-between gap-2 items-center">
                <p>Bienvenido,</p>
                <span>{user?.email}</span>
                <Button variant="destructive" onClick={logout} size="sm">Cerrar Sesión</Button>
            </section>
        </header>
    )
}

export default Header

