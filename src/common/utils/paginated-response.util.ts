import { ApiResponse } from "./api-response.util";

export class PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };

  constructor(
    items: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
  ) {
    this.items = items;
    this.meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage,
    };
  }

  static createApiResponse<T>(
    items: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    message = "Items retrieved successfully",
  ): ApiResponse<PaginatedResponse<T>> {
    const paginatedResponse = new PaginatedResponse<T>(
      items,
      totalItems,
      currentPage,
      itemsPerPage,
    );

    return ApiResponse.success(paginatedResponse, message);
  }
}
