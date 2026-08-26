import { Outlet } from "react-router"
import { SidebarTrigger, SidebarProvider, SidebarInset } from "../components/ui/sidebar"
import { AppSidebar } from "../components/AppSidebar"
import { DropdownMenuUser } from "../components/DropdownMenuUser"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface Props {
    user?: User
}

const RootLayout = ({ user }: Props) => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />

                    <h1 className="font-semibold">
                        {user?.email}
                    </h1>

                    <div className="flex flex-1" />
                    
                    <DropdownMenuUser />
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default RootLayout