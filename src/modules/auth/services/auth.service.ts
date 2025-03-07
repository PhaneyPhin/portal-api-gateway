import { UserStatus } from "@admin/access/users/user-status.enum";
import { UserEntity } from "@admin/access/users/user.entity";
import { UserMapper } from "@admin/access/users/users.mapper";
import { ErrorType } from "@common/enums";
import {
  DisabledUserException,
  InvalidCredentialsException,
} from "@common/http/exceptions";
import { HashHelper } from "@helpers";
import { UsersService } from "@modules/admin/access/users/users.service";
import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import {
  AuthCredentialsRequestDto,
  JwtPayload,
  LoginResponseDto,
} from "../dtos";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private tokenService: TokenService,
    private userService: UsersService,
    private configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.axiosInstance = this.httpService.axiosRef; // Get Axios instance
    this.axiosInstance.defaults.baseURL =
      this.configService.get("CAMDIGKEY_URL");
  }

  public async getLoginUrl(): Promise<any> {
    const result = await this.axiosInstance.get("/get-login-url");

    return result.data?.data;
  }

  protected async getCamdigkeyUser(authToken: string) {
    try {
      const result = await this.axiosInstance.post("/get-user-login", {
        authToken: authToken,
      });
      return result.data?.payload?.data;
    } catch (e) {
      throw new UnauthorizedException("Invalid auth token");
    }
  }

  public async loginWithCamdigkey(authToken: string) {
    const userCamdigikey = await this.getCamdigkeyUser(authToken);

    const user = await this.userService.findUserByNationalId(
      userCamdigikey.personal_code
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      nationalId: user.nationalId,
    };
    const token = await this.tokenService.generateAuthToken(payload);

    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    // const additionalPermissions = permissions.map(({ slug }) => slug);
    const allPermissions = [];
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => {
        allPermissions.push(slug);
        return slug;
      });
      return {
        name,
        permissions: rolePermissions,
      };
    });

    return {
      user: userDto,
      token,
      access: {
        allPermissions: allPermissions,
        roles: mappedRoles,
      },
    };
  }

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({
    username,
    password,
  }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    const user: UserEntity = await this.userService.findUserByUsername(
      username
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatch = await HashHelper.compare(password, user.password);

    if (!passwordMatch) {
      throw new InvalidCredentialsException();
    }
    if (user.status == UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BlockedUser);
    }
    if (user.status == UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      nationalId: user.nationalId,
    };
    const token = await this.tokenService.generateAuthToken(payload);

    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    // const additionalPermissions = permissions.map(({ slug }) => slug);
    const allPermissions = [];
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => {
        allPermissions.push(slug);
        return slug;
      });
      return {
        name,
        permissions: rolePermissions,
      };
    });

    return {
      user: userDto,
      token,
      access: {
        allPermissions: allPermissions,
        roles: mappedRoles,
      },
    };
  }
  async logout(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    await this.tokenService.invalidateToken(token, 3600);

    return { message: "Logout successfully" };
  }
}
