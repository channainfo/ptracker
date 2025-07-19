import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * 📚 LEARNING: TypeORM Entity
 * 
 * An Entity in TypeORM represents a database table. It's a class that's
 * decorated with @Entity() and defines the structure of your data.
 * 
 * Key Concepts:
 * - @Entity() - Marks this class as a database table
 * - @Column() - Defines table columns with their properties
 * - @PrimaryGeneratedColumn() - Auto-generated primary key
 * - @Index() - Creates database indexes for performance
 * - @Exclude() - Hides sensitive fields from API responses
 */

/**
 * 📚 LEARNING: TypeScript Enums
 * 
 * Enums define a set of named constants. They're perfect for
 * representing fixed sets of values like user roles or tiers.
 * 
 * Benefits:
 * - Type safety - prevents invalid values
 * - Autocomplete support in IDEs
 * - Self-documenting code
 * - Easy to refactor if values change
 */
export enum UserRole {
  USER = 'user',        // Regular users with basic permissions
  MODERATOR = 'moderator', // Can moderate content and users
  ADMIN = 'admin',      // Full system access
}

export enum UserTier {
  NOVICE = 'novice',    // New to investing/trading
  LEARNER = 'learner',  // Learning the basics
  TRADER = 'trader',    // Active trading
  EXPERT = 'expert',    // Advanced knowledge
  MASTER = 'master',    // Professional level
  LEGEND = 'legend',    // Elite tier
}

/**
 * 📚 LEARNING: Entity Decorators and Indexes
 * 
 * @Entity('users') - Creates a table named 'users'
 * @Index() - Creates database indexes for faster queries
 * 
 * Indexes explained:
 * - Unique indexes prevent duplicate values
 * - Partial indexes (with WHERE clause) only apply when condition is met
 * - This allows multiple NULL values while enforcing uniqueness for non-NULL
 */
@Entity('users')
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
@Index(['walletAddress'], { unique: true, where: 'wallet_address IS NOT NULL' })
export class User {
  /**
   * 📚 LEARNING: Primary Key
   * 
   * @PrimaryGeneratedColumn('uuid') creates a UUID primary key
   * - UUIDs are globally unique identifiers
   * - More secure than auto-incrementing integers
   * - Harder to guess or enumerate user IDs
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 📚 LEARNING: Nullable Unique Columns
   * 
   * Email is unique but nullable because users can sign up with:
   * - Email + password (traditional)
   * - Wallet address only (Web3)
   * - Social login (Google, Facebook, etc.)
   */
  @Column({ unique: true, nullable: true })
  email?: string;

  /**
   * 📚 LEARNING: Sensitive Data Protection
   * 
   * @Exclude() prevents password from being serialized in API responses
   * - Passwords should NEVER be returned to frontend
   * - This is a security best practice
   * - Nullable because some users login with wallet only
   */
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

  @Column({ name: 'pending_email', nullable: true })
  @Exclude()
  pendingEmail?: string;

  @Column({ name: 'pending_email_token', nullable: true })
  @Exclude()
  pendingEmailToken?: string;

  @Column({ name: 'pending_email_expiry', type: 'timestamp', nullable: true })
  @Exclude()
  pendingEmailExpiry?: Date;

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