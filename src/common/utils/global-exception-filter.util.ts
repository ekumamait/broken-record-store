import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { MESSAGES } from "../constants/messages.constant";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : MESSAGES.ERROR.INTERNAL_SERVER;

    if (response.headersSent) {
      return;
    }

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
