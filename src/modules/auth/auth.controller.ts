import { ApiGlobalResponse } from "@common/decorators";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { EKYBService } from "@modules/e-invoice/ekyb/ekyb.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Response } from "express";
import { ExtractJwt } from "passport-jwt";
import { CurrentUser, SkipAuth, TOKEN_NAME } from ".";
import { SkipApprove } from "./decorators/skip-approve";
import { AuthCredentialsRequestDto, ValidateTokenRequestDto } from "./dtos";
import { LoginUrlResponseDto } from "./dtos/login-url.dto";
import { ServiceAccountTest } from "./dtos/service-test.dto";
import { AuthService, TokenService } from "./services";

let HTTP_ONLY_DEFAULT_CONFIG: {
  secure: boolean;
  sameSite: "strict" | "none" | "lax";
} = {
  secure: true, // Ensure cookies are only sent over HTTPS
  sameSite: "strict", // Prevent CSRF
};

@ApiTags("Auth")
@Controller({
  path: "auth/camdigikey",
  version: "1",
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private serviceAccountService: ServiceAccountService,
    private ekybService: EKYBService,
    private readonly configService: ConfigService
  ) {
    if (
      configService.get("ENV") === "development" ||
      configService.get("ENV") === "sandbox"
    ) {
      HTTP_ONLY_DEFAULT_CONFIG = {
        secure: false,
        sameSite: "none",
      };
    }
  }

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/test")
  test(@Body() data: ServiceAccountTest): Promise<any> {
    return this.serviceAccountService.call(data.pattern, data.payload);
  }

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/login")
  getLoginUrl(): Promise<LoginUrlResponseDto> {
    return this.authService.getLoginUrl();
  }

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiOkResponse({ description: "Successfully authenticated user" })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/accessToken")
  async loginWithCamdigkey(
    @Body() body: ValidateTokenRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    if (
      body.username &&
      body.password &&
      this.configService.get("ENV") !== "production"
    ) {
      return this.loginUsernamePassword(body, res);
    }

    const auth = await this.authService.loginWithCamdigkey(body.authToken);

    res.cookie("access_token", auth.token.accessToken, {
      ...HTTP_ONLY_DEFAULT_CONFIG,
      sameSite: "none",
      secure: true,
      httpOnly: true, // this makes it HTTP-only
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    res.cookie("refresh_token", auth.token.refreshToken, {
      httpOnly: true, // this makes it HTTP-only
      secure: true, // set to true in production with HTTPS
      sameSite: "none", // or 'strict' or 'none' based on your requirements
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    const business = await this.serviceAccountService.getBusinessProfile(
      auth.user
    );

    return {
      business: business,
      ...auth,
    };
  }

  @SkipAuth()
  @ApiOperation({ description: "User authentication" })
  @ApiOkResponse({ description: "Successfully authenticated user" })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/sandbox/login")
  async loginUsernamePassword(
    @Body() authRequest: AuthCredentialsRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const auth = await this.authService.loginUserNamePassword(authRequest);
    res.cookie("access_token", auth.token.accessToken, {
      ...HTTP_ONLY_DEFAULT_CONFIG,
      sameSite: "none",
      secure: true,
      httpOnly: true, // this makes it HTTP-only
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    res.cookie("refresh_token", auth.token.refreshToken, {
      httpOnly: true, // this makes it HTTP-only
      sameSite: "none", // or 'strict' or 'none' based on your requirements
      secure: true,
      maxAge: 1000 * 60 * 60 * 24, // expires in 1 day
    });

    const business = await this.serviceAccountService.getBusinessProfile(
      auth.user
    );

    return {
      business: business,
      ...auth,
    };
  }

  // @ApiOperation({ description: "User authentication" })
  // @ApiOkResponse({ description: "Successfully authenticated user" })
  // @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  // @ApiInternalServerErrorResponse({ description: "Server error" })
  // @Post("/login")
  // login(
  //   @Body(ValidationPipe) authCredentialsDto: AuthCredentialsRequestDto
  // ): Promise<LoginResponseDto> {
  //   return this.authService.login(authCredentialsDto);
  // }

  // @ApiOperation({ description: "Renew access in the application" })
  // @ApiOkResponse({ description: "token successfully renewed" })
  // @ApiUnauthorizedResponse({ description: "Refresh token invalid or expired" })
  // @ApiInternalServerErrorResponse({ description: "Server error" })
  // @Post("/token/refresh")
  // async getNewToken(
  //   @Body(ValidationPipe) refreshTokenDto: RefreshTokenRequestDto
  // ): Promise<TokenDto> {
  //   const { refreshToken } = refreshTokenDto;
  //   return this.tokenService.generateRefreshToken(refreshToken);
  // }

  // @ApiOperation({ description: "Validate token" })
  // @ApiOkResponse({ description: "Validation was successful" })
  // @ApiInternalServerErrorResponse({ description: "Server error" })
  // @Post("/token/validate")
  // async validateToken(
  //   @Body(ValidationPipe) validateToken: ValidateTokenRequestDto
  // ): Promise<ValidateTokenResponseDto> {
  //   const { token } = validateToken;
  //   return this.tokenService.validateToken(token);
  // }

  @SkipApprove()
  @ApiOperation({ description: "Get me" })
  @ApiOkResponse({ description: "My data retrived" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @ApiBearerAuth(TOKEN_NAME)
  @Get("/me")
  async me(@CurrentUser() user: UserResponseDto): Promise<any> {
    return user;
  }

  @SkipAuth()
  @ApiOperation({ description: "Validate token" })
  @ApiOkResponse({ description: "Validation was successful" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  // @ApiBearerAuth(TOKEN_NAME)
  @Post("/token/logout")
  async logout(@Req() request: Request): Promise<any> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return this.authService.logout(token);
  }
}
