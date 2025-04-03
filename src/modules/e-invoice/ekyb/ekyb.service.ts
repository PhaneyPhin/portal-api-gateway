import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { EKYBReponseDto } from "../business/dtos/ekyb-response.dto";
import { GDTKYBRequest, MOCKYBRequest } from "../business/dtos/kyb-request.dto";

@Injectable()
export class EKYBService implements OnModuleInit {
  private client: ClientProxy;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("EKYB_HOST", "localhost"),
        port: 3008,
      },
    });
  }

  public async validateGDT(payload: GDTKYBRequest): Promise<EKYBReponseDto> {
    return firstValueFrom(this.client.send("ekyb.validate.taxpayer", payload));
  }

  public async validateMOC(payload: MOCKYBRequest): Promise<EKYBReponseDto> {
    return firstValueFrom(this.client.send("ekyb.validate.business", payload));
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(this.client.send(pattern, payload));

    return value;
  }
}
