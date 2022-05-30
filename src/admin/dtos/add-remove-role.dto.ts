import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum } from 'class-validator';

export class AddRemoveRoleDto {
  @IsEmail({}, { message: 'Digite um email válido' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsEnum(Role, { message: 'Permissão inválida' })
  role: Role;
}
