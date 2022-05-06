import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class VerificationDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUUID(4)
  token: string;
}
