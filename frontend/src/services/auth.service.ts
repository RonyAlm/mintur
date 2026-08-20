import type { AxiosError } from "axios";
import { api } from "./api";

const login = async (credentials: { email: string, password: string }) => {
    try {
        const response = await api.post('/auth/login', credentials, { signal: new AbortController().signal })
        return response.data
    } catch (error) {
        const err = error as AxiosError<{ error: string }>
        return { isSuccess: false, error: err.response?.data.error || err.message }
    }
}

export default {
    login
}