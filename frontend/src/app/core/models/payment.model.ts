export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  course: {
    id: string;
    title: string;
  };
  createdAt: Date;
  paidAt?: Date;
}

export interface Subscription {
  id: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
  amount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
}

export interface CreatePaymentRequest {
  courseId: string;
  paymentMethod: string;
  amount: number;
  currency?: string;
}
