import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * Setup default connection in the application
 * @param config {ConfigService}
 */
ConfigModule.forRoot({
  envFilePath: ".env",
});

const defaultConnection = (config: ConfigService): TypeOrmModuleOptions => ({
  type: "postgres",
  host: config.get("TYPEORM_HOST"),
  port: config.get<number>("TYPEORM_PORT"),
  username: config.get("TYPEORM_USERNAME"),
  password: config.get("TYPEORM_PASSWORD"),
  database: config.get("TYPEORM_DATABASE"),
  autoLoadEntities: false, // Disable autoLoadEntities for glob pattern
  entities: [__dirname + "/../**/*.entity.js"],
  synchronize: config.get<boolean>("TYPEORM_SYNCHRONIZE") === true,
  logging: config.get("TYPEORM_LOGGING") === "true",
});

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: defaultConnection,
    inject: [ConfigService],
  }),
];
