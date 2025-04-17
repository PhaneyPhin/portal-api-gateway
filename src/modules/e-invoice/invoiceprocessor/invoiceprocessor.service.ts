import { RejectRequestDto } from "@modules/accouting/invoice/dto/reject-request.dto";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { UUID } from "crypto";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { SubmitDocumentRequestDto } from "./dto/submit-document-request.dto";
@Injectable()
export class InvoiceProcessorService implements OnModuleInit {
  private client: ClientProxy;
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get("INVOICE_PROCESSOR_HOST", "localhost"),
        port: 3006,
      },
    });
  }

  findById(id: UUID) {
    return lastValueFrom(this.client.send("invoice-processor.findById", id));
  }
  list(payload) {
    return firstValueFrom(this.client.send("invoice-processor.list", payload));
  }

  accept(documentId) {
    return firstValueFrom(
      this.client.send("invoice-processor.accept", documentId)
    );
  }

  send(documentId) {
    return firstValueFrom(
      this.client.send("invoice-processor.send", documentId)
    );
  }
  reject(payload: RejectRequestDto) {
    return firstValueFrom(
      this.client.send("invoice-processor.reject", payload)
    );
  }

  getXml(documentId) {
    return firstValueFrom(
      this.client.send("invoice-processor.getXml", documentId)
    );
  }

  getPdf(documentId) {
    return firstValueFrom(
      this.client.send("invoice-processor.getPdf", documentId)
    );
  }

  submitDocument(data: SubmitDocumentRequestDto) {
    return firstValueFrom(this.client.send("invoice-processor.submit", data));
  }

  async call(pattern: string, payload: any) {
    const value = await firstValueFrom(this.client.send(pattern, payload));

    return value;
  }

  async emit(pattern: string, payload: any) {
    await firstValueFrom(this.client.emit(pattern, payload));
  }
}
