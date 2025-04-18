import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class UpdateMeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({ ignore_max_length: true })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber("KH")
  mobile_phone: string;
}
