
import { useAuth } from "@/modules/auth/hooks/useAuth"
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
        <header className="flex w-full flex-row items-center justify-between border-b border-border bg-background p-2 px-4">
            <h2 className="text-2xl font-bold text-foreground">Mintur</h2>
            <section className="flex flex-row justify-between gap-2 items-center">
                <p>Bienvenido,</p>
                <span>{user?.email}</span>
                <Button variant="destructive" onClick={logout} size="sm">Cerrar Sesión</Button>
            </section>
        </header>
    )
}

export default Header

