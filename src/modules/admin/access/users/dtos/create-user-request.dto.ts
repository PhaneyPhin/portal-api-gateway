import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsAlphanumeric,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from "class-validator";
import { UserApproval } from "../user-approval";
import { UserStatus } from "../user-status.enum";
import { UserEntity } from "../user.entity";

const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    example: "jdoe",
  })
  username: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: "John",
  })
  name: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  @ApiProperty({
    example: "admin@gmail.com",
  })
  email: string;

  @Matches(passwordRegex, { message: "Password too weak" })
  @IsNotEmpty()
  // @IsAlphanumeric()
  @Length(6, 20)
  @ApiProperty({
    example: "Hello123",
  })
  password: string;

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  roles: number[];

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  warehouse: number[];

  createdBy: UserEntity;

  @ApiProperty()
  @IsOptional()
  @IsString()
  expiredAt: Date;

  @ApiProperty({
    enum: UserApproval,
  })
  @IsNotEmpty()
  @IsEnum(UserApproval)
  userApproval: UserApproval;

  @ApiProperty({
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
