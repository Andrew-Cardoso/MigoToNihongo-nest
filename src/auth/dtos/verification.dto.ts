import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class VerificationDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsUUID(4)
  token: string;
}
