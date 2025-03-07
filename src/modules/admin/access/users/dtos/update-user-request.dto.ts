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
  MaxLength,
} from "class-validator";
import { UserApproval } from "../user-approval";
import { UserStatus } from "../user-status.enum";
import { UserEntity } from "../user.entity";

export class UpdateUserRequestDto {
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

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  roles: number[];


  createdBy: UserEntity;

  @ApiProperty()
  @IsOptional()
  @IsString()
  expiredAt: Date;

  @ApiProperty({
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
