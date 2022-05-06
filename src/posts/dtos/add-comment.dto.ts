import { IsNotEmpty, MaxLength } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty({ message: 'Seu comentario nao pode estar vazio' })
  @MaxLength(455, {
    message: 'Seu comentario nao pode ter mais de 455 caracteres',
  })
  content: string;
}
