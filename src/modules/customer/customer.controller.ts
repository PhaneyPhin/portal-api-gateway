import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { CUSTOMER_FILTER_FIELDS, CustomerService } from "./customer.service";
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from "./dtos";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { AuditLogService } from "@common/audit/audit.service";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { CustomerEntity } from "./customer.entity";

@ApiTags("Customer")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/customer",
  version: "1",
})
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly auditService: AuditLogService,
    private readonly serviceAccountService: ServiceAccountService
  ) {}

  @ApiOperation({ description: "Get a paginated customer list" })
  @ApiPaginatedResponse(CustomerResponseDto)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(CUSTOMER_FILTER_FIELDS)
  @Get('/')
  public getCustomers(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<CustomerResponseDto>> {
    console.log('getCustomers', user);
    return this.customerService.list<CustomerEntity, CustomerResponseDto>({
      ...pagination,
      params: { ...pagination.params, supplier_id: user.endpoint_id },
    });
  }

  @ApiOperation({ description: "Get all customer list form select form" })
  @Get("/select-options")
  public getAllCustomerForSelect(
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerEntity[]> {
    return this.customerService.getAllCustomer(user.endpoint_id);
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @Get("/:id")
  public async getCustomerById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.getCustomerById(id, user.endpoint_id);
    return customer;
  }

  @ApiOperation({ description: "Get customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @Get("/endpoint-id/:endpoint_id")
  public async getBusinessByEndpointId(
    @Param("endpoint_id") endpointId: string,
    @CurrentUser() user: UserResponseDto
  ): Promise<{
    entity_name_en: string;
    entity_name_kh: string;
    tin: string;
    id: number;
  }> {
    const business = await this.serviceAccountService.getBusinessByEndpoint(endpointId);
    return {
      entity_name_en: business.entity_name_en,
      entity_name_kh: business.entity_name_kh,
      tin: business.tin,
      id: business.id,
    };
  }

  @ApiOperation({ description: "Create new customer" })
  @ApiGlobalResponse(CustomerResponseDto)
  @ApiConflictResponse({ description: "Customer already exists" })
  @Post()
  public async createCustomer(
    @Body(ValidationPipe) dto: CreateCustomerRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customerService.createCustomer({
        ...dto,
        supplier_id: user.endpoint_id,
        createdBy: user.id,
      });
      
      // Log audit action asynchronously
      this.auditService.logAction({
        actorId: user.id,
        action: 'CREATE',
        resourceId: customer.id.toString(),
        resourceType: 'CUSTOMER',
        fields: ['entity_name_en', 'entity_name_kh', 'tin', 'supplier_id'],
        oldData: null,
        newData: customer
      }).catch(error => {
        console.error('Failed to log audit action:', error);
      });

      return customer;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create customer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ description: "Update customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @ApiConflictResponse({ description: "Customer already exists" })
  @Put("/:id")
  public async updateCustomer(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCustomerRequestDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    try {
      const oldCustomer = await this.customerService.getCustomerById(id, user.endpoint_id);
      const customer = await this.customerService.updateCustomer(id, {
        ...dto,
        supplier_id: user.endpoint_id,
        updatedBy: user.id,
      });
      
      // Log audit action asynchronously
      this.auditService.logAction({
        actorId: user.id,
        action: 'UPDATE',
        resourceId: id.toString(),
        resourceType: 'CUSTOMER',
        fields: Object.keys(dto),
        oldData: oldCustomer,
        newData: customer
      }).catch(error => {
        console.error('Failed to log audit action:', error);
      });

      return customer;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update customer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ description: "Update customer by id" })
  @ApiGlobalResponse(CustomerResponseDto)
  @Delete("/:id")
  public async deleteCustomer(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: UserResponseDto
  ): Promise<CustomerResponseDto> {
    try {
      const oldCustomer = await this.customerService.getCustomerById(id, user.endpoint_id);
      const customer = await this.customerService.deleteCustomer(id);
      
      // Log audit action asynchronously
      this.auditService.logAction({
        actorId: user.id,
        action: 'DELETE',
        resourceId: id.toString(),
        resourceType: 'CUSTOMER',
        fields: ['id'],
        oldData: oldCustomer,
        newData: null
      }).catch(error => {
        console.error('Failed to log audit action:', error);
      });

      return customer;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete customer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
