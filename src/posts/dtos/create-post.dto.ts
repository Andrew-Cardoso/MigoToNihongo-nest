import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'O titulo do Post e obrigatorio' })
  title: string;

  @IsNotEmpty({ message: 'O conteudo do Post e obrigatorio' })
  content: string;

  @IsOptional()
  linkText: string;
}
