import { CurrentUser, Permissions, TOKEN_NAME } from '@auth';
import { ApiGlobalResponse } from '@common/decorators';
import { ApiFields } from '@common/decorators/api-fields.decorator';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Post, Put, Res, UploadedFile, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Multer } from 'multer';
import { ChangePasswordRequestDto, CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dtos';
import { UserEntity } from './user.entity';
import { USER_FILTER_FIELD, UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'access/users',
  version: '1',
})
export class UsersController {
  constructor(private usersService: UsersService) { }

  @ApiOperation({ description: 'Get a paginated user list' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiQuery({ name: 'search', type: 'string', required: false, example: 'admin', })
  @ApiQuery({ name: 'expiredAt', type: 'string', required: false, example: '', description: '2024-10-10,2024-10-11' })
  @ApiQuery({ name: 'createdBy', type: 'string', required: false, example: 'admin', })
  @ApiFields(USER_FILTER_FIELD)
  @Permissions('admin.access.users.read', 'admin.access.users.create', 'admin.access.users.update')
  @Get()
  public getUsers(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.usersService.list<UserEntity, UserResponseDto>(pagination);
  }

  @ApiOperation({ description: 'Get all user list form select form' })
  @Permissions('admin.access.users.read', 'admin.access.users.create', 'admin.access.users.update')
  @Get('/select-options')
  public getAllUserForSelect(): Promise<{ id: string, name: string }[]> {
    return this.usersService.getAllUser();
  }

  @ApiOperation({ description: 'Create new user' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions('admin.access.users.create')
  @Post()
  public createUser(@Body() UserDto: CreateUserRequestDto, @CurrentUser() user: UserEntity): Promise<UserResponseDto> {
    UserDto.createdBy = user
    return this.usersService.createUser(UserDto);
  }

  @ApiOperation({ description: 'Update user by id' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: 'User already exists' })
  @Permissions('admin.access.users.update')
  @Put('/:id')
  public updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) UserDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, UserDto);
  }

  @ApiOperation({ description: 'Change user password' })
  @ApiGlobalResponse(UserResponseDto)
  @Post('/change/password')
  changePassword(
    @Body(ValidationPipe) changePassword: ChangePasswordRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<UserResponseDto> {
    return this.usersService.changePassword(changePassword, user.id);
  }

  @ApiOperation({ description: 'Change user password' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions('admin.access.users.update')
  @Post(':id/change/password')
  async changePasswordOfUser(
    @Body(ValidationPipe) changePassword: ChangePasswordRequestDto,
    @Param('id') id: string
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findUserById(id)
    return this.usersService.changePassword(changePassword, user.id);
  }

  @ApiOperation({ summary: 'Export all users to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file containing user data' })
  @Permissions('admin.access.users.export')
  @Get('/export')
  async exportUsers(@Res() res: Response) {
    const fileBuffer = await this.usersService.exportToExcel();
    // Set headers for the Excel file download
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the file buffer as the response
    res.send(fileBuffer);
  }

  @ApiOperation({ summary: 'Import users from an Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Users imported successfully' })
  @ApiBody({
    description: 'Excel file for importing users',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Permissions('admin.access.users.import')
  @UseInterceptors(FileInterceptor('file'))
  @Post('/import')
  async importUsers(@UploadedFile() file: Multer.File, @CurrentUser() currentUser) {
    const createdUsernames = await this.usersService.importFromExcel(file.buffer, currentUser);
    return { message: 'Users imported successfully', createdUsernames };
  }

  @ApiOperation({ description: 'Get user by id' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions('admin.access.users.read', 'admin.access.users.create', 'admin.access.users.update')
  @Get('/:id')
  public getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ description: 'Get user by id' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions('admin.access.users.delete')
  @Delete('/:id')
  public async deleteUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<Boolean> {
    if (user.id === id) {
      throw new HttpException('You can\'t delete yourself', HttpStatus.BAD_REQUEST)
    }
    
    await this.usersService.deleteById(id);

    return true
  }
}
