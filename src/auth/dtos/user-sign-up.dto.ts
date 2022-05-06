import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class UserSignUpDto {
  @IsEmail()
  email: string;

  @MinLength(12, {
    message: 'Sua senha precisa de pelo menos 12 caracteres',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Sua senha precisa ter ao menos uma letra minuscula, uma letra maiuscula e um caracter especial',
  })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  photo: string;
}
