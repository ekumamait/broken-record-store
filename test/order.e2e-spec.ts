import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from "supertest";
import { AuthService } from "../src/authentication/auth.service";
import { INestApplication } from "@nestjs/common";

describe("OrderController (e2e)", () => {
  let app: INestApplication;
  let authService: AuthService;
  let authToken: string;
  let orderId: string;

  jest.setTimeout(10000); // Increase timeout to 10 seconds

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate an auth token (assuming you have a login route that returns a JWT token)
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "testUser", password: "password" });

    authToken = response.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  it("should create a new order", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ productId: "123", quantity: 2 })
      .expect(201);

    // Check that response contains the correct properties
    expect(response.body).toHaveProperty("quantity", 2);
    expect(response.body).toHaveProperty("_id");
    orderId = response.body._id; // Store the created order ID for further tests
  });

  it("should not create order without authentication", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .send({ productId: "123", quantity: 2 })
      .expect(401); // Unauthorized without token
  });

  it("should not create order for insufficient stock", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ productId: "123", quantity: 99999 }) // Assuming 99999 exceeds the stock
      .expect(400); // Bad request for insufficient stock
  });

  it("should get user orders", async () => {
    const response = await request(app.getHttpServer())
      .get("/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
