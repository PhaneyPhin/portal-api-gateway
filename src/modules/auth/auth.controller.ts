import { ApiGlobalResponse } from "@common/decorators";
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ExtractJwt } from "passport-jwt";
import { SkipAuth, TOKEN_NAME } from ".";
import {
  AuthCredentialsRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  TokenDto,
  ValidateTokenRequestDto,
  ValidateTokenResponseDto,
} from "./dtos";
import { LoginUrlResponseDto } from "./dtos/login-url.dto";
import { AuthService, TokenService } from "./services";

@SkipAuth()
@ApiTags("Auth")
@Controller({
  path: "auth",
  version: "1",
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  @ApiOperation({ description: "User authentication" })
  @ApiGlobalResponse(LoginUrlResponseDto)
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Get("/get-login-url")
  getLoginUrl(): Promise<LoginUrlResponseDto> {
    return this.authService.getLoginUrl();
  }

  @ApiOperation({ description: "User authentication" })
  @ApiOkResponse({ description: "Successfully authenticated user" })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/login-with-camdigkey")
  loginWithCamdigkey(@Body() body: ValidateTokenRequestDto): Promise<any> {
    return this.authService.loginWithCamdigkey(body.token);
  }

  @ApiOperation({ description: "User authentication" })
  @ApiOkResponse({ description: "Successfully authenticated user" })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/login")
  login(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsRequestDto
  ): Promise<LoginResponseDto> {
    return this.authService.login(authCredentialsDto);
  }

  @ApiOperation({ description: "Renew access in the application" })
  @ApiOkResponse({ description: "token successfully renewed" })
  @ApiUnauthorizedResponse({ description: "Refresh token invalid or expired" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/token/refresh")
  async getNewToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenRequestDto
  ): Promise<TokenDto> {
    const { refreshToken } = refreshTokenDto;
    return this.tokenService.generateRefreshToken(refreshToken);
  }

  @ApiOperation({ description: "Validate token" })
  @ApiOkResponse({ description: "Validation was successful" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @Post("/token/validate")
  async validateToken(
    @Body(ValidationPipe) validateToken: ValidateTokenRequestDto
  ): Promise<ValidateTokenResponseDto> {
    const { token } = validateToken;
    return this.tokenService.validateToken(token);
  }

  @ApiOperation({ description: "Validate token" })
  @ApiOkResponse({ description: "Validation was successful" })
  @ApiInternalServerErrorResponse({ description: "Server error" })
  @ApiBearerAuth(TOKEN_NAME)
  @Post("/token/logout")
  async logout(@Req() request: Request): Promise<any> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return this.authService.logout(token);
  }
}
