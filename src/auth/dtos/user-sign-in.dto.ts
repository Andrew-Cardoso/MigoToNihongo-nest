import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSignInDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
