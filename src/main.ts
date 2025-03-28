import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppConfig } from "./app.config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { MESSAGES } from "./common/constants/messages.constant";
import { NotFoundExceptionFilter } from "./common/utils/exception-filter.util";

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

  app.useGlobalFilters(new NotFoundExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Record API")
    .setDescription("The record management API")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  app.use((err, _req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message || MESSAGES.ERROR.INTERNAL_SERVER,
    });
  });

  await app.listen(AppConfig.port);
}
bootstrap();
