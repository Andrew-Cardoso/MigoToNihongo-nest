import { Expose } from 'class-transformer';
import { RoleDto } from './role.dto';

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
  roles: RoleDto;
}
