# User Tier System - Knowledge & Investment Based

## Overview

CryptoTracker implements a sophisticated tier system that combines knowledge level and investment activity to determine user credibility and community engagement privileges. This system incentivizes learning while recognizing serious investors.

## Tier Structure

### User Tier Matrix
```typescript
interface UserTier {
  // Combined tier based on Knowledge + Investment levels
  overall: 'Novice' | 'Learner' | 'Trader' | 'Expert' | 'Master' | 'Legend';
  
  // Individual component scores
  knowledge: {
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    score: number; // 0-1000 points
  };
  
  investment: {
    level: 'Casual' | 'Active' | 'Serious' | 'Professional';
    score: number; // 0-1000 points
  };
  
  // Community influence
  reputation: {
    score: number; // Based on community engagement
    badges: string[]; // Special achievements
  };
}
```

## Knowledge Level System

### Knowledge Scoring Components
```typescript
interface KnowledgeScoring {
  educationalProgress: {
    coursesCompleted: {
      beginner: 50, // points per course
      intermediate: 100,
      advanced: 200
    };
    
    lessonsCompleted: {
      points: 5, // per lesson
      streakBonus: 10 // consecutive days
    };
    
    quizScores: {
      perfect: 25, // 100% score
      good: 15,    // 80-99%
      pass: 10     // 60-79%
    };
  };
  
  platformActivity: {
    dailyLogin: 2,           // points per day
    weeklyStreak: 20,        // 7 consecutive days
    monthlyStreak: 100,      // 30 consecutive days
    contentCreation: 50,     // educational posts
    helpfulAnswers: 30,      // community Q&A
    tutorialCreation: 200    // user-generated tutorials
  };
  
  certifications: {
    basicCrypto: 100,
    technicalAnalysis: 150,
    deFiSpecialist: 200,
    tradingStrategies: 250,
    blockchainDeveloper: 300
  };
}
```

### Knowledge Level Thresholds
```typescript
const KNOWLEDGE_LEVELS = {
  Beginner: {
    minScore: 0,
    maxScore: 199,
    requirements: [
      'Complete crypto basics course',
      'Pass 5 quizzes with 60%+ score'
    ],
    benefits: [
      'Access to beginner learning paths',
      'Basic community participation',
      'Educational content recommendations'
    ]
  },
  
  Intermediate: {
    minScore: 200,
    maxScore: 499,
    requirements: [
      'Complete 3 intermediate courses',
      'Pass 15 quizzes with 70%+ average',
      '30-day login streak'
    ],
    benefits: [
      'Access to intermediate content',
      'Ability to ask questions in Q&A',
      'Basic portfolio analysis tools',
      'Market sentiment insights'
    ]
  },
  
  Advanced: {
    minScore: 500,
    maxScore: 799,
    requirements: [
      'Complete 2 advanced courses',
      'Pass 25 quizzes with 80%+ average',
      'Create 5 helpful community posts',
      'Complete technical analysis certification'
    ],
    benefits: [
      'Access to advanced trading tools',
      'Ability to answer community questions',
      'Advanced portfolio analytics',
      'Early access to new features',
      'Custom alerts and signals'
    ]
  },
  
  Expert: {
    minScore: 800,
    maxScore: 1000,
    requirements: [
      'Complete all course tracks',
      'Pass 50 quizzes with 85%+ average',
      'Earn 3 certifications',
      'Create educational content',
      'Maintain 90-day activity streak'
    ],
    benefits: [
      'All platform features',
      'Ability to create courses/quizzes',
      'Moderator privileges',
      'API access for advanced users',
      'Direct line to support team',
      'Beta tester for new features'
    ]
  }
};
```

## Investment Level System

