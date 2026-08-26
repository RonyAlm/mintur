import { useState } from "react"
import { AuthContext, type User } from "./authContext"
import loginService from "../../services/auth.service"
type Props = {
    children?: React.ReactNode
}
const AuthProvider = ({children} : Props) => {
    const [ user, setUser ] = useState<User | null>(
        JSON.parse(localStorage.getItem('user') || 'null')
    )
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState('')

    const login = async (credentials: { email: string, password: string }) => {
        const { email, password } = credentials
        
        setLoading(true)
        const response = await loginService.login({ email, password })
        setLoading(false)
        if (response.email) {
            setUser(response)
            localStorage.setItem('user', JSON.stringify(response))            
            localStorage.setItem('token', response.accessToken)
            return response
        } 

        if (response.error === 'Unauthorized') {
            setError("Email o contraseña incorrectos") 
            setTimeout(() => setError(''), 5000)
        }

        setUser(null)
        localStorage.removeItem('user')
       
        
        return response
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

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
            value={ { user, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider