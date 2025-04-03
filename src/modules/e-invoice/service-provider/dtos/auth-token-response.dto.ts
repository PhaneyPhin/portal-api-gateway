import { ApiProperty } from "@nestjs/swagger";

export class AuthTokenResponseDto {
  @ApiProperty({ example: "ey..." })
  auth_token: string;
}
