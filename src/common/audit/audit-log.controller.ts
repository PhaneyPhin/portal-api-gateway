import { Controller, Get } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
    ApiPaginatedResponse,
    PaginationParams,
    PaginationRequest,
    PaginationResponseDto,
} from "@libs/pagination";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UserService } from "@modules/e-invoice/user/user.service";
import { AuditLogEntity } from "./audit-log.entity";
import { AuditLogService } from "./audit.service";

class AuditLogResponse {
  action: string;
  description: string;
  created_at: Date;
  actor_name: string;
}

@ApiTags("AuditLog")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/audit-log",
  version: "1",
})
export class AuditLogController {
  constructor(
    private readonly auditService: AuditLogService,
    private readonly userService: UserService
  ) {}

  @ApiOperation({ description: "Get audit logs" })
  @ApiPaginatedResponse(AuditLogResponse)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(["action", "description", "created_at", "actor_name"])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public async getAuditLog(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<AuditLogResponse>> {
    const paginationData = await this.auditService.list<AuditLogEntity, AuditLogEntity>({
      ...pagination,
      params: { ...pagination.params, supplier_id: user.endpoint_id },
    });

    const userIds = paginationData.data.map((content) => content.actor_id);
    const users = await this.userService.findByIds(userIds);
    
    const responseData = paginationData.data.map((content) => {
      const user = users.find((u) => u.id === content.actor_id);
      return {
        action: content.action,
        description: content.description,
        created_at: content.created_at,
        actor_name: user ? user.name : content.actor_id,
      };
    });

    return {
      ...paginationData,
      data: responseData,
    };
  }
}
