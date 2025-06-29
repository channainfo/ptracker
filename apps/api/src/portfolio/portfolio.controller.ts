import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto } from './dto/add-holding.dto';

@ApiTags('Portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiResponse({ status: 201, description: 'Portfolio created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @GetUser() user: User,
  ) {
    return this.portfolioService.create(createPortfolioDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all portfolios for the current user' })
  @ApiResponse({ status: 200, description: 'Portfolios retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: User) {
    return this.portfolioService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Portfolio retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.portfolioService.findOne(id, user.id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get portfolio summary with analytics' })
  @ApiParam({ name: 'id', description: 'Portfolio ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Portfolio summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPortfolioSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.portfolioService.getPortfolioSummary(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Portfolio updated successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @GetUser() user: User,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a portfolio (soft delete)' })
  @ApiParam({ name: 'id', description: 'Portfolio ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Portfolio deleted successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.portfolioService.remove(id, user.id);
  }

  @Post(':id/holdings')
  @ApiOperation({ summary: 'Add a holding to a portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio ID', type: 'string' })
  @ApiResponse({ status: 201, description: 'Holding added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addHolding(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addHoldingDto: AddHoldingDto,
    @GetUser() user: User,
  ) {
    return this.portfolioService.addHolding(id, addHoldingDto, user.id);
  }
}