import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentUser, SkipAuth, TOKEN_NAME } from "@auth";
import { AuditLogService } from "@common/audit/audit.service";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { LoginUrlResponseDto } from "@modules/auth/dtos/login-url.dto";
import { ServiceAccountTest } from "@modules/auth/dtos/service-test.dto";
import { UUID } from "crypto";
import { NotificationService } from "../notification/notificaiton.service";
import { CreateUserRequestDto, UserResponseDto } from "./dtos";
import { UserService } from "./user.service";

@ApiTags("User")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/user",
  version: "1",
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auditService: AuditLogService,
    private readonly notificaitonService: NotificationService
  ) {}

  @SkipAuth()
  @ApiOperation({ description: "Test notification service communication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/test")
  test(@Body() data: ServiceAccountTest): Promise<any> {
    return this.notificaitonService.call(data.pattern, data.payload);
  }

  @ApiOperation({ description: "Get paginated list of users" })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(["first_name_en", "first_name_kh", "endpoint_id", "role"])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public getGetUsers(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.userService.list({
      ...pagination,
      params: { ...pagination.params, endpoint_id: user.endpoint_id },
    });
  }

  @ApiOperation({ description: "Get list of users for select dropdown" })
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/select-options")
  public getAllUserForSelect(
    @CurrentUser() user: UserResponseDto
  ): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers(user.endpoint_id);
  }

  @ApiOperation({ description: "Get user details by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id")
  public async GetById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<UserResponseDto> {
    const foundUser = await this.userService.findById(id);
    if (user.endpoint_id !== foundUser.endpoint_id) {
      throw new NotFoundException();
    }
    return foundUser;
  }

  @ApiOperation({ description: "Create new user" })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: "User already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post()
  public async createUser(
    @Body(ValidationPipe) dto: CreateUserRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<UserResponseDto> {
    const createdUser = await this.userService.createUser({
      ...dto,
      endpoint_id: user.endpoint_id,
    });

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: user.id,
      action: "CREATE",
      resourceId: createdUser.id.toString(),
      resourceType: "USER",
      fields: ["identity_number", "email", "role"],
      oldData: null,
      newData: createdUser,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    return createdUser;
  }

  @ApiOperation({ description: "Update user by ID" })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: "User already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.update")
  @Put("/:id")
  public async updateUser(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: CreateUserRequestDto,
    @CurrentUser() currentUser: UserResponseDto
  ): Promise<UserResponseDto> {
    const existingUser = await this.userService.findById(id);

    if (existingUser.endpoint_id !== currentUser.endpoint_id) {
      throw new NotFoundException();
    }

    const updatedUser = await this.userService.patch({ id }, dto);

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: currentUser.id,
      action: "UPDATE",
      resourceId: updatedUser.id.toString(),
      resourceType: "USER",
      fields: ["identity_number", "email", "role"],
      oldData: existingUser,
      newData: updatedUser,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    return updatedUser;
  }

  @ApiOperation({ description: "Delete user by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.delete")
  @Delete("/:id")
  public async deleteUser(
    @Param("id") id: UUID,
    @CurrentUser() currentUser: UserResponseDto
  ): Promise<UserResponseDto> {
    const existingUser = await this.userService.findById(id);

    if (existingUser.endpoint_id !== currentUser.endpoint_id) {
      throw new NotFoundException();
    }

    await this.userService.deleteUser(id);

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: currentUser.id,
      action: "DELETE",
      resourceId: existingUser.id.toString(),
      resourceType: "USER",
      fields: ["identity_number", "email", "role"],
      oldData: existingUser,
      newData: null,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    return existingUser;
  }
}
