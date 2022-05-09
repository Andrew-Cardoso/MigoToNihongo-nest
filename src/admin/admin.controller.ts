import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/decorators/get-user.decorator';
import { UserDto } from 'src/auth/dtos/user.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CurrentUser } from 'src/auth/types/current-user';
import { MapTo } from 'src/interceptors/map-to';
import { CommentDto } from 'src/posts/dtos/comment.dto';
import { AdminService } from './admin.service';
import { AddRemoveRoleDto } from './dtos/add-remove-role.dto';
import { UnapprovedCommentDto } from './dtos/unapproved-comment.dto';

@UseGuards(AuthGuard('jwt'), RoleGuard('ADMIN'))
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @MapTo(UserDto)
  @Get('/users')
  async getUsers() {
    return await this.adminService.getUsers();
  }

  @MapTo(UnapprovedCommentDto)
  @Get('/comments')
  async getComments() {
    return await this.adminService.getComments();
  }

  @MapTo(CommentDto)
  @Patch('/comments/:id')
  async approveComment(@Param('id') id: string) {
    return await this.adminService.approveComment(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/comments/:id')
  async deleteComment(@Param('id') id: string) {
    return await this.adminService.deleteComment(id);
  }

  @Patch('/add-role')
  async addRole(@Body() { email, role }: AddRemoveRoleDto) {
    return this.adminService.addRole(email, role);
  }

  @Patch('/remove-role')
  async removeRole(
    @User() currentUser: CurrentUser,
    @Body() { email, role }: AddRemoveRoleDto,
  ) {
    return this.adminService.removeRole(email, role, currentUser);
  }
}
