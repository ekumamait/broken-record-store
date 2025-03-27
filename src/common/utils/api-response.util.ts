import { HttpStatus } from "@nestjs/common";

export class ApiResponse<T> {
  success: boolean;
  statusCode: HttpStatus;
  message: string;
  data?: T;
  error?: any;

  private constructor(
    success: boolean,
    statusCode: HttpStatus,
    message: string,
    data?: T,
    error?: any,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(
    data: T,
    message = "Operation successful",
    statusCode = HttpStatus.OK,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, statusCode, message, data);
  }

  static created<T>(
    data: T,
    message = "Resource created successfully",
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, HttpStatus.CREATED, message, data);
  }

  static error<T>(
    message = "Operation failed",
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, statusCode, message, null, error);
  }

  static notFound<T>(
    message = "Resource not found",
    error?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      false,
      HttpStatus.NOT_FOUND,
      message,
      null,
      error,
    );
  }

  static badRequest<T>(message = "Bad request", error?: any): ApiResponse<T> {
    return new ApiResponse<T>(
      false,
      HttpStatus.BAD_REQUEST,
      message,
      null,
      error,
    );
  }
}
