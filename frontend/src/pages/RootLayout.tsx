import { Outlet } from "react-router"
// import Header from "../components/Header"
// import {  SidebarTrigger } from "../components/ui/sidebar"
import DashboardLayout from "./dashboard/DashboardLayout"
// import Header from "../components/Header"
// import type { User } from "@domain/entities"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface Props {
    user?:  User
}

const RootLayout = ({ user }: Props ) => {
    return (
        <DashboardLayout>
             
             {/* <Header user={user!} /> */}
            <main>
                <Outlet />
            </main>
            { /*/<footer>Footer</footer> */}
        </DashboardLayout>
    )
}

export default RootLayout