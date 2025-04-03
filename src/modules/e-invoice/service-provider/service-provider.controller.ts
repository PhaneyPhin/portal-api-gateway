import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { ApiGlobalResponse } from "@common/decorators";
import { ServiceAccountService } from "../business/service-account.service";
import { UserResponseDto } from "../user/dtos";
import { ServiceProviderResponseDto } from "./dtos";
import { AllServiceProviderResponseDto } from "./dtos/all-service-provider.dto";
import { AuthTokenResponseDto } from "./dtos/auth-token-response.dto";

@ApiTags("ServiceProvider")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/service-provider",
  version: "1",
})
export class ServiceProviderController {
  constructor(private readonly serviceAccountService: ServiceAccountService) {}

  // @Get()
  // public getServiceProviders(
  //   @PaginationParams() pagination: PaginationRequest,
  //   @CurrentUser() user: UserResponseDto
  // ): Promise<PaginationResponseDto<ServiceProviderResponseDto>> {
  //   return this.serviceAccountService.listServiceProvider({
  //     ...pagination,
  //     params: { ...pagination.params, endpoint_id: user.endpoint_id },
  //   });
  // }

  @ApiOperation({ description: "Get all customer list form select form" })
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @ApiGlobalResponse(AllServiceProviderResponseDto)
  @Get("/")
  public async getAllServiceProvider(
    @CurrentUser() user: UserResponseDto
  ): Promise<AllServiceProviderResponseDto> {
    const allServiceProvider =
      await this.serviceAccountService.getAllServiceProvider();

    const connectedServiceProvider =
      await this.serviceAccountService.getConnectedServiceProvider(
        user.endpoint_id
      );

    if (connectedServiceProvider) {
      const index = allServiceProvider.findIndex(
        (servoceProvider) => servoceProvider.id === connectedServiceProvider.id
      );
      allServiceProvider.splice(index, 0);
    }

    return {
      connected: [connectedServiceProvider],
      notYetConnected: allServiceProvider,
    };
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:clientId/connect")
  public async getServiceProviderById(
    @Param("clientId") clientId: string,
    @CurrentUser() user: UserResponseDto
  ): Promise<ServiceProviderResponseDto> {
    const connected =
      await this.serviceAccountService.getConnectedServiceProvider(
        user.endpoint_id
      );
    if (connected) {
      throw new ForbiddenException(
        `You already connected to a access point: ${connected.name_en} / ${connected.name_kh}`
      );
    }
    return await this.serviceAccountService.getServiceProviderByClientId(
      clientId
    );
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(AuthTokenResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Post("/:id/connect")
  public async connectServiceProvider(
    @Param("id") id: number,
    @CurrentUser() user: UserResponseDto
  ): Promise<AuthTokenResponseDto> {
    const connected =
      await this.serviceAccountService.getConnectedServiceProvider(
        user.endpoint_id
      );
    if (connected) {
      throw new ForbiddenException(
        `You already connected to a access point: ${connected.name_en} / ${connected.name_kh}`
      );
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);

    return await this.serviceAccountService.getAuthToken({
      service_provider_id: id,
      endpoint_id: business.endpoint_id,
    });
  }
}
