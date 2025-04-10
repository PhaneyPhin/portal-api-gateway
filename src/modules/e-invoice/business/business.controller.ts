import { ApiGlobalResponse } from "@common/decorators";
import { CurrentUser, TOKEN_NAME } from "@modules/auth";
import { SkipApprove } from "@modules/auth/decorators/skip-approve";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Multer } from "multer";
import { MinioService } from "src/minio/minio.service";
import { EKYBService } from "../ekyb/ekyb.service";
import { UserResponseDto } from "../user/dtos";
import { BusinessResponseDto, CreateBusinessRequestDto } from "./dtos";
import { ContactDto } from "./dtos/contact.dto";
import { EKYBReponseDto } from "./dtos/ekyb-response.dto";
import { GDTKYBRequest, MOCKYBRequest } from "./dtos/kyb-request.dto";
import { NotificationSettingDto } from "./dtos/notification-setting.dto";
import { RepresentativeResponseDto } from "./dtos/representative-response.dto";
import { RequestChangeRepresentativeDto } from "./dtos/request-change-representative.dto";
import { ServiceAccountService } from "./service-account.service";

@ApiTags("Business")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "business/",
  version: "1",
})
export class BusinessController {
  constructor(
    private readonly serviceAccountService: ServiceAccountService,
    private readonly minioService: MinioService,
    private readonly ekybService: EKYBService
  ) {}

  @SkipApprove()
  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/")
  async getProfile(
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto | {}> {
    const business = this.serviceAccountService.getBusinessProfile(user);

    if (!business) {
      return {};
    }

    return business;
  }

  @SkipApprove()
  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/register")
  register(
    @Body() registration: CreateBusinessRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    return this.serviceAccountService.registerBusiness({
      ...registration,
      national_id: user.personal_code,
    });
  }

  @ApiOperation({ description: "Change representative" })
  @ApiGlobalResponse(RepresentativeResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Patch("/representative")
  changeRepresentativeRequest(
    @Body() data: RequestChangeRepresentativeDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<RepresentativeResponseDto> {
    return this.serviceAccountService.changeRepresentative({
      ...data,
      endpoint_id: user.endpoint_id,
    });
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(Boolean)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Delete("/representative")
  cancelChangeRepresentativeRequest(
    @CurrentUser() user: UserResponseDto
  ): Promise<Boolean> {
    return this.serviceAccountService.cancelChangeRepresentative(
      user.endpoint_id
    );
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "image file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  @ApiGlobalResponse(BusinessResponseDto)
  @Put("/logo")
  async uploadFile(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: UserResponseDto
  ) {
    const path = await this.minioService.uploadImage(
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );

    await this.serviceAccountService.call("business.updateLogo", {
      endpoint_id: user.endpoint_id,
      logo: path,
    });

    return await this.serviceAccountService.getBusinessProfile(user);
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(Boolean)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/representative")
  getRequestedRepresentative(
    @CurrentUser() user: UserResponseDto
  ): Promise<Boolean> {
    return this.serviceAccountService.getRequestedRepresentative(
      user.endpoint_id
    );
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/update-contact")
  async updateContact(
    @Body() contact: ContactDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.updateBusiness(business.id, {
      ...business,
      ...contact,
      national_id: user.personal_code,
    });
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/notification-setting")
  async getNotificationSetting(
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    console.log(user);
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.getNotification(business.id);
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(EKYBReponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/validate")
  validate(
    @Body() ekybRequestDto: GDTKYBRequest
  ): Promise<EKYBReponseDto | {}> {
    return this.ekybService.validateGDT(ekybRequestDto);
  }

  @ApiOperation({ description: "Get business profile" })
  @ApiGlobalResponse(EKYBReponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/validate/moc")
  validateMoc(
    @Body() ekybRequestDto: MOCKYBRequest
  ): Promise<EKYBReponseDto | {}> {
    return this.ekybService.validateMOC(ekybRequestDto);
  }

  @ApiOperation({ description: "set notification" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/notification-setting")
  async setNotification(
    @Body() notification: NotificationSettingDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    return this.serviceAccountService.setNotification({
      ...notification,
      business_id: business.id,
    });
  }
}
