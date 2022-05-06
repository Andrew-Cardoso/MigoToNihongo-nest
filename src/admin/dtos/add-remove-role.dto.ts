import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddRemoveRoleDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
