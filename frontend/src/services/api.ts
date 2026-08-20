import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptors

api.interceptors.request.use(
    (config) => {
        console.log("Desde el interceptor ", config);
        return config;

    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("Desde el interceptor response ", response);
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);