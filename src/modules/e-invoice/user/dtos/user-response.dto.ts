import { ApiProperty } from "@nestjs/swagger";
import { EntityRole } from "../enums/entity-role.enum";
import { UserApproval } from "../enums/user-approval";
import { UserStatus } from "../enums/UserStatus";
import { PermissionResponseDto } from "./permission";
import { RoleResponseDto } from "./role";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  endpoint_id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  personal_code: string;

  @ApiProperty()
  entity_role: EntityRole;

  @ApiProperty()
  expiredAt: Date;

  @ApiProperty({ type: [RoleResponseDto] })
  roles?: RoleResponseDto[];

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions?: PermissionResponseDto[];

  @ApiProperty()
  is_supper_user: boolean;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  approvalStatus: UserApproval;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  // Missing properties
  @ApiProperty()
  first_name_en: string;

  @ApiProperty()
  first_name_kh: string;

  @ApiProperty()
  last_name_en: string;

  @ApiProperty()
  last_name_kh: string;

  @ApiProperty()
  date_of_birth: Date;

  @ApiProperty()
  mobile_phone: string;

  @ApiProperty()
  logo_url: string;

  @ApiProperty()
  gender: string;
}
