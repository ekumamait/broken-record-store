import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './app.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Record API')
    .setDescription('The record management API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Error handling middleware
  app.use((err, _req, res, _next) => {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: err?.message,
      success: false,
    });
  });

  // wrong route
  // app.use((req, res) =>
  //   res.status(405).send({
  //     status: 405,
  //     error: 'NO_URL_FOUND',
  //   })
  // );

  await app.listen(AppConfig.port);
}
bootstrap();
