import { z } from 'zod';
import { USER_ROLES } from '../constants/index.js';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial')
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const userCreateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  department: z.string().min(2, 'Departamento é obrigatório'),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.COORDENADOR, USER_ROLES.USUARIO]),
  temporaryPassword: z.string().min(6, 'Senha temporária deve ter no mínimo 6 caracteres')
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
