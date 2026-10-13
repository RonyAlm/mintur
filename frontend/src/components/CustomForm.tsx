import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import InputForm from "./ui/InputForm";
import { customFormSchema, type FormValues } from "../models/form.model";

const CustomForm = () => {
    const { control, handleSubmit, reset } = useForm<FormValues>({
       resolver: zodResolver(customFormSchema), 
       defaultValues: { 
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
       }
    })
    
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Data del formulario", data)
        
        // Resetear el formulario
        reset()
    }
    


    return (
        <form className="flex flex-col gap-2 text-foreground" onSubmit={handleSubmit(onSubmit)}>
            <InputForm name="name" control={control} placeholder="Name" label="Name"/>
            <InputForm name="email" control={control} placeholder="Email" label="Email"/>
            <InputForm name="password" control={control} placeholder="Password" label="Password"/>
            <InputForm name="confirmPassword" control={control} placeholder="Confirm Password" label="Confirm Password"/>
            <Button className="rounded border border-border p-2" type="submit">Create</Button>
        </form>
    )
}

export default CustomForm
