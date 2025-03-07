import { PermissionMapper } from "../permissions/permission.mapper";
import { RoleEntity } from "../roles/role.entity";
import { RoleMapper } from "../roles/role.mapper";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";
import { UserExcelDto } from "./dtos/user-excel.dto";
import { UserEntity } from "./user.entity";
export class UserMapper {
  public static async toDto(entity: UserEntity): Promise<UserResponseDto> {
    const dto = new UserResponseDto();
    console.log("entity", entity.expiredAt);
    dto.id = entity.id;
    dto.username = entity.username;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.createdAt = entity.createdAt;
    dto.status = entity.status;
    dto.isSuperUser = entity.isSuperUser;
    dto.expiredAt = entity.expiredAt || new Date();
    dto.createdBy = entity.createdBy?.name || "System";

    if (entity.createdBy) {
    }
    if (entity.roles) {
      dto.roles = await Promise.all((await entity.roles).map(RoleMapper.toDto));
    }

    return dto;
  }

  public static async toExcelDto(entity: UserEntity): Promise<any> {
    const dto = new UserExcelDto();
    dto.id = entity.id;
    dto.username = entity.username;
    dto.name = entity.name;
    dto.status = entity.status;
    dto.expiredAt = entity.expiredAt;
    dto.createdByName = entity.createdBy?.name;

    return dto;
  }

  public static async toDtoWithRelations(
    entity: UserEntity
  ): Promise<UserResponseDto> {
    const dto = new UserResponseDto();
    console.log("entity", entity);
    dto.id = entity.id;
    dto.username = entity.username;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.expiredAt = entity.expiredAt;
    dto.createdBy = entity.createdBy?.name;
    dto.permissions = await Promise.all(
      (await entity.permissions).map(PermissionMapper.toDto)
    );
    dto.roles = await Promise.all(
      (await entity.roles).map(RoleMapper.toDtoWithRelations)
    );
    dto.isSuperUser = entity.isSuperUser;
    dto.status = entity.status;
    return dto;
  }

  public static toCreateEntity(dto: CreateUserRequestDto): UserEntity {
    const entity = new UserEntity();
    entity.username = dto.username;
    entity.name = dto.name;
    entity.status = dto.status;
    entity.password = dto.password;
    entity.email = dto.email;
    entity.createdBy = dto.createdBy;
    entity.expiredAt = dto.expiredAt;
    // entity.warehouse = dto.warehouse

    entity.roles = Promise.resolve(
      dto.roles.map((id) => new RoleEntity({ id }))
    );
    entity.isSuperUser = false;
    return entity;
  }

  public static toUpdateEntity(
    entity: UserEntity,
    dto: UpdateUserRequestDto
  ): UserEntity {
    entity.username = dto.username;
    entity.name = dto.name;
    entity.status = dto.status;
    entity.email = dto.email;
    entity.createdBy = dto.createdBy;
    entity.expiredAt = dto.expiredAt;

    entity.roles = Promise.resolve(
      dto.roles.map((id) => new RoleEntity({ id }))
    );

    return entity;
  }
}