### Investment Scoring Components
```typescript
interface InvestmentScoring {
  portfolioValue: {
    tier1: { min: 0, max: 1000, points: 0 },      // $0-1K
    tier2: { min: 1000, max: 10000, points: 50 }, // $1K-10K
    tier3: { min: 10000, max: 50000, points: 150 }, // $10K-50K
    tier4: { min: 50000, max: 250000, points: 300 }, // $50K-250K
    tier5: { min: 250000, max: 1000000, points: 500 }, // $250K-1M
    tier6: { min: 1000000, max: Infinity, points: 700 } // $1M+
  };
  
  tradingActivity: {
    monthlyTrades: {
      points: 2, // per trade
      maxPoints: 100 // cap at 50 trades/month
    },
    
    tradingVolume: {
      tier1: { min: 0, max: 10000, points: 10 },
      tier2: { min: 10000, max: 100000, points: 50 },
      tier3: { min: 100000, max: 500000, points: 150 },
      tier4: { min: 500000, max: Infinity, points: 300 }
    },
    
    profitability: {
      profitable3Months: 100,
      profitable6Months: 200,
      profitable12Months: 300,
      sharpeRatio: { // Additional points based on risk-adjusted returns
        excellent: 150, // Sharpe > 2
        good: 100,      // Sharpe 1-2
        fair: 50        // Sharpe 0.5-1
      }
    }
  };
  
  diversification: {
    assetCount: {
      points: 10, // per unique asset
      maxPoints: 100 // cap at 10 assets
    },
    
    exchangeConnections: {
      points: 25, // per connected exchange
      maxPoints: 100 // cap at 4 exchanges
    },
    
    deFiParticipation: {
      stakingRewards: 50,
      liquidityProviding: 75,
      yieldFarming: 100
    }
  };
  
  riskManagement: {
    stopLossUsage: 50,
    positionSizing: 75,
    riskRewardRatio: 100,
    maxDrawdownControl: 125
  };
}
```

### Investment Level Thresholds
```typescript
const INVESTMENT_LEVELS = {
  Casual: {
    minScore: 0,
    maxScore: 199,
    description: 'Getting started with crypto investing',
    benefits: [
      'Basic portfolio tracking',
      'Educational content access',
      'Simple alerts',
      'Community participation'
    ]
  },
  
  Active: {
    minScore: 200,
    maxScore: 499,
    description: 'Regular trading and portfolio management',
    benefits: [
      'Advanced portfolio analytics',
      'Trading signals',
      'Multi-exchange integration',
      'Enhanced community features',
      'Priority customer support'
    ]
  },
  
  Serious: {
    minScore: 500,
    maxScore: 799,
    description: 'Significant investment and sophisticated strategies',
    benefits: [
      'Professional trading tools',
      'Advanced risk management',
      'Custom alerts and automation',
      'Tax reporting tools',
      'Dedicated account manager',
      'Exclusive investment insights'
    ]
  },
  
  Professional: {
    minScore: 800,
    maxScore: 1000,
    description: 'Institutional-level investment activity',
    benefits: [
      'All platform features',
      'API access with higher limits',
      'Institutional-grade tools',
      'White-glove support',
      'Custom feature development',
      'Revenue sharing opportunities'
    ]
  }
};
```

## Combined Tier System

### Overall Tier Calculation
```typescript
interface TierCalculation {
  // Weighted combination of knowledge and investment
  weights: {
    knowledge: 0.4,    // 40% weight
    investment: 0.5,   // 50% weight
    reputation: 0.1    // 10% weight (community engagement)
  };
  
  // Overall tier mapping
  tiers: {
    Novice: { min: 0, max: 199 },      // Just getting started
    Learner: { min: 200, max: 399 },   // Building knowledge
    Trader: { min: 400, max: 599 },    // Active participant
    Expert: { min: 600, max: 799 },    // Experienced user
    Master: { min: 800, max: 949 },    // Platform expert
    Legend: { min: 950, max: 1000 }    // Top-tier user
  };
}

function calculateOverallTier(user: User): UserTier {
  const knowledgeScore = calculateKnowledgeScore(user);
  const investmentScore = calculateInvestmentScore(user);
  const reputationScore = calculateReputationScore(user);
  
  const overallScore = 
    (knowledgeScore * 0.4) + 
    (investmentScore * 0.5) + 
    (reputationScore * 0.1);
  
  return {
    overall: getTierFromScore(overallScore),
    knowledge: { level: getKnowledgeLevel(knowledgeScore), score: knowledgeScore },
    investment: { level: getInvestmentLevel(investmentScore), score: investmentScore },
    reputation: { score: reputationScore, badges: getUserBadges(user) }
  };
}
```

