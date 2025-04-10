import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AuthCredentialsRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: "caminv01",
  })
  readonly username: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "abc12345",
  })
  readonly password: string;
}
