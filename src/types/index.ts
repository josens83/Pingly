// Common types for the Pingly application

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  organizationId: string | null
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  website: string | null
  industry: string | null
  timezone: string
}

export interface Contact {
  id: string
  phone: string
  email: string | null
  name: string | null
  firstName: string | null
  lastName: string | null
  company: string | null
  tags: string[]
  customFields: Record<string, unknown> | null
  optInStatus: boolean
  optInDate: Date | null
  optOutDate: Date | null
  source: string | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface ContactGroup {
  id: string
  name: string
  description: string | null
  color: string | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  type: MessageType
  status: CampaignStatus
  content: string
  mediaUrl: string | null
  scheduledAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  clickCount: number
  optOutCount: number
  organizationId: string
  targetGroupId: string | null
  templateId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  type: MessageType
  status: MessageStatus
  content: string
  mediaUrl: string | null
  externalId: string | null
  sentAt: Date | null
  deliveredAt: Date | null
  failedAt: Date | null
  failureReason: string | null
  clickedAt: Date | null
  creditCost: number
  organizationId: string
  contactId: string
  campaignId: string | null
  senderIdId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MessageTemplate {
  id: string
  name: string
  type: MessageType
  content: string
  variables: string[]
  category: string | null
  isApproved: boolean
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface SenderId {
  id: string
  name: string
  senderId: string
  type: SenderIdType
  status: SenderIdStatus
  isDefault: boolean
  verifiedAt: Date | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number
  monthlyCredits: number
  contactLimit: number
  campaignLimit: number
  userLimit: number
  features: string[]
  hasApiAccess: boolean
  hasAdvancedStats: boolean
  hasPrioritySupport: boolean
  isActive: boolean
  sortOrder: number
}

export interface Subscription {
  id: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  cancelledAt: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  organizationId: string
  planId: string
}

export interface CreditBalance {
  id: string
  balance: number
  bonusBalance: number
  lastResetAt: Date
  organizationId: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  credits: number | null
  description: string | null
  stripePaymentId: string | null
  paymentMethod: string | null
  status: PaymentStatus
  organizationId: string
  createdAt: Date
}

export interface ApiKey {
  id: string
  name: string
  key: string
  lastUsedAt: Date | null
  expiresAt: Date | null
  isActive: boolean
  organizationId: string
  createdAt: Date
}

// Enums
export type MessageType =
  | 'SMS'
  | 'LMS'
  | 'MMS'
  | 'RCS'
  | 'KAKAO_ALIMTALK'
  | 'KAKAO_FRIENDTALK'

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'

export type MessageStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CLICKED'
  | 'OPT_OUT'

export type SenderIdType =
  | 'PHONE_NUMBER'
  | 'ALPHANUMERIC'
  | 'SHORT_CODE'

export type SenderIdStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'UNPAID'
  | 'TRIALING'

export type TransactionType =
  | 'SUBSCRIPTION'
  | 'CREDIT_PURCHASE'
  | 'REFUND'
  | 'CREDIT_USAGE'

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface ContactFormData {
  phone: string
  name?: string
  email?: string
  company?: string
  tags?: string[]
  optInStatus: boolean
}

export interface CampaignFormData {
  name: string
  type: MessageType
  content: string
  mediaUrl?: string
  targetGroupId?: string
  templateId?: string
  scheduledAt?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
}
