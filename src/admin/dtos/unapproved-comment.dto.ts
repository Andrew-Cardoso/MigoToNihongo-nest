import { Expose, Transform } from 'class-transformer';
import { AuthorDto } from 'src/posts/dtos/author.dto';

export class UnapprovedCommentDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  date: string;

  @Expose()
  author: AuthorDto;

  @Expose()
  approved: boolean;

  @Expose()
  @Transform(({ obj }) => obj.post?.title)
  postName: string;
}
