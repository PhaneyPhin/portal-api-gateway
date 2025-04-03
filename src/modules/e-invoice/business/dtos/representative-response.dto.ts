import { ApiProperty } from "@nestjs/swagger";

export class RepresentativeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  requested_to_personal_code: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  endpoint_id: string;

  @ApiProperty()
  authorized_letter: string;
}