## Community Engagement Benefits

### Tier-Based Privileges
```typescript
interface CommunityPrivileges {
  Novice: {
    posting: 'Limited (3 posts/day)',
    voting: 'Basic upvote/downvote',
    messaging: 'Public channels only',
    content: 'View all, create basic posts'
  };
  
  Learner: {
    posting: 'Standard (10 posts/day)',
    voting: 'Enhanced voting power (1.2x)',
    messaging: 'Direct messages enabled',
    content: 'Create tutorials and guides'
  };
  
  Trader: {
    posting: 'Increased (25 posts/day)',
    voting: 'Enhanced voting power (1.5x)',
    messaging: 'Group creation allowed',
    content: 'Trading strategy sharing',
    signals: 'Can share trading signals'
  };
  
  Expert: {
    posting: 'High (50 posts/day)',
    voting: 'Strong voting power (2x)',
    messaging: 'Unlimited messaging',
    content: 'Educational content creation',
    moderation: 'Community moderation rights',
    mentorship: 'Can become mentor'
  };
  
  Master: {
    posting: 'Very high (100 posts/day)',
    voting: 'Very strong voting power (3x)',
    messaging: 'Priority messaging',
    content: 'Featured content privileges',
    moderation: 'Advanced moderation tools',
    influence: 'Platform feature input'
  };
  
  Legend: {
    posting: 'Unlimited',
    voting: 'Maximum voting power (5x)',
    messaging: 'VIP messaging features',
    content: 'Spotlight content features',
    moderation: 'Senior moderator status',
    influence: 'Direct product team access',
    exclusive: 'Exclusive Legend-only features'
  };
}
```

### Reputation System
```typescript
interface ReputationScoring {
  communityActions: {
    helpfulPost: 10,          // Post marked as helpful
    expertAnswer: 25,         // Answer marked by Expert+
    tutorialCreation: 100,    // Create educational tutorial
    mentorshipSession: 50,    // Complete mentorship session
    bugReport: 75,            // Valid bug report
    featureSuggestion: 30     // Accepted feature suggestion
  };
  
  socialMetrics: {
    postUpvotes: 2,           // Per upvote received
    followersGained: 5,       // Per new follower
    successfulSignals: 50,    // Trading signal that performed well
    communitySupport: 25      // Helping newcomers
  };
  
  penalties: {
    downvotes: -1,            // Per downvote received
    reportedContent: -50,     // Content reported and removed
    suspensions: -200,        // Account suspension
    spamming: -100           // Detected spam behavior
  };
}
```

## Database Schema

### User Tier Tables
```sql
-- User tier tracking
CREATE TABLE user_tiers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  overall_tier VARCHAR(20) NOT NULL,
  knowledge_level VARCHAR(20) NOT NULL,
  investment_level VARCHAR(20) NOT NULL,
  
  knowledge_score INTEGER DEFAULT 0,
  investment_score INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  
  tier_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge scoring breakdown
CREATE TABLE knowledge_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  quiz_average_score DECIMAL(5,2) DEFAULT 0,
  
  daily_login_streak INTEGER DEFAULT 0,
  max_login_streak INTEGER DEFAULT 0,
  platform_activity_score INTEGER DEFAULT 0,
  
  certifications_earned TEXT[],
  content_created INTEGER DEFAULT 0,
  helpful_answers INTEGER DEFAULT 0,
  
  last_calculated TIMESTAMP DEFAULT NOW()
);

-- Investment scoring breakdown
CREATE TABLE investment_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  current_portfolio_value DECIMAL(15,2) DEFAULT 0,
  max_portfolio_value DECIMAL(15,2) DEFAULT 0,
  monthly_trading_volume DECIMAL(15,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  
  profitable_months INTEGER DEFAULT 0,
  sharpe_ratio DECIMAL(8,4),
  max_drawdown DECIMAL(8,4),
  
  connected_exchanges INTEGER DEFAULT 0,
  unique_assets INTEGER DEFAULT 0,
  defi_participation_score INTEGER DEFAULT 0,
  risk_management_score INTEGER DEFAULT 0,
  
  last_calculated TIMESTAMP DEFAULT NOW()
);

-- User achievements and badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  earned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, badge_type, badge_name)
);

-- Community reputation tracking
CREATE TABLE reputation_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  points_awarded INTEGER NOT NULL,
  reference_id UUID, -- Reference to post, comment, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tier change history
CREATE TABLE tier_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  old_tier VARCHAR(20),
  new_tier VARCHAR(20),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Services

### Tier Calculation Service
```typescript
@Injectable()
export class UserTierService {
  constructor(
    @InjectRepository(UserTier)
    private userTierRepository: Repository<UserTier>,
    @InjectRepository(KnowledgeScore)
    private knowledgeRepository: Repository<KnowledgeScore>,
    @InjectRepository(InvestmentScore)
    private investmentRepository: Repository<InvestmentScore>
  ) {}

  async calculateKnowledgeScore(userId: string): Promise<number> {
    const knowledge = await this.knowledgeRepository.findOne({ 
      where: { userId } 
    });
    
    if (!knowledge) return 0;

    let score = 0;
    
    // Educational progress
    score += knowledge.coursesCompleted * 100;
    score += knowledge.lessonsCompleted * 5;
    score += knowledge.quizzesPassedCount * 15;
    
    // Platform activity
    score += Math.min(knowledge.dailyLoginStreak * 2, 200); // Cap at 100 days
    score += knowledge.contentCreated * 50;
    score += knowledge.helpfulAnswers * 30;
    
    // Certifications
    score += knowledge.certificationsEarned.length * 150;
    
    return Math.min(score, 1000); // Cap at 1000
  }

  async calculateInvestmentScore(userId: string): Promise<number> {
    const investment = await this.investmentRepository.findOne({ 
      where: { userId } 
    });
    
    if (!investment) return 0;

    let score = 0;
    
    // Portfolio value scoring
    const portfolioValue = investment.currentPortfolioValue;
    if (portfolioValue >= 1000000) score += 700;
    else if (portfolioValue >= 250000) score += 500;
    else if (portfolioValue >= 50000) score += 300;
    else if (portfolioValue >= 10000) score += 150;
    else if (portfolioValue >= 1000) score += 50;
    
    // Trading activity
    score += Math.min(investment.totalTrades * 2, 100);
    
    // Performance metrics
    if (investment.profitableMonths >= 12) score += 300;
    else if (investment.profitableMonths >= 6) score += 200;
    else if (investment.profitableMonths >= 3) score += 100;
    
    // Sharpe ratio bonus
    if (investment.sharpeRatio > 2) score += 150;
    else if (investment.sharpeRatio > 1) score += 100;
    else if (investment.sharpeRatio > 0.5) score += 50;
    
    // Diversification
    score += Math.min(investment.uniqueAssets * 10, 100);
    score += Math.min(investment.connectedExchanges * 25, 100);
    score += investment.defiParticipationScore;
    score += investment.riskManagementScore;
    
    return Math.min(score, 1000); // Cap at 1000
  }

  async updateUserTier(userId: string): Promise<UserTier> {
    const knowledgeScore = await this.calculateKnowledgeScore(userId);
    const investmentScore = await this.calculateInvestmentScore(userId);
    const reputationScore = await this.calculateReputationScore(userId);
    
    const overallScore = 
      (knowledgeScore * 0.4) + 
      (investmentScore * 0.5) + 
      (reputationScore * 0.1);
    
    const overallTier = this.getTierFromScore(overallScore);
    const knowledgeLevel = this.getKnowledgeLevelFromScore(knowledgeScore);
    const investmentLevel = this.getInvestmentLevelFromScore(investmentScore);
    
    // Update or create user tier
    let userTier = await this.userTierRepository.findOne({ 
      where: { userId } 
    });
    
    const oldTier = userTier?.overallTier;
    
    if (!userTier) {
      userTier = this.userTierRepository.create({
        userId,
        overallTier,
        knowledgeLevel,
        investmentLevel,
        knowledgeScore,
        investmentScore,
        reputationScore
      });
    } else {
      userTier.overallTier = overallTier;
      userTier.knowledgeLevel = knowledgeLevel;
      userTier.investmentLevel = investmentLevel;
      userTier.knowledgeScore = knowledgeScore;
      userTier.investmentScore = investmentScore;
      userTier.reputationScore = reputationScore;
      userTier.tierUpdatedAt = new Date();
    }
    
    await this.userTierRepository.save(userTier);
    
    // Log tier change if applicable
    if (oldTier && oldTier !== overallTier) {
      await this.logTierChange(userId, oldTier, overallTier);
      await this.sendTierUpgradeNotification(userId, overallTier);
    }
    
    return userTier;
  }

