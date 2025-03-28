![Codecov](https://codecov.io/gh/ekumamait/broken-record-store/branch/dev/graph/badge.svg) [![CI](https://github.com/ekumamait/broken-record-store/actions/workflows/ci.yml/badge.svg)](https://github.com/ekumamait/broken-record-store/actions/workflows/ci.yml)

##### TABLE OF CONTENT

---

- [x] **DESCRIPTION**
- [x] **PROJECT SETUP**
- [x] **AVAILABLE ROUTES**
- [x] **REQUEST DATA**
- [x] **TESTS**
- [ ] **PROJECT DEMO**
- [ ] **TODOS**

---

###### :page_facing_up: Description

Welcome to the Broken Record Store API—a modern, feature-rich API for managing a record store's inventory and orders. This application is built with NestJS and provides a robust set of features including:

#### Core Features

- **Record Management**:
  - CRUD operations for vinyl records, CDs, and other music formats
  - MusicBrainz integration for fetching detailed album information
  - Advanced filtering and search capabilities
  - Automatic track listing from MusicBrainz

- **Order Processing**:
  - Create and manage orders
  - Real-time inventory tracking
  - Order history and status management

- **Authentication & Authorization**:
  - JWT-based authentication
  - Role-based access control (Admin/Public)
  - Secure endpoints with guard protection

#### Technical Features

- **Caching**:
  - Redis-based caching system
  - Automatic cache invalidation
  - Configurable TTL for different resources

- **Database**:
  - MongoDB integration with Mongoose
  - Optimized queries with indexing
  - Data validation using DTOs

- **API Features**:
  - API versioning
  - Swagger documentation
  - Error handling with custom filters
  - Request validation
  - Rate limiting

#### Performance Optimizations

- Pagination for large datasets
- Query optimization with MongoDB indexes
- Caching for frequently accessed data
- Efficient error handling and logging

The API follows REST principles and uses modern TypeScript features while maintaining clean architecture patterns and SOLID principles.

---

###### PROJECT SETUP

1. Clone the Repository

   `https://github.com/ekumamait/broken-record-store.git`

2. Navigate to the application directory

   `cd broken-record-store`

3. Create a `.env` file in the root of the project use the content of _.env.example_ as a guide

   `cp .env.example .env`

4. Install all dependencies

   `npm install`

5. Run Docker for MongoDB Emulator

   `npm run mongo:start`

6. Run MongoDB Data Setup

   `npm run setup:db`

7. Start the application in watch mode

   `npm run start:dev`

8. Start the application in production mode

   `npm run start:prod`

---

###### AVAILABLE ROUTES

| EndPoint | Methods | Functionality                   | Access | Authentication |
| -------- | ------- | ------------------------------- | ------- | ------- |
| `register`  | `POST`     | `create a new user who is instantly set as admin` | `USER` | `FALSE` |
| `login`  | `POST`     | `login to get access token to access admin routes` | `USER` |`FALSE` |
| `records`  | `POST`     | `create a new record with or without mbid` | `ADMIN` |`TRUE` |
| `records/:id`  | `PUT`     | `update record details` | `ADMIN` |`TRUE` |
| `records`  | `GET`     | `search for records in our catalog` | `USER` |`FALSE` |
| `records/:id`  | `GET`     | `fetch a single record from our catalog`| `USER` |`FALSE` |
| `records/:id`  | `DELETE`     | `delete a record from the catalog` |`ADMIN` |`TRUE` |
| `orders`  | `POST`     | `create orders for records` | `USER` |`TRUE` |
| `orders/:id`  | `PATCH`     | `update your order for a record` | `USER` |`TRUE` |
| `orders`  | `GET`     | `fetch all orders for records` | `USER` | `TRUE` |
| `orders/:id`  | `GET`     | `fetch a single order for a record`| `USER` |`TRUE` |
| `orders/:id`  | `DELETE`     | `delete an order for a record` |`ADMIN` |`TRUE` |

---

##### Record Data Example

Here’s an example of data to create a record:

```

{
        "artist": "Foo Fighters",
        "album": "Foo Fighers",
        "price": 8,
        "qty": 10,
        "format": "CD",
        "category": "Rock",
        "mbid": "d6591261-daaa-4bb2-81b6-544e499da727"
}

```

##### Order Data Example

Here’s an example of data to create an order for a record:

```
{
        "recordId": "67e3e30a810d696976b8f062",
        "quantity": 10,
}
```
---

###### :microscope: TESTS

- [x] Unit Tests

- command to run unit tests:
  `npm run test`

- command to run tests with coverage:
  `npm run test:cov`

- [x] End-to-end Tests

- command to run e2e tests with coverage:
  `npm run test:e2e`

---

###### PROJECT DEMO

Here is an example link to the deployed api:

**http://localhost:3000/swagger**

---

###### TODOS

1: Implement admin panel UI

2: Deploy API
