import { BaseEntity } from "@database/entities";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { PermissionEntity } from "../permissions/permission.entity";
import { RoleEntity } from "../roles/role.entity";
import { UserStatus } from "./user-status.enum";

@Entity({ schema: "admin", name: "users" })
export class UserEntity extends BaseEntity {
  @PrimaryColumn({ name: "id", type: "uuid", generated: "uuid" })
  id?: string;

  @Column({
    name: "username",
    type: "varchar",
    unique: true,
  })
  username: string;

  @Column({
    name: "personal_code",
    type: "varchar",
    unique: true,
  })
  nationalId: string;

  @Column({
    name: "name",
    type: "varchar",
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    name: "email",
    type: "varchar",
    unique: true,
  })
  email: string;

  @Column({
    name: "password",
    type: "varchar",
    nullable: false,
  })
  password: string;

  @Column({
    name: "is_super_user",
    type: "boolean",
    nullable: false,
    default: false,
  })
  isSuperUser: boolean;

  @Column({
    name: "status",
    type: "enum",
    enum: UserStatus,
    nullable: false,
  })
  status: UserStatus;

  @Column({
    name: "expired_at",
    type: "timestamp",
    nullable: true,
  })
  expiredAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // New created_by column
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdBy: UserEntity;

  // Relation for the users created by this user
  @OneToMany(() => UserEntity, (user) => user.createdBy)
  createdUsers: UserEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.id, {
    lazy: true,
    cascade: true,
  })
  @JoinTable({
    name: "users_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
  })
  roles: Promise<RoleEntity[]>;

  @ManyToMany(() => PermissionEntity, (permission) => permission.id, {
    lazy: true,
    cascade: true,
  })
  @JoinTable({
    name: "users_permissions",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "permission_id",
      referencedColumnName: "id",
    },
  })
  permissions: Promise<PermissionEntity[]>;

  @DeleteDateColumn({ name: "deleted_at" }) // Automatically managed by TypeORM for soft deletes
  deletedAt?: Date; // Optional, null if not deleted

  constructor(user?: Partial<UserEntity>) {
    super();
    Object.assign(this, user);
  }
}
