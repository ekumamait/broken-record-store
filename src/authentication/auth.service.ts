import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { UserRole } from 'src/common/enums/user.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiResponse } from '../common/utils/api-response.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<ApiResponse<any>> {
    const { email, password } = registerDto;
    
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      return ApiResponse.error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.ADMIN, // First user is admin
    });

    const token = this.generateToken(user);
    return ApiResponse.success({ token });
  }

  async login(loginDto: LoginDto): Promise<ApiResponse<any>> {
    const { email, password } = loginDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return ApiResponse.success({ token });
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }
}
