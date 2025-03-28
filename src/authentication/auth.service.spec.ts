import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../schemas/user.schema";
import { UserRole } from "../common/enums/user.enum";
import { ApiResponse } from "../common/utils/api-response.util";
import { UnauthorizedException } from "@nestjs/common";
import { MESSAGES } from "../common/constants/messages.constant";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModel: any;

  const mockUser = {
    _id: "testid",
    email: "test@example.com",
    password: "hashedPassword",
    role: UserRole.ADMIN,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("test-token"),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get(getModelToken(User.name));
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto = {
        email: "test@example.com",
        password: "password123",
      };

      const hashedPassword = "hashedPassword";
      jest.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword as never);
      userModel.exists.mockResolvedValue(null);
      userModel.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toMatchObject({
        status: 200,
        message: MESSAGES.SUCCESS.AUTH.REGISTERED,
        data: {
          token: expect.any(String),
        },
      });
      expect(userModel.create).toHaveBeenCalled();
    });

    it("should throw error if user already exists", async () => {
      const registerDto = {
        email: "test@example.com",
        password: "password123",
      };

      const existingUser = {
        _id: "existingId",
        email: "test@example.com",
        role: UserRole.USER,
      };

      userModel.exists.mockResolvedValue(existingUser);
      userModel.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: MESSAGES.ERROR.AUTH.USER_EXISTS,
        }),
      );

      expect(userModel.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      userModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const result = await service.login(loginDto);
      expect(result).toEqual(
        expect.objectContaining({
          status: 200,
          message: MESSAGES.SUCCESS.AUTH.LOGGED_IN,
          data: {
            token: expect.any(String),
          },
          error: undefined,
        }),
      );
    });

    it("should fail with invalid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      userModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(MESSAGES.ERROR.AUTH.INVALID_CREDENTIALS),
      );
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userModel).toBeDefined();
  });
});
