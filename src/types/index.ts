import { Document, Types } from 'mongoose';

// ==========================================
// ENUMS
// ==========================================

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial'
}

export enum ExpenseCategory {
  GROCERIES = 'groceries',
  BILLS = 'bills',
  ENTERTAINMENT = 'entertainment',
  TRANSPORTATION = 'transportation',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  OTHER = 'other'
}

export enum BudgetStatus {
  ACTIVE = 'active',
  EXCEEDED = 'exceeded',
  COMPLETED = 'completed'
}

export enum InvestmentType {
  STOCKS = 'stocks',
  MUTUAL_FUNDS = 'mutualFunds',
  FIXED_DEPOSIT = 'fixedDeposit',
  CRYPTO = 'crypto',
  REAL_ESTATE = 'realEstate',
  GOLD = 'gold'
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// ==========================================
// BASE INTERFACES
// ==========================================

export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document, ITimestamps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  familyId?: Types.ObjectId;
  avatar?: string;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IFamily extends Document, ITimestamps {
  name: string;
  admin: Types.ObjectId;
  members: Types.ObjectId[];
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  limits: {
    maxMembers: number;
    maxTransactionsPerMonth: number;
    maxStorage: number; // in MB
  };
  settings: {
    currency: string;
    budgetAlertThreshold: number;
  };
  invitations: Array<{
    email: string;
    token: string;
    expiresAt: Date;
    sentAt: Date;
  }>;
}

export interface IBudget extends Document, ITimestamps {
  familyId: Types.ObjectId;
  userId: Types.ObjectId;
  month: number;
  year: number;
  totalAmount: number;
  spent: number;
  categories: Array<{
    name: ExpenseCategory;
    allocated: number;
    spent: number;
  }>;
  status: BudgetStatus;
  percentageSpent: number; // virtual
}

export interface IExpense extends Document, ITimestamps {
  familyId: Types.ObjectId;
  userId: Types.ObjectId;
  budgetId?: Types.ObjectId;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  receipt?: {
    url: string;
    key: string;
  };
  tags: string[];
  recurring?: {
    enabled: boolean;
    frequency: RecurringFrequency;
  };
}

export interface IInvestment extends Document, ITimestamps {
  familyId: Types.ObjectId;
  userId: Types.ObjectId;
  type: InvestmentType;
  name: string;
  amount: number;
  purchaseDate: Date;
  currentValue?: number;
  expectedReturn?: number;
  maturityDate?: Date;
  notes?: string;
  roi: number; // virtual
}

export interface IAuditLog extends Document {
  action: string;
  userId: Types.ObjectId;
  familyId: Types.ObjectId;
  data: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ==========================================
// API TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  familyId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  category?: ExpenseCategory;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
}