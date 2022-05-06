import { Role } from '@prisma/client';

export enum RolesEnum {
  AUTHOR = <any>'Autor',
  ADMIN = <any>'Administrador',
}

export const Roles: Role[] = [
  { name: <string>(<any>RolesEnum.AUTHOR), id: RolesEnum[RolesEnum.AUTHOR] },
  { name: <string>(<any>RolesEnum.ADMIN), id: RolesEnum[RolesEnum.ADMIN] },
];