  private getTierFromScore(score: number): string {
    if (score >= 950) return 'Legend';
    if (score >= 800) return 'Master';
    if (score >= 600) return 'Expert';
    if (score >= 400) return 'Trader';
    if (score >= 200) return 'Learner';
    return 'Novice';
  }

  private getKnowledgeLevelFromScore(score: number): string {
    if (score >= 800) return 'Expert';
    if (score >= 500) return 'Advanced';
    if (score >= 200) return 'Intermediate';
    return 'Beginner';
  }

  private getInvestmentLevelFromScore(score: number): string {
    if (score >= 800) return 'Professional';
    if (score >= 500) return 'Serious';
    if (score >= 200) return 'Active';
    return 'Casual';
  }
}
```

### Event-Based Scoring
```typescript
@Injectable()
export class TierEventService {
  constructor(
    private userTierService: UserTierService,
    @InjectQueue('tier-calculation') private tierQueue: Queue
  ) {}

  // Listen to various platform events
  @OnEvent('course.completed')
  async handleCourseCompleted(event: { userId: string, courseId: string }) {
    await this.tierQueue.add('update-knowledge-score', {
      userId: event.userId,
      event: 'course_completed',
      courseId: event.courseId
    });
  }

  @OnEvent('quiz.passed')
  async handleQuizPassed(event: { userId: string, quizId: string, score: number }) {
    await this.tierQueue.add('update-knowledge-score', {
      userId: event.userId,
      event: 'quiz_passed',
      score: event.score
    });
  }

  @OnEvent('trade.executed')
  async handleTradeExecuted(event: { userId: string, tradeValue: number }) {
    await this.tierQueue.add('update-investment-score', {
      userId: event.userId,
      event: 'trade_executed',
      value: event.tradeValue
    });
  }

  @OnEvent('post.upvoted')
  async handlePostUpvoted(event: { userId: string, postId: string }) {
    await this.tierQueue.add('update-reputation-score', {
      userId: event.userId,
      event: 'post_upvoted',
      points: 2
    });
  }
}
```

## Gamification Features

### Badges and Achievements
```typescript
const BADGES = {
  knowledge: {
    firstSteps: { name: 'First Steps', description: 'Complete your first lesson' },
    quizMaster: { name: 'Quiz Master', description: 'Pass 50 quizzes' },
    perfectScore: { name: 'Perfect Score', description: 'Get 100% on 10 quizzes' },
    educator: { name: 'Educator', description: 'Create educational content' },
    mentor: { name: 'Mentor', description: 'Help 10 community members' }
  },
  
  investment: {
    firstTrade: { name: 'First Trade', description: 'Execute your first trade' },
    diversified: { name: 'Diversified', description: 'Hold 10+ different assets' },
    profitable: { name: 'Profitable', description: '6 consecutive profitable months' },
    riskManager: { name: 'Risk Manager', description: 'Maintain low drawdown' },
    whaleSpotter: { name: 'Whale Spotter', description: 'Portfolio value $1M+' }
  },
  
  community: {
    helpful: { name: 'Helpful', description: '100 helpful posts' },
    popular: { name: 'Popular', description: '1000 post upvotes' },
    influencer: { name: 'Influencer', description: '500 followers' },
    moderator: { name: 'Moderator', description: 'Community moderation rights' }
  }
};
```

This comprehensive tier system creates strong incentives for both learning and investing while establishing clear community hierarchies based on expertise and contribution.