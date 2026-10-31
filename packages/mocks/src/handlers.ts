import { authHandlers } from './authHandlers';
import { usersHandlers } from './usersHandlers';

export const handlers = [...authHandlers, ...usersHandlers];
