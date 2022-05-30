import { IsOptional } from 'class-validator';

export class EmailTokenDto {
  @IsOptional()
  email: string;

  @IsOptional()
  token: string;
}
