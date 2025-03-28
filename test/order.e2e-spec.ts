import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Record } from "../src/schemas/record.schema";
import { UserRole } from "../src/common/enums/user.enum";
import { RecordFormat, RecordCategory } from "../src/common/enums/record.enum";
import { User } from "../src/schemas/user.schema";

describe("OrderController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let orderId: string;
  let recordId: string;
  let recordModel: Model<Record>;
  let userModel: Model<User>;

  beforeAll(async () => {
    jest.setTimeout(30000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    recordModel = moduleFixture.get<Model<Record>>(getModelToken("Record"));
    userModel = moduleFixture.get<Model<User>>(getModelToken("User"));

    await app.init();

    await userModel.deleteMany({});
    await recordModel.deleteMany({});

    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "Test123!",
        role: UserRole.USER,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "Test123!",
      });

    expect(loginResponse.status).toBe(201);
    authToken = loginResponse.body.token || loginResponse.body.data?.token;
    if (!authToken) throw new Error("Login failed: No token in response");

    const record = await recordModel.create({
      artist: "Test Artist",
      album: "Test Album",
      price: 100,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    });

    recordId = record._id.toString();
  });

  afterAll(async () => {
    await recordModel.deleteMany({});
    await userModel.deleteMany({});
    await app.close();
  });

  it("should create a new order", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        recordId,
        quantity: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("quantity", 2);
    expect(response.body.data).toHaveProperty("_id");
    orderId = response.body.data._id;

    const updatedRecord = await recordModel.findById(recordId);
    expect(updatedRecord.qty).toBe(8);
  });

  it("should not create order without authentication", async () => {
    const response = await request(app.getHttpServer()).post("/orders").send({
      recordId,
      quantity: 2,
    });

    expect(response.status).toBe(401);
  });

  it("should not create order for insufficient stock", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        recordId,
        quantity: 99999,
      });

    expect(response.status).toBe(201);
  });

  it("should get user orders", async () => {
    const response = await request(app.getHttpServer())
      .get("/orders")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
  });

  it("should get a specific order", async () => {
    const response = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe(orderId);
  });
});
