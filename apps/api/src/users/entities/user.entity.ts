import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum UserTier {
  NOVICE = 'novice',
  LEARNER = 'learner',
  TRADER = 'trader',
  EXPERT = 'expert',
  MASTER = 'master',
  LEGEND = 'legend',
}

@Entity('users')
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
@Index(['walletAddress'], { unique: true, where: 'wallet_address IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'wallet_address', unique: true, nullable: true })
  walletAddress?: string;

  @Column({ name: 'wallet_network', nullable: true })
  walletNetwork?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserTier,
    default: UserTier.NOVICE,
  })
  tier: UserTier;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  @Exclude()
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true })
  @Exclude()
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expiry', type: 'timestamp', nullable: true })
  @Exclude()
  passwordResetExpiry?: Date;

  @Column({ name: 'refresh_token', nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ name: 'auth_provider', nullable: true })
  authProvider?: string;

  @Column({ name: 'auth_provider_id', nullable: true })
  authProviderId?: string;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ name: 'notification_preferences', type: 'jsonb', nullable: true })
  notificationPreferences?: Record<string, any>;

  @Column({ name: 'privacy_settings', type: 'jsonb', nullable: true })
  privacySettings?: Record<string, any>;

  @Column({ name: 'knowledge_score', default: 0 })
  knowledgeScore: number;

  @Column({ name: 'investment_score', default: 0 })
  investmentScore: number;

  @Column({ name: 'reputation_score', default: 0 })
  reputationScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields - using methods instead of getters to avoid TypeORM issues
  getFullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || 'Anonymous';
  }

  getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return this.getFullName();
    }
    if (this.email) {
      return this.email.split('@')[0];
    }
    if (this.walletAddress) {
      return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
    }
    return 'Anonymous';
  }
}