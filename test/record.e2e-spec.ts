import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { RecordFormat, RecordCategory } from "../src/common/enums/record.enum";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Record } from "../src/schemas/record.schema";
import { User } from "../src/schemas/user.schema";
import { UserRole } from "../src/common/enums/user.enum";

describe("RecordController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let recordId: string;
  let recordModel: Model<Record>;
  let userModel: Model<User>;

  beforeAll(async () => {
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
        email: "admin@example.com",
        password: "Admin123!",
        role: UserRole.ADMIN,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "admin@example.com",
        password: "Admin123!",
      });

    expect(loginResponse.status).toBe(201);
    authToken = loginResponse.body.data?.token;
    if (!authToken) throw new Error("Login failed: No token in response");
  });

  afterAll(async () => {
    await recordModel.deleteMany({});
    await userModel.deleteMany({});
    await app.close();
  });

  it("should create a new record when authenticated", async () => {
    const createRecordDto = {
      artist: "The Fake Band",
      album: "Fake Album",
      price: 20.99,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const response = await request(app.getHttpServer())
      .post("/records")
      .set("Authorization", `Bearer ${authToken}`)
      .send(createRecordDto)
      .expect(201);

    expect(response.body.status).toBe(201);
    expect(response.body.data).toHaveProperty("artist", "The Fake Band");
    expect(response.body.data).toHaveProperty("album", "Fake Album");
    expect(response.body.data).toHaveProperty("price", 20.99);
    expect(response.body.data).toHaveProperty("qty", 10);
    expect(response.body.data).toHaveProperty("format", "Vinyl");
    expect(response.body.data).toHaveProperty("category", "Rock");
    expect(response.body.data).toHaveProperty("_id");

    recordId = response.body.data._id;
  });

  it("should not create record without authentication", async () => {
    const createRecordDto = {
      artist: "The Fake Band",
      album: "Fake Album",
      price: 20.99,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    await request(app.getHttpServer())
      .post("/records")
      .send(createRecordDto)
      .expect(401);
  });

  it("should fetch records with filters", async () => {
    const response = await request(app.getHttpServer())
      .get("/records")
      .query({
        page: 1,
        limit: 10,
        category: RecordCategory.ROCK,
      })
      .expect(200);

    expect(response.body.status).toBe(200);
    expect(response.body.data).toHaveProperty("items");
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.meta).toHaveProperty("totalItems");
    expect(response.body.data.meta).toHaveProperty("currentPage", "1");
  });

  it("should get a specific record", async () => {
    const response = await request(app.getHttpServer())
      .get(`/records/${recordId}`)
      .expect(200);

    expect(response.body.status).toBe(200);
    expect(response.body.data).toHaveProperty("_id", recordId);
    expect(response.body.data).toHaveProperty("artist", "The Fake Band");
    expect(response.body.data).toHaveProperty("album", "Fake Album");
  });

  it("should delete a record when authenticated as admin", async () => {
    await request(app.getHttpServer())
      .delete(`/records/${recordId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    const deletedRecord = await recordModel.findById(recordId);
    expect(deletedRecord).toBeNull();
  });
});
