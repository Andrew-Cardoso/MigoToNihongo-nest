import { Expose } from 'class-transformer';
import { AuthorDto } from './author.dto';
import { CommentDto } from './comment.dto';

export class PostDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  linkText: string;

  @Expose()
  date: string;

  @Expose()
  author: AuthorDto;

  @Expose()
  comments: CommentDto;
}
