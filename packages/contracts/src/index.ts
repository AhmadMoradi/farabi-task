import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'member']);
export type Role = z.infer<typeof RoleSchema>;

export const UserStatusSchema = z.enum(['active', 'suspended']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email'),
  role: RoleSchema,
  status: UserStatusSchema,
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UpdateUserInputSchema = UserSchema.pick({
  name: true,
  email: true,
  role: true,
  status: true,
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export const UpdateProfileInputSchema = UserSchema.pick({
  name: true,
  email: true,
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export interface Session {
  token: string;
  user: User;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = 'error') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
