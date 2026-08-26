
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import logo from "/img/M-Turismo-negro.png"
import { useAuth } from "../hooks/useAuth"
import { formLoginSchema, type FormLoginValues } from "../models/form.model"
import { useForm, type SubmitHandler } from "react-hook-form"
import InputForm from "./ui/InputForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"

const LoginForm = () => {
  const { login, error, loading } = useAuth()
  const { control, handleSubmit, reset } = useForm<FormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const navigate = useNavigate()

  const onSubmit: SubmitHandler<FormLoginValues> = async (data, event) => {
    event?.preventDefault()
  
    const loginResponse = await login(data)
    if(loginResponse.email) {
      reset()
      navigate("/dashboard")
    }
  }

  return (
     <Card className="w-full max-w-sm py-4  bg-green-50 text-green-950">
        <CardHeader className="w-full flex flex-col items-center justify-center">
          <div className="flex justify-center w-full my-8">
            <img
              className="w-40"
              src={logo}
              alt="Login"
            />
          </div>
          <CardTitle className="text-center">Inicia Sesión con tu cuenta</CardTitle>
          <CardDescription className="text-green-950/80">
            Ingresa con tu correo y contraseña             
          </CardDescription>
          {/* <CardAction>
            <Button variant="link">Sign Up</Button>
          </CardAction> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}
             className="flex flex-col gap-6">
            
              <InputForm name="email" control={control} placeholder="Email" label="Email"/>
              <InputForm type="password" name="password" control={control} placeholder="Password" label="Password"/>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-750 active:bg-green-900 cursor-pointer">
                {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </Button>
              
              {error && <p className="text-sm text-center text-red-500">{error}</p>}
            
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="flex items-center">
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
          </div>
        </CardFooter>
        
      </Card>
  )
}

export default LoginForm