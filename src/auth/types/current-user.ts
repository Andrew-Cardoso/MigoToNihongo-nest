import { Role } from '@prisma/client';

export interface CurrentUser {
  email: string;
  name: string;
  photo: string;
  roles: Role[];
}
