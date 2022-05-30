import { Transform } from 'class-transformer';
import { IsEmail, IsUUID, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @MinLength(12, {
    message: 'Sua senha precisa de pelo menos 12 caracteres',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Sua senha precisa ter ao menos uma letra minuscula, uma letra maiuscula e um caracter especial',
  })
  password: string;

  @IsUUID(4, { message: 'Token para redefinição de senha expirado' })
  token: string;
}
