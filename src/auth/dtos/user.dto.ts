import { Role } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  accountVerified: boolean;

  @Expose()
  photo: string;

  @Expose()
  roles: Role;
}
