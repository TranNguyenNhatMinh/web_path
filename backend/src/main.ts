import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cookieParserFn = cookieParser as unknown as () => RequestHandler;
  app.use(cookieParserFn());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: true, // cho phép mọi origin (dev: để máy khác truy cập API)
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
