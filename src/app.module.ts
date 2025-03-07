import { AdminModule } from "@admin/admin.module";
import { DatabaseModule } from "@database/database.module";
import { AuthModule } from "@modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MinioModule } from "./minio/minio.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
    }),
    DatabaseModule,
    AdminModule,
    AuthModule,
    MinioModule,
  ],
})
export class AppModule {
  static port: number;
  static apiVersion: string;
  static apiPrefix: string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get("API_PORT");
    AppModule.apiVersion = this.configService.get("API_VERSION");
    AppModule.apiPrefix = this.configService.get("API_PREFIX");
  }
}
