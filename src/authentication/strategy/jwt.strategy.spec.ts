import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "./jwt.strategy";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../../schemas/user.schema";
import { UnauthorizedException } from "@nestjs/common";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let userModel: any;

  const mockUser = {
    _id: "testid",
    email: "test@example.com",
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userModel = module.get(getModelToken(User.name));
  });

  describe("validate", () => {
    it("should validate and return user", async () => {
      userModel.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: "testid" });

      expect(result).toEqual(mockUser);
      expect(userModel.findById).toHaveBeenCalledWith("testid");
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      userModel.findById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(strategy.validate({ sub: "testid" })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(strategy.validate({ sub: "testid" })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
