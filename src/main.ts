import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

(async () => {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: 'http://localhost:3333' });

  let port: number;
  try {
    port = parseInt(process.env.PORT);
  } catch (e) {
    port = 3000;
  }
  await app.listen(port);
})();
