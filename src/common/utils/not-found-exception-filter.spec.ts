import { NotFoundExceptionFilter } from "./not-found-exception-filter.util";
import { NotFoundException } from "@nestjs/common";
import { MESSAGES } from "../constants/messages.constant";
import { ExecutionContext } from "@nestjs/common";

describe("NotFoundExceptionFilter", () => {
  let filter: NotFoundExceptionFilter;
  let mockException: NotFoundException;
  let mockContext: ExecutionContext;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    filter = new NotFoundExceptionFilter();
    mockException = new NotFoundException();

    mockRequest = {
      url: "/test-url",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;
  });

  it("should transform NotFoundException to correct format", () => {
    filter.catch(mockException, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: null,
        status: 404,
        message: MESSAGES.ERROR.NOT_FOUND,
        error: expect.objectContaining({
          timestamp: expect.any(String),
          path: "/test-url",
        }),
      }),
    );
  });
});
