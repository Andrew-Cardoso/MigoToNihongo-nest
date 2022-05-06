import { Expose } from 'class-transformer';
import { AuthorDto } from './author.dto';

export class CommentDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  postId: string;

  @Expose()
  date: string;

  @Expose()
  author: AuthorDto;
}
