import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'Digite um email válido' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
