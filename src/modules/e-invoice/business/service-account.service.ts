import { PaginationRequest } from "@libs/pagination";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { ServiceProviderResponseDto } from "../service-provider/dtos";
import { GetAuthTokenRequest } from "../service-provider/dtos/get-auth-token-request.dto";
import { UserResponseDto } from "../user/dtos";
import { UserService } from "../user/user.service";
import { BusinessResponseDto, CreateBusinessRequestDto } from "./dtos";
import { NotificationSettingDto } from "./dtos/notification-setting.dto";
import { RequestChangeRepresentativeDto } from "./dtos/request-change-representative.dto";

@Injectable()
export class ServiceAccountService implements OnModuleInit {
  private businessClient: ClientProxy;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {}

  onModuleInit() {
    this.businessClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("SERVICE_ACCOUNT_HOST", "localhost"),
        port: 3002,
      },
    });
  }

  // 1. Register Business
  async registerBusiness(payload: CreateBusinessRequestDto) {
    return firstValueFrom(
      this.businessClient.send("business.register", payload)
    );
  }

  async getBusinessProfile(
    user: UserResponseDto
  ): Promise<BusinessResponseDto | null> {
    try {
      return await this.getBusinessByEndpoint(user.endpoint_id);
    } catch (e) {
      try {
        return await this.getByNationalId(user.personal_code);
      } catch (e) {
        return null;
      }
    }
  }

  async getActorLogs(business: BusinessResponseDto) {
    const actIds = business.actions.map((item) => item.by);
    const namesActor = await this.userService.call("user.getNameByIds", actIds);
    business.actions = business.actions.map((action) => {
      const name = namesActor.find((actor) => actor.id === action.by) || {};

      return {
        ...name,
        ...action,
      };
    });

    return business;
  }

  // 2. Update Business
  async updateBusiness(id: number, data: CreateBusinessRequestDto) {
    return firstValueFrom(
      this.businessClient.send("business.update", { id, data })
    );
  }

  // 3. Get Business By ID
  async getBusinessById(id: number) {
    return firstValueFrom(
      this.businessClient.send("business.findById", { id })
    );
  }

  // 4. Get Business By Endpoint
  async getBusinessByEndpoint(
    endpointId: string
  ): Promise<BusinessResponseDto> {
    try {
      return firstValueFrom(
        this.businessClient.send("business.getByEndpointId", endpointId)
      );
    } catch (e) {
      return { step: 1 } as BusinessResponseDto;
    }
  }

  // 5. List Business (with pagination)
  async listBusiness(payload: PaginationRequest) {
    return firstValueFrom(this.businessClient.send("business.list", payload));
  }

  // 6. Get All Businesses (no pagination)
  async getAllBusiness() {
    return firstValueFrom(this.businessClient.send("business.all", {}));
  }

  // 7. Approve Business
  async approveBusiness(id: number, by: string) {
    return firstValueFrom(
      this.businessClient.send("business.approve", { id, by })
    );
  }

  // 8. Reject Business
  async rejectBusiness(id: number, type: string, message: string, by: string) {
    return firstValueFrom(
      this.businessClient.send("business.reject", { id, type, message, by })
    );
  }

  // 9. Set Notification
  async setNotification(payload: NotificationSettingDto) {
    return firstValueFrom(
      this.businessClient.send("business.setNotification", payload)
    );
  }

  // 9. Set Notification
  async getByNationalId(id: string) {
    return firstValueFrom(
      this.businessClient.send("business.getByNationalId", id)
    );
  }

  // 10. Get Notification
  async getNotification(payload: number) {
    try {
      return await firstValueFrom(
        this.businessClient.send("business.getNotification", payload)
      );
    } catch (e) {
      return {};
    }
  }

  public async listServiceProvider(payload: PaginationRequest) {
    return firstValueFrom(
      this.businessClient.send("serviceProvider.list", payload)
    );
  }

  public getAllServiceProvider(): Promise<ServiceProviderResponseDto[]> {
    return firstValueFrom(this.businessClient.send("serviceProvider.all", 1));
  }

  public async getServiceProviderById(id: number) {
    return firstValueFrom(
      this.businessClient.send("serviceProvider.findById", id)
    );
  }

  public async getConnectedServiceProvider(
    endpointId: string
  ): Promise<ServiceProviderResponseDto> {
    return firstValueFrom(
      this.businessClient.send(
        "serviceProvider.getConnectedServiceProvider",
        endpointId
      )
    );
  }

  public async getServiceProviderByClientId(
    clientId: string
  ): Promise<ServiceProviderResponseDto> {
    return firstValueFrom(
      this.businessClient.send("serviceProvider.getByClientId", clientId)
    );
  }

  public async getAuthToken(tokenRequest: GetAuthTokenRequest) {
    return firstValueFrom(
      this.businessClient.send(
        "connection.getConnectServiceProviderToken",
        tokenRequest
      )
    );
  }

  public changeRepresentative(data: RequestChangeRepresentativeDto) {
    return firstValueFrom(
      this.businessClient.send(
        "representative.requestChangeRepresentative",
        data
      )
    );
  }

  public cancelChangeRepresentative(endpointId: string) {
    return firstValueFrom(
      this.businessClient.send(
        "representative.cancelChangeRepresentative",
        endpointId
      )
    );
  }

  public getRequestedRepresentative(endpointId: string) {
    return firstValueFrom(
      this.businessClient.send("representative.getRepresentative", endpointId)
    );
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(
      this.businessClient.send(pattern, payload)
    );

    return value;
  }
}
