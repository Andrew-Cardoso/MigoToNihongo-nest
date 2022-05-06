import { BadRequestException, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { RolesEnum } from 'src/auth/constants/roles';
import { CurrentUser } from 'src/auth/types/current-user';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({ include: { roles: true } });
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

  async addRole(email: string, roleId: string) {
    const [user, role] = await this.getUserAndRole(email, roleId);

    if (user.roles.some(({ id }) => id === roleId))
      throw new BadRequestException(
        `${user.name} já é um ${RolesEnum[role.id]}`,
      );

    await this.prisma.user.update({
      data: { roles: { connect: { id: role.id } } },
      where: { id: user.id },
    });

    return role;
  }

  async removeRole(email: string, roleId: string, currentUser: CurrentUser) {
    if (email === currentUser.email && roleId === RolesEnum[RolesEnum.ADMIN])
      throw new BadRequestException(
        'Você não pode remover seu cargo de administrador',
      );

    const [user, role] = await this.getUserAndRole(email, roleId);

    if (user.roles.every(({ id }) => id !== role.id))
      throw new BadRequestException(
        `${user.name} não é um ${RolesEnum[role.id]}`,
      );

    await this.prisma.user.update({
      where: { email },
      data: { roles: { disconnect: { id: role.id } } },
    });

    return role;
  }

  private async getUserAndRole(
    email: string,
    roleId: string,
  ): Promise<[User & { roles: Role[] }, Role]> {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({
        where: { email },
        include: { roles: true },
      }),
      this.prisma.role.findFirst({ where: { id: roleId } }),
    ]);

    if (!user) throw new BadRequestException('Usuário não encontrado');
    if (!role) throw new BadRequestException('Cargo não encontrado');

    return [user, role];
  }
}
