import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from "supertest";
import { AuthService } from "../src/authentication/auth.service";
import { INestApplication } from "@nestjs/common";

describe("RecordController (e2e)", () => {
  let app: INestApplication;
  let authService: AuthService;
  let authToken: string;
  let recordId: string;

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

  it("should create a new record when authenticated", async () => {
    const response = await request(app.getHttpServer())
      .post("/records")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "New Record", artist: "The Fake Band", year: 2021 })
      .expect(201);

    expect(response.body).toHaveProperty("title", "New Record");
    expect(response.body).toHaveProperty("artist", "The Fake Band");
    recordId = response.body._id; // Store the created record ID for further tests
  });

  it("should not create record without authentication", async () => {
    const response = await request(app.getHttpServer())
      .post("/records")
      .send({
        title: "Unauthorized Record",
        artist: "Unknown Band",
        year: 2021,
      })
      .expect(401); // Unauthorized without token
  });

  it("should fetch records with filters", async () => {
    const response = await request(app.getHttpServer())
      .get("/records")
      .query({ artist: "The Fake Band" }) // Apply any necessary filters
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("artist", "The Fake Band");
  });
});
