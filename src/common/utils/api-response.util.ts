import { HttpStatus } from "@nestjs/common";

export class ApiResponse<T> {
  status: HttpStatus;
  message: string;
  data?: T;
  error?: any;

  private constructor(
    status: HttpStatus,
    message: string,
    data?: T,
    error?: any,
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(
    data: T,
    message = "Operation successful",
    status = HttpStatus.OK,
  ): ApiResponse<T> {
    return new ApiResponse<T>(status, message, data);
  }

  static created<T>(
    data: T,
    message = "Resource created successfully",
  ): ApiResponse<T> {
    return new ApiResponse<T>(HttpStatus.CREATED, message, data);
  }

  static error<T>(
    message = "Operation failed",
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>(status, message, null, error);
  }

  static notFound<T>(
    message = "Resource not found",
    error?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>(HttpStatus.NOT_FOUND, message, null, error);
  }

  static badRequest<T>(message = "Bad request", error?: any): ApiResponse<T> {
    return new ApiResponse<T>(HttpStatus.BAD_REQUEST, message, null, error);
  }
}
