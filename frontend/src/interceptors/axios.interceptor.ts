import axios, { type InternalAxiosRequestConfig } from "axios"
import { api } from "../services/api";

export const AxiosInterceptor = () => {

    const updateHeader = (request: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token")
        if(!token) return request
        request.headers = new axios.AxiosHeaders(request.headers)
        request.headers.set("Authorization", `Bearer ${token}`)
        return request
    };

    api.interceptors.request.use((request: InternalAxiosRequestConfig) => {
        console.log("Desde el interceptor ", request);
        return updateHeader(request);
    });

    api.interceptors.response.use(
    (response) => {
        console.log("Response ", response);
        return response;
    },
    (error) => {
        console.log("Error ", error);
        return Promise.reject(error);
    }
);
}