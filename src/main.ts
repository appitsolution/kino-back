import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Налаштування CORS
  app.enableCors({
    origin: ['https://popcorn.kinoprokat.com', 'http://localhost:5173'],
  });
  const config = new DocumentBuilder()
    .setTitle('Kino')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('kino')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Enter your role in the following format: "Bearer {token} {role}"',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
