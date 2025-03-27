export const MESSAGES = {
  SUCCESS: {
    OPERATION: "Operation successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    RETRIEVED: "Resource retrieved successfully",
    RECORDS: {
      CREATED: "Record created successfully",
      UPDATED: "Record updated successfully",
      DELETED: "Record deleted successfully",
      RETRIEVED: "Record retrieved successfully",
      LIST_RETRIEVED: "Records retrieved successfully",
    },
    ORDERS: {
      CREATED: "Order created successfully",
      UPDATED: "Order updated successfully",
      DELETED: "Order deleted successfully",
      RETRIEVED: "Order retrieved successfully",
      LIST_RETRIEVED: "Orders retrieved successfully",
    },
    AUTH: {
      REGISTERED: "User registered successfully",
      LOGGED_IN: "User logged in successfully",
    },
  },
  ERROR: {
    GENERAL: "Operation failed",
    NOT_FOUND: "Resource not found",
    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Unauthorized",
    INTERNAL_SERVER: "Internal server error",
    RECORDS: {
      NOT_FOUND: "Record not found",
      ASSOCIATE_NOT_FOUND: "Record associated with this order not found",
      DUPLICATE:
        "Record already exists with this artist, album, and format combination",
      UPDATE_DUPLICATE:
        "Update would create a duplicate record with the same artist, album, and format",
      MUSICBRAINZ_FETCH_ERROR: "Failed to fetch track list from MusicBrainz",
      CREATE_ERROR: "Error creating record",
      UPDATE_ERROR: "Error updating record",
      DELETE_ERROR: "Error deleting record",
      RETRIEVE_ERROR: "Error retrieving record",
      LIST_RETRIEVE_ERROR: "Error retrieving records",
    },
    ORDERS: {
      NOT_FOUND: "Order not found",
      INSUFFICIENT_STOCK: "Not enough records in stock",
      CREATE_ERROR: "Error creating order",
      UPDATE_ERROR: "Error updating order",
      DELETE_ERROR: "Error deleting order",
      RETRIEVE_ERROR: "Error retrieving order",
      LIST_RETRIEVE_ERROR: "Error retrieving orders",
    },
    AUTH: {
      INVALID_CREDENTIALS: "Invalid credentials",
      USER_EXISTS: "User already exists",
      INACTIVE_USER: "User account is inactive",
    },
  },
};
