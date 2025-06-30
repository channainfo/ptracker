import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Transaction } from './transaction.entity';

@Entity('portfolio_holdings')
@Index(['portfolioId', 'symbol'])
@Index(['symbol', 'isActive'])
export class PortfolioHolding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.holdings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  averagePrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  currentPrice?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  currentValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  profitLoss?: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  profitLossPercentage?: number;

  @Column({ type: 'varchar', length: 20, default: 'MANUAL' })
  source: string; // MANUAL, BINANCE, COINBASE, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  externalId?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdate?: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.holding)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}