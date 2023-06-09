import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSignInDto {
  @IsEmail({}, { message: 'Digite um email válido' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Digite sua senha' })
  password: string;
}
