import { ApiProperty } from "@nestjs/swagger";
import { ServiceProviderResponseDto } from "./service-provider-response.dto";

export class AllServiceProviderResponseDto {
  @ApiProperty({ type: [ServiceProviderResponseDto] })
  connected: ServiceProviderResponseDto[];

  @ApiProperty({ type: [ServiceProviderResponseDto] })
  notYetConnected: ServiceProviderResponseDto[];
}
