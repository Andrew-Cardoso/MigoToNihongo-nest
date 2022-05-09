import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { generateHashAndSalt } from 'src/auth/utils/crypto';
import { uuid } from 'src/utils/functions/uuid-generator';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    if (await this.user.count()) return;

    const { passwordHash, passwordSalt } = await generateHashAndSalt(
      process.env.ADMIN_PASS,
    );

    const admin: User = {
      id: uuid() + uuid(),
      accountVerified: true,
      email: process.env.ADMIN_USER,
      name: 'Admin',
      passwordHash,
      passwordSalt,
      photo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEBklEQVR4nNXby2tdVRQG8F/DNUgpl9JBUFEpoQSRDkQEa9EiDoJIKVJEpIgDkeLAgYKIAyeOijhw5B/gxFpUpCCoiIg6sBS02iK+2voINYraaLWNMU2ug53Qa0jOyT1n7Z30g0W49+asx3fOfq21zgblcAP24FaMooOf8BXex9v4p6A/xbAdb2EOvQqZxH4MrY2bebAf06oDXyov4kpswXB5l+PwuMEC75fZhb/n8Q7uLOt6e9yt/pEfRObwdNEIWqCLCXHB98u9BeNojGflCb6HH6T5Yd1iI36Xj4AeHikWTQM8JG/wPXxQLJoGOCw/AdPSk7bu0MGU/AT0cHOU05G7rm3YHKivzlYIIgkYC9RVh6uiFEUSEObUKtCNUhRJwKZAXXW4IkpRJAH/Buqqw1yUokgCzgbqqsO5KEWRBJwO1FWHn6MURRJwXLmMzjeF7AyM9+TfBM0K3AlGPgFdbA3UtxI61ulGaIeU7CyBXVGKop+AUrg6SlEkARcCddUhzO9IAk4G6qrDZEFbq8aQlLIqcRy+KdLpKMzj5UB9K+EoPitgpxGulXL5ue78nMAVIBf2YUYeAg4UjKMVbhdbGOnhDZdZ3TByWzyH63M4mZPRg4G6PsSPgfqKoIs/xTwBewv7HoYD2gd/zGU29vuxGWe0I+Cu4l4HY4/mwUfOI2uKVw0e/Hlck9uxUmPrRINr3pSaqLKiFAG3NbimZJY5K3Zrtiv8VabNTylswzMG7xLrlzN4Smq1W/dLYRf34yV58gK/4BAexkihmGoxJHWEHZL3GLxUZqX2uQesUc9QR+rV+XIVzuaWxWFSrDi7F98GOT8lrqtkUrop2eaKEelMHuHsDJ6XtspdPOdSd2hb+UiG+sQt4pofJxf0LcW4uHlkSpqbQrALfwU51sM9FbYeC7Qzg/vaBr9d3Jl+UU5Yvvl5HKeCbc1gZ9Pgh/FFsEP9clBawjbi9Yx2TqlYKqtmzH24sYakNhiT+gkuyNtgNSp1sA6M3F2f/eNzd2Zb7zYh4FhGhyakzdQiOvKW1b5eKciqIZCzH/cVXOz7fBGvZbS34qs3VQR0Kn5ri8Or/C47qgiYz2TzHI4s8/0RZXsMUE1ArsbHo/7/+Pfb+zSTzeXsoZqAPzI4QnVpO1fZe8UexioCco3JFWfkmt+a4jSeaHLhsLjTX7+MV9hsU0NYKtN4QcvmrQ6eFHseqHrbY2eA/u+kN9dCawpbJCI+177u/6jl70oHDzbQN4tPpDrkDgMmRDYM8s8L2CrV6+6Q7uaYwfNy8/jbpWWvI2286jZf81Kx5Li0YnwsLZ+NawhNCFiKYYmUUSmPf52UPRqRMj6bFmQ1JC0Scxa/SV3hE/hemsxOCl6d/gPYMy2YzWXCIAAAAABJRU5ErkJggg==`,
      signInType: 'LOCAL',
      roles: ['ADMIN'],
    };

    await this.user.create({ data: admin });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
