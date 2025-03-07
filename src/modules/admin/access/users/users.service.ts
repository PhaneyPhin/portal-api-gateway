import { DBErrorCode } from "@common/enums";
import { InvalidCurrentPasswordException } from "@common/http/exceptions";
import { BaseCrudService } from "@common/services/base-crud.service";
import { HashHelper } from "@helpers";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { handleError } from "@utils/handle-error";
import { validate } from "class-validator";
import { TimeoutError } from "rxjs";
import { Filter, SelectQueryBuilder } from "typeorm";
import * as XLSX from "xlsx";
import {
  ChangePasswordRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";
import { ImportUserDto } from "./dtos/import-user.dto";
import { UserEntity } from "./user.entity";
import { UserMapper } from "./users.mapper";
import { UsersRepository } from "./users.repository";
export const USER_FILTER_FIELD = ["username", "name", "email"];
@Injectable()
export class UsersService extends BaseCrudService {
  protected queryName: string = "users";
  protected FILTER_FIELDS = USER_FILTER_FIELD;
  protected SEARCH_FIELDS = ["username", "name", "email"];

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: UsersRepository
  ) {
    super();
  }

  public findUserByNationalId(nationalId: string) {
    return this.usersRepository.findOneBy({ nationalId });
  }
  /**
   * Convert a UserEntity to a UserResponseDto with relations.
   */
  protected getMapperResponseEntityFields() {
    return UserMapper.toDto;
  }

  /**
   * Customize filter by each field query logic on listing API
   */
  protected getFilters() {
    const filters: { [key: string]: Filter<UserEntity> } = {
      status: (query: SelectQueryBuilder<UserEntity>, value) => {
        return query.andWhere(`${this.queryName}.status IN (:...status)`, {
          status: value.split(","),
        });
      },
      expiredAt: (query, value) => {
        const [start, end] = value.split(" to ");
        return query.andWhere(
          `${this.queryName}.created_at BETWEEN :start AND :end`,
          { start, end }
        );
      },
      createdAt: (query, value) => {
        const [start, end] = value.split(" to ");
        return query.andWhere(
          `${this.queryName}.created_at BETWEEN :start AND :end`,
          { start, end }
        );
      },
      createdBy: (query, value) => {
        return query.where("uc.name ILIKE :createdBy", { createdBy: value });
      },
    };

    return filters;
  }

  /** Require for base query list of feature */
  protected getListQuery() {
    return this.usersRepository
      .createQueryBuilder(this.queryName)
      .leftJoinAndSelect(`${this.queryName}.roles`, "r")
      .leftJoinAndSelect(`${this.queryName}.permissions`, "p")
      .leftJoinAndSelect(`${this.queryName}.createdBy`, "uc");
    // .leftJoinAndSelect('u.warehouse', 'w')
  }

  getAllUser() {
    return this.usersRepository
      .createQueryBuilder("u")
      .select(["id", "name"])
      .getRawMany();
  }

  /**
   * Find user by username
   * @param username {string}
   * @returns Promise<UserEntity | null>
   */
  async findUserByUsername(username: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.roles", "r", "r.active = true")
      .leftJoinAndSelect("r.permissions", "rp", "rp.active = true")
      .leftJoinAndSelect("u.permissions", "p", "p.active = true")
      .leftJoinAndSelect("u.createdBy", "uc")
      .where("u.username = :username", { username })
      .getOne();
  }

  /**
   * Get user by id
   * @param id {string}
   * @returns {Promise<UserResponseDto>}
   */
  public async getUserById(id: string): Promise<UserResponseDto> {
    const userEntity = await this.usersRepository.findOne({
      where: { id },
      relations: ["permissions", "roles", "warehouses"],
    });
    if (!userEntity) {
      throw new NotFoundException();
    }

    return UserMapper.toDtoWithRelations(userEntity);
  }

  /**
   * Create new user
   * @param userDto {CreateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async createUser(
    userDto: CreateUserRequestDto
  ): Promise<UserResponseDto> {
    try {
      let userEntity = UserMapper.toCreateEntity(userDto);
      userEntity.createdBy = { id: userDto.createdBy.id } as any;
      userEntity.password = await HashHelper.encrypt(userEntity.password);

      userEntity = await this.usersRepository.save(userEntity);
      return UserMapper.toDto({ ...userEntity, createdBy: userDto.createdBy });
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        const user = await this.usersRepository.findOne({
          where: [
            {
              username: userDto.username,
            },
            {
              email: userDto.email,
            },
          ],
          withDeleted: true,
        });
        if (user && user.deletedAt) {
          await this.usersRepository.restore(user.id);
          return await this.updateUser(user.id, userDto);
        }
      }
      console.error("Database Error:", error); // ✅ Log full error for debugging

      handleError(error, userDto);
    }
  }

  /**
   * Update User by id
   * @param id {string}
   * @param userDto {UpdateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async updateUser(
    id: string,
    userDto: UpdateUserRequestDto
  ): Promise<UserResponseDto> {
    let userEntity = await this.usersRepository.findOneBy({ id });
    if (!userEntity) {
      throw new NotFoundException();
    }

    try {
      userEntity = UserMapper.toUpdateEntity(userEntity, userDto);
      userEntity = await this.usersRepository.save(userEntity);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      handleError(error, userDto);
    }
  }

  /**
   * Change user password
   * @param changePassword {ChangePasswordRequestDto}
   * @param user {string}
   * @returns {Promise<UserResponseDto>}
   */
  public async changePassword(
    changePassword: ChangePasswordRequestDto,
    userId: string
  ): Promise<UserResponseDto> {
    const { currentPassword, newPassword } = changePassword;

    const userEntity = await this.usersRepository.findOneBy({ id: userId });

    if (!userEntity) {
      throw new NotFoundException();
    }

    const passwordMatch = await HashHelper.compare(
      currentPassword,
      userEntity.password
    );

    if (!passwordMatch) {
      throw new InvalidCurrentPasswordException();
    }

    try {
      userEntity.password = await HashHelper.encrypt(newPassword);
      await this.usersRepository.save(userEntity);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findUserById(id: string) {
    return this.usersRepository.findOneBy({ id: id });
  }

  /**
   * Export all users to Excel
   * @returns Buffer - Excel file buffer
   */
  async exportToExcel(): Promise<Buffer> {
    try {
      const users = await this.getListQuery().getMany();

      // Map data for Excel
      const data = await Promise.all(users.map(UserMapper.toExcelDto));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    } catch (error) {
      console.error("Error exporting users:", error);
      throw new InternalServerErrorException("Failed to export users to Excel");
    }
  }

  /**
   * Import users from Excel
   * @param fileBuffer - Buffer of the uploaded Excel file
   * @returns string[] - List of created usernames
   */
  async importFromExcel(fileBuffer: Buffer, createdBy: UserEntity) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data: Partial<ImportUserDto>[] =
        XLSX.utils.sheet_to_json(worksheet);
      const userDtos: ImportUserDto[] = [];

      for (const row of data) {
        // Map Excel row to DTO
        const userDto = new ImportUserDto();
        Object.assign(userDto, row);

        // Validate DTO
        const errors = await validate(userDto);
        if (errors.length > 0) {
          throw new UnprocessableEntityException({
            message: "Validation failed for one or more users",
            errors,
          });
        }

        userDto.createdBy = { id: createdBy.id } as any;
        userDto.password = await HashHelper.encrypt(userDto.password);

        userDtos.push(userDto);
      }

      const newUsers = this.usersRepository.create(userDtos);
      await this.usersRepository.save(newUsers);
      return "successfully import";
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      console.error("Error importing users:", error);

      throw new BadRequestException("Failed to import users from Excel");
    }
  }

  public async deleteById(id: string) {
    await this.usersRepository.softDelete(id);
  }
}
