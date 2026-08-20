import { createContext } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: { email: string, password: string }) => Promise<any>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);