import { AuditAction, AuditLogService, AuditResourceType } from "@common/audit/audit.service";
import { ApiGlobalResponse } from "@common/decorators";
import { CurrentUser, TOKEN_NAME } from "@modules/auth";
import { SkipApprove } from "@modules/auth/decorators/skip-approve";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Multer } from "multer";
import { MinioService } from "src/minio/minio.service";
import { EKYBService } from "../ekyb/ekyb.service";
import { UserResponseDto } from "../user/dtos";
import { BusinessResponseDto, CreateBusinessRequestDto } from "./dtos";
import { BusinessEndpointResponseDto } from "./dtos/business-endpoint-response.dto";
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
    private readonly ekybService: EKYBService,
    private readonly auditLogService: AuditLogService
  ) {}

  @SkipApprove()
  @ApiOperation({ description: "Get the current user's business profile" })
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
  @ApiOperation({ description: "Register a new business" })
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/register")
  async register(
    @Body() registration: CreateBusinessRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.registerBusiness({
      ...registration,
      national_id: user.personal_code,
      by: user.id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "CREATE" as AuditAction,
      resourceId: business.id.toString(),
      resourceType: "BUSINESS" as AuditResourceType,
      fields: Object.keys(registration),
      oldData: null,
      newData: business,
    });

    return this.serviceAccountService.getActorLogs(business);
  }

  @SkipApprove()
  @ApiOperation({ description: "Request to change the business representative" })
  @ApiGlobalResponse(RepresentativeResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Patch("/representative")
  async requestChangeRepresentative(
    @Body() request: RequestChangeRepresentativeDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<RepresentativeResponseDto> {
    const result = await this.serviceAccountService.changeRepresentative({
      ...request,
      endpoint_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE" as AuditAction,
      resourceId: result.id.toString(),
      resourceType: "BUSINESS" as AuditResourceType,
      fields: Object.keys(request),
      oldData: null,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Cancel the representative change request" })
  @ApiGlobalResponse(RepresentativeResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Delete("/representative")
  async cancelChangeRepresentative(
    @CurrentUser() user: UserResponseDto
  ): Promise<RepresentativeResponseDto> {
    const result = await this.serviceAccountService.cancelChangeRepresentative(
      user.endpoint_id
    );

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "CANCEL" as AuditAction,
      resourceId: result.id.toString(),
      resourceType: "BUSINESS" as AuditResourceType,
      fields: [],
      oldData: null,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Upload or update business logo" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
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
  @ApiGlobalResponse(BusinessResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Put("/logo")
  @UseInterceptors(FileInterceptor("file"))
  async uploadLogo(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: UserResponseDto
  ): Promise<BusinessResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    const path = await this.minioService.uploadImage(
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );

    const result = await this.serviceAccountService.updateBusiness(Number(business.id), {
      ...business,
      logo_file_name: file.originalname,
      by: user.id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPLOAD" as AuditAction,
      resourceId: business.id.toString(),
      resourceType: "BUSINESS" as AuditResourceType,
      fields: ["logo_file_name"],
      oldData: { logo_file_name: business.logo_file_name },
      newData: { logo_file_name: result.logo_file_name },
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Check if there is a pending representative change request" })
  @ApiGlobalResponse(RepresentativeResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/representative")
  async getRepresentative(
    @CurrentUser() user: UserResponseDto
  ): Promise<RepresentativeResponseDto> {
    return this.serviceAccountService.getRequestedRepresentative(user.endpoint_id);
  }

  @SkipApprove()
  @ApiOperation({ description: "Update business contact information" })
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

    const result = await this.serviceAccountService.updateBusiness(business.id, {
      ...business,
      ...contact,
      national_id: user.personal_code,
      by: user.id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE" as AuditAction,
      resourceId: business.id.toString(),
      resourceType: "BUSINESS" as AuditResourceType,
      fields: Object.keys(contact),
      oldData: business,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Get business notification settings" })
  @ApiGlobalResponse(NotificationSettingDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/notification-setting")
  async getNotificationSetting(
    @CurrentUser() user: UserResponseDto
  ): Promise<NotificationSettingDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );

    const result = await this.serviceAccountService.getNotification(business.id);

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "GET" as AuditAction,
      resourceId: business.id.toString(),
      resourceType: "NOTIFICATION" as AuditResourceType,
      fields: ["notification_setting"],
      oldData: null,
      newData: result
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Validate business information with GDT (General Department of Taxation)" })
  @ApiGlobalResponse(EKYBReponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/validate")
  async validate(
    @Body() ekybRequestDto: GDTKYBRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<EKYBReponseDto | {}> {
    const result = await this.ekybService.validateGDT(ekybRequestDto);

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "VALIDATE_BUSINESS_GDT" as AuditAction,
      resourceId: user.endpoint_id,
      resourceType: "Business" as AuditResourceType,
      fields: Object.keys(ekybRequestDto),
      oldData: null,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Validate business information with MOC (Ministry of Commerce)" })
  @ApiGlobalResponse(EKYBReponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/validate/moc")
  async validateMoc(
    @Body() ekybRequestDto: MOCKYBRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<EKYBReponseDto | {}> {
    const result = await this.ekybService.validateMOC(ekybRequestDto);

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "VALIDATE_BUSINESS_MOC" as AuditAction,
      resourceId: user.endpoint_id,
      resourceType: "Business" as AuditResourceType,
      fields: Object.keys(ekybRequestDto),
      oldData: null,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Update business notification settings" })
  @ApiGlobalResponse(NotificationSettingDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/notification-setting")
  async updateNotificationSetting(
    @Body() setting: NotificationSettingDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<NotificationSettingDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      user.endpoint_id
    );
    const result = await this.serviceAccountService.setNotification({
      ...setting,
      business_id: Number(business.id),
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE_NOTIFICATION_SETTING" as AuditAction,
      resourceId: business.id.toString(),
      resourceType: "Business" as AuditResourceType,
      fields: Object.keys(setting),
      oldData: null,
      newData: result,
    });

    return result;
  }

  @SkipApprove()
  @ApiOperation({ description: "Get business basic information by endpoint ID" })
  @ApiGlobalResponse(BusinessEndpointResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/endpoint/:endpointId")
  async getBusinessByEndpointId(
    @Param("endpointId") endpointId: string
  ): Promise<BusinessEndpointResponseDto> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(
      endpointId
    );

    return {
      endpoint_id: business.endpoint_id,
      tin: business.tin,
      entity_id: business.entity_id,
      entity_name_en: business.entity_name_en,
      entity_name_kh: business.entity_name_kh,
    };
  }
}

