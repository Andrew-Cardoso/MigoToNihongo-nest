import { Role } from '@prisma/client';

export const getRoleViewName = (role: Role) =>
  role === 'ADMIN' ? 'Administrador' : 'Autor';
