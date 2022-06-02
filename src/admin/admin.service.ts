import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/types/current-user';
import { getRoleViewName } from 'src/utils/functions/role';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        accountVerified: true,
        email: true,
        name: true,
        photo: true,
        roles: true,
        signInType: true,
      },
    });
  }
  async getComments() {
    return this.prisma.comment.findMany({
      where: { approved: { equals: false } },
      include: { author: true, post: { select: { title: true } } },
      orderBy: [{ jsDateTime: 'asc' }],
    });
  }
  async approveComment(id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { approved: true },
      include: {
        author: true,
      },
    });
  }
  async deleteComment(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return null;
  }

  async addRole(email: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        roles: true,
        name: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.roles.includes(role))
      throw new BadRequestException(
        `${user.name} já é um ${getRoleViewName(role)}`,
      );

    const roles = [...user.roles, role];
    await this.prisma.user.update({ where: { email }, data: { roles } });

    return roles;
  }

  async removeRole(email: string, role: Role, currentUser: CurrentUser) {
    if (email === currentUser.email && role === Role.ADMIN)
      throw new BadRequestException(
        'Você não pode remover seu cargo de administrador',
      );

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        roles: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (!user.roles.includes(role))
      throw new BadRequestException(
        `${user.name} não é um ${getRoleViewName(role)}`,
      );

    const roles = user.roles.filter((userRole) => userRole !== role);

    await this.prisma.user.update({
      where: { email },
      data: { roles },
    });

    return roles;
  }
}
