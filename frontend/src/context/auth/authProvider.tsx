import { useEffect, useState } from "react"
import { AuthContext, type User } from "./authContext"
import loginService from "../../services/auth.service"
type Props = {
    children?: React.ReactNode
}
const AuthProvider = ({children} : Props) => {
    const [ user, setUser ] = useState<User | null>(
        JSON.parse(localStorage.getItem('user') || 'null')
    )

    const login = async (credentials: { email: string, password: string }) => {
        const { email, password } = credentials

        const response = await loginService.login({ email, password })

        if (response.email) {
            setUser(response)
            localStorage.setItem('user', JSON.stringify(response))            
            return response
        }

        return response
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
    }, [])

    // useEffect(() => {
    //     const userStored = localStorage.getItem('user')
    //     if (userStored) {
    //         setUser(JSON.parse(userStored))
    //     } else {
    //         setUser(null)
    //     }
    // }, [])

    return (
        <AuthContext.Provider 
            value={ { user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider