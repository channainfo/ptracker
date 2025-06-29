import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { PortfolioHolding } from './portfolio-holding.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  DIVIDEND = 'DIVIDEND',
  STAKING_REWARD = 'STAKING_REWARD',
}

@Entity('transactions')
@Index(['holdingId', 'type'])
@Index(['executedAt'])
@Index(['symbol', 'executedAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  holdingId: string;

  @ManyToOne(() => PortfolioHolding, (holding) => holding.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'holdingId' })
  holding: PortfolioHolding;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  total: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0 })
  fees: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'MANUAL' })
  source: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalId?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  notes?: string;

  @Column({ type: 'timestamp' })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}