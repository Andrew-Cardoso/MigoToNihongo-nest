import { Expose } from 'class-transformer';

export class AuthorDto {
  @Expose()
  name: string;

  @Expose()
  photo: string;
}
