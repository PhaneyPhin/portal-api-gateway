import { ApiProperty } from "@nestjs/swagger";
import { PermissionResponseDto } from "../../permissions/dtos";
import { RoleResponseDto } from "../../roles/dtos";
import { UserApproval } from "../user-approval";
import { UserStatus } from "../user-status.enum";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  expiredAt: Date;

  @ApiProperty({ type: [RoleResponseDto] })
  roles?: RoleResponseDto[];

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions?: PermissionResponseDto[];

  @ApiProperty()
  isSuperUser: boolean;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  approvalStatus: UserApproval;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;
}
