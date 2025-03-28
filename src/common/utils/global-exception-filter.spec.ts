import { GlobalExceptionFilter } from "./global-exception-filter.util";
import { HttpException, HttpStatus } from "@nestjs/common";
import { MESSAGES } from "../constants/messages.constant";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockContext: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    mockRequest = {
      url: "/test-url",
    };
    mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it("should handle HttpException", () => {
    const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: HttpStatus.BAD_REQUEST,
      message: "Test error",
      timestamp: expect.any(String),
      path: "/test-url",
    });
  });

  it("should handle unknown errors", () => {
    const exception = new Error("Unknown error");

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR.INTERNAL_SERVER,
      timestamp: expect.any(String),
      path: "/test-url",
    });
  });

  it("should not send response if headers already sent", () => {
    mockResponse.headersSent = true;
    const exception = new Error("Test error");

    filter.catch(exception, mockContext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
