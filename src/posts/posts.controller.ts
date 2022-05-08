import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/decorators/get-user.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CurrentUser } from 'src/auth/types/current-user';
import { MapTo } from 'src/interceptors/map-to';
import { AddCommentDto } from './dtos/add-comment.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostDto } from './dtos/post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @MapTo(PostDto)
  @Get()
  async getPosts() {
    return await this.postsService.getPosts();
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard('AUTHOR'))
  @MapTo(PostDto)
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @User() currentUser: CurrentUser,
  ) {
    return await this.postsService.createPost(createPostDto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:postId/add-comment')
  async addComment(
    @Param('postId') postId: string,
    @Body() { content }: AddCommentDto,
    @User() currentUser: CurrentUser,
  ) {
    return await this.postsService.addComment(content, postId, currentUser);
  }
}
