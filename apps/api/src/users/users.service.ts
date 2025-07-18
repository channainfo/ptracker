import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number; pages: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async findByPendingEmailToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { pendingEmailToken: token },
    });
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { walletAddress },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      loginCount: () => 'login_count + 1',
    });
  }

  async updateTierScores(
    id: string,
    scores: {
      knowledgeScore?: number;
      investmentScore?: number;
      reputationScore?: number;
    },
  ): Promise<User> {
    await this.userRepository.update(id, scores);
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    byTier: Record<string, number>;
  }> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { isActive: true } });
    const verified = await this.userRepository.count({ where: { emailVerified: true } });

    const tierCounts = await this.userRepository
      .createQueryBuilder('user')
      .select('user.tier, COUNT(*) as count')
      .groupBy('user.tier')
      .getRawMany();

    const byTier = tierCounts.reduce((acc, { tier, count }) => {
      acc[tier] = parseInt(count);
      return acc;
    }, {});

    return {
      total,
      active,
      verified,
      byTier,
    };
  }
}