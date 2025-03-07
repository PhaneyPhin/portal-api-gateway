import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorType } from '@common/enums';
import { InvalidCredentialsException, DisabledUserException } from '@common/http/exceptions';
import { UserStatus } from '@admin/access/users/user-status.enum';
import { UserEntity } from '@admin/access/users/user.entity';
import { AuthCredentialsRequestDto, LoginResponseDto, JwtPayload } from '../dtos';
import { UsersRepository } from '@modules/admin/access/users/users.repository';
import { UserMapper } from '@admin/access/users/users.mapper';
import { TokenService } from './token.service';
import { HashHelper } from '@helpers';
import { UsersService } from '@modules/admin/access/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private userService: UsersService,
  ) {}

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({ username, password }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    const user: UserEntity = await this.userService.findUserByUsername(username);

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

    const payload: JwtPayload = { id: user.id, username: user.username };
    const token = await this.tokenService.generateAuthToken(payload);

    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    // const additionalPermissions = permissions.map(({ slug }) => slug);
    const allPermissions = []
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => {
        allPermissions.push(slug)
        return slug
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
    if (! token) {
      throw new UnauthorizedException()
   }

    await this.tokenService.invalidateToken(token, 3600);

    return { message: 'Logout successfully' }
  }
}
