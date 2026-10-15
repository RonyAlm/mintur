
import { z } from 'zod';
import { api } from '@/lib/axios';
import { userSchema } from '@/models/user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * `POST /auth/login`. `mustChangePassword` marca contraseña temporal:
 * el backend lo limpia al confirmar `PATCH /auth/change-password`.
 */
const loginResponseSchema = z.object({
  email: z.string().catch(""),
  mustChangePassword: z.boolean().catch(false),
}).strict();

export type LoginResponse = z.infer<typeof loginResponseSchema>

const changePasswordResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string().catch(""),
})

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  permissions: string[];
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    const { data } = await api.post(
      '/auth/login',
      credentials,
    );
    const parsed = loginResponseSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error("No se pudo interpretar la respuesta del servidor.")
    }

    return parsed.data
  },

  async getProfile() {
    const { data } = await api.get<AuthUser>('/auth/profile');
    const parsed = userSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error("No se pudo interpretar la información del perfil.")
    }

    return parsed.data
  },

  async logout() {
    await api.post('/auth/logout');
  },


  async changePassword(input: ChangePasswordInput): Promise<void> {
    const { data } = await api.patch("/auth/change-password", input)

    const parsed = changePasswordResponseSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error("No se pudo interpretar la respuesta del servidor.")
    }

    if (!parsed.data.isSuccess) {
      throw new Error(parsed.data.message || "No se pudo cambiar la contraseña.")
    }
  }
};
