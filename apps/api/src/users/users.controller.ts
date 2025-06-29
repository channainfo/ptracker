import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ users: User[]; total: number; pages: number }> {
    return this.usersService.findAll(page, Math.min(limit, 100)); // Limit max 100
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: User })
  async getProfile(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    byTier: Record<string, number>;
  }> {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  async updateProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  async deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user (admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activate(@Param('id') id: string): Promise<User> {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}