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
import { User } from '../../users/entities/user.entity';
import { PortfolioHolding } from './portfolio-holding.entity';

@Entity('portfolios')
@Index(['userId', 'isActive'])
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PortfolioHolding, (holding) => holding.portfolio, {
    cascade: true,
  })
  holdings: PortfolioHolding[];

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalValue: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  baseCurrency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    rebalanceFrequency?: 'daily' | 'weekly' | 'monthly';
    allowAlerts?: boolean;
    trackDividends?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}