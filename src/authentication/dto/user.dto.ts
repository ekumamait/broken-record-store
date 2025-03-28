import { IsEmail, IsEnum } from "class-validator";
import { UserRole } from "../../common/enums/user.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;
}
