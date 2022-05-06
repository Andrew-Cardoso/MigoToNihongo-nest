import { Injectable } from '@nestjs/common';
import { RolesEnum } from 'src/auth/constants/roles';
import { CurrentUser } from 'src/auth/types/current-user';
import { getDateNow } from 'src/utils/functions/temporal';
import { uuid } from 'src/utils/functions/uuid-generator';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async getPosts() {
    return this.prisma.post.findMany({
      include: {
        author: true,
        comments: {
          where: { approved: { equals: true } },
          include: { author: true },
          orderBy: [{ jsDateTime: 'desc' }],
        },
      },
      orderBy: [
        {
          jsDateTime: 'desc',
        },
      ],
    });
  }

  async addComment(
    content: string,
    postId: string,
    { email, roles }: CurrentUser,
  ) {
    const approved = roles.some((role) =>
      [RolesEnum[RolesEnum.ADMIN], RolesEnum[RolesEnum.AUTHOR]].includes(
        role.id,
      ),
    );
    const comment = await this.prisma.comment.create({
      data: {
        id: uuid(),
        jsDateTime: new Date(),
        date: getDateNow().toString(),
        content,
        approved,
        post: { connect: { id: postId } },
        author: { connect: { email } },
      },
      include: {
        author: approved,
      },
    });

    return approved ? comment : { statusCode: 201 };
  }

  async createPost(
    { title, content, linkText }: CreatePostDto,
    author: CurrentUser,
  ) {
    return this.prisma.post.create({
      data: {
        id: uuid(),
        date: getDateNow().toString(),
        jsDateTime: new Date(),
        content,
        title,
        linkText: linkText ?? title,
        author: { connect: { email: author.email } },
      },
      include: { author: true, comments: true },
    });
  }
}

//@Redirect('https://nestjs.com', 301)
