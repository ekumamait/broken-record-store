import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ApiResponse } from "../common/utils/api-response.util";

@ApiTags("Auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<any>> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    return this.authService.login(loginDto);
  }
}
