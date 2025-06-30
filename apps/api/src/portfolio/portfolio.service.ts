import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioHolding } from './entities/portfolio-holding.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto } from './dto/add-holding.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(PortfolioHolding)
    private holdingRepository: Repository<PortfolioHolding>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createPortfolioDto: CreatePortfolioDto,
    userId: string,
  ): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      userId,
      baseCurrency: createPortfolioDto.baseCurrency || 'USD',
    });

    return this.portfolioRepository.save(portfolio);
  }

  async findAll(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepository.find({
      where: { userId, isActive: true },
      relations: ['holdings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id, userId, isActive: true },
      relations: ['holdings', 'holdings.transactions'],
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return portfolio;
  }

  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
    userId: string,
  ): Promise<Portfolio> {
    const portfolio = await this.findOne(id, userId);
    
    Object.assign(portfolio, updatePortfolioDto);
    return this.portfolioRepository.save(portfolio);
  }

  async remove(id: string, userId: string): Promise<void> {
    const portfolio = await this.findOne(id, userId);
    
    portfolio.isActive = false;
    await this.portfolioRepository.save(portfolio);
  }

  async addHolding(
    portfolioId: string,
    addHoldingDto: AddHoldingDto,
    userId: string,
  ): Promise<PortfolioHolding> {
    const portfolio = await this.findOne(portfolioId, userId);

    // Check if holding already exists
    let holding = await this.holdingRepository.findOne({
      where: {
        portfolioId,
        symbol: addHoldingDto.symbol.toUpperCase(),
        isActive: true,
      },
    });

    const transactionType = addHoldingDto.transactionType || TransactionType.BUY;
    const executedAt = addHoldingDto.executedAt 
      ? new Date(addHoldingDto.executedAt) 
      : new Date();

    // Calculate transaction total
    const total = addHoldingDto.quantity * addHoldingDto.price;
    const fees = addHoldingDto.fees || 0;

    if (!holding) {
      // Create new holding
      holding = this.holdingRepository.create({
        portfolioId,
        symbol: addHoldingDto.symbol.toUpperCase(),
        name: addHoldingDto.name,
        quantity: transactionType === TransactionType.BUY ? addHoldingDto.quantity : 0,
        averagePrice: addHoldingDto.price,
        totalCost: transactionType === TransactionType.BUY ? total + fees : 0,
        source: addHoldingDto.source || 'MANUAL',
      });
    } else {
      // Update existing holding
      await this.updateHoldingFromTransaction(holding, addHoldingDto, transactionType);
    }

    holding = await this.holdingRepository.save(holding);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      holdingId: holding.id,
      symbol: addHoldingDto.symbol.toUpperCase(),
      type: transactionType,
      quantity: addHoldingDto.quantity,
      price: addHoldingDto.price,
      total,
      fees,
      currency: addHoldingDto.currency || 'USD',
      source: addHoldingDto.source || 'MANUAL',
      notes: addHoldingDto.notes,
      executedAt,
    });

    await this.transactionRepository.save(transaction);

    // Update portfolio total value
    await this.updatePortfolioValue(portfolioId);

    return holding;
  }

  async getPortfolioSummary(portfolioId: string, userId: string) {
    const portfolio = await this.findOne(portfolioId, userId);
    
    const holdings = await this.holdingRepository.find({
      where: { portfolioId, isActive: true },
      relations: ['transactions'],
    });

    const totalInvested = holdings.reduce((sum, holding) => sum + Number(holding.totalCost), 0);
    const currentValue = holdings.reduce((sum, holding) => sum + Number(holding.currentValue || holding.totalCost), 0);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      portfolio,
      holdings,
      summary: {
        totalInvested,
        currentValue,
        profitLoss,
        profitLossPercentage,
        holdingsCount: holdings.length,
      },
    };
  }

  private async updateHoldingFromTransaction(
    holding: PortfolioHolding,
    addHoldingDto: AddHoldingDto,
    transactionType: TransactionType,
  ) {
    const newQuantity = addHoldingDto.quantity;
    const newPrice = addHoldingDto.price;
    const fees = addHoldingDto.fees || 0;

    if (transactionType === TransactionType.BUY) {
      // Calculate new average price for buys
      const currentValue = Number(holding.quantity) * Number(holding.averagePrice);
      const newValue = newQuantity * newPrice;
      const totalQuantity = Number(holding.quantity) + newQuantity;
      
      if (totalQuantity > 0) {
        holding.averagePrice = (currentValue + newValue) / totalQuantity;
        holding.quantity = totalQuantity;
        holding.totalCost = Number(holding.totalCost) + newValue + fees;
      }
    } else if (transactionType === TransactionType.SELL) {
      if (Number(holding.quantity) < newQuantity) {
        throw new BadRequestException('Cannot sell more than owned quantity');
      }
      
      holding.quantity = Number(holding.quantity) - newQuantity;
      // Reduce total cost proportionally
      const costReduction = (newQuantity / (Number(holding.quantity) + newQuantity)) * Number(holding.totalCost);
      holding.totalCost = Number(holding.totalCost) - costReduction;
    }
  }

  private async updatePortfolioValue(portfolioId: string) {
    const holdings = await this.holdingRepository.find({
      where: { portfolioId, isActive: true },
    });

    const totalValue = holdings.reduce(
      (sum, holding) => sum + Number(holding.currentValue || holding.totalCost),
      0,
    );

    await this.portfolioRepository.update(portfolioId, { totalValue });
  }
}