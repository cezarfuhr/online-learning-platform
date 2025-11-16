import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<{ clientSecret: string; payment: Payment }> {
    const course = await this.courseRepository.findOne({
      where: { id: createPaymentDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Calculate platform fee (10%)
    const platformFee = createPaymentDto.amount * 0.1;
    const instructorAmount = createPaymentDto.amount - platformFee;

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(createPaymentDto.amount * 100), // Convert to cents
      currency: createPaymentDto.currency || 'usd',
      metadata: {
        userId: user.id,
        courseId: course.id,
        ...createPaymentDto.metadata,
      },
    });

    // Create payment record
    const payment = this.paymentRepository.create({
      user,
      course,
      amount: createPaymentDto.amount,
      platformFee,
      instructorAmount,
      paymentMethod: createPaymentDto.paymentMethod,
      stripePaymentIntentId: paymentIntent.id,
      currency: createPaymentDto.currency || 'usd',
      status: PaymentStatus.PENDING,
      metadata: createPaymentDto.metadata,
    });

    await this.paymentRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret,
      payment,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.stripeChargeId = paymentIntent.latest_charge as string;
    } else {
      payment.status = PaymentStatus.FAILED;
    }

    return this.paymentRepository.save(payment);
  }

  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Create refund in Stripe
    await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    payment.refundReason = reason;

    return this.paymentRepository.save(payment);
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Subscription methods
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    user: User,
  ): Promise<Subscription> {
    // Get or create Stripe customer
    let customerId = await this.getOrCreateStripeCustomer(user);

    // Get plan pricing
    const planPrices = {
      [SubscriptionPlan.BASIC]: 9.99,
      [SubscriptionPlan.PRO]: 29.99,
      [SubscriptionPlan.ENTERPRISE]: 99.99,
    };

    const amount = planPrices[createSubscriptionDto.plan];

    // Create Stripe subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${createSubscriptionDto.plan.toUpperCase()} Plan`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Create subscription record
    const subscription = this.subscriptionRepository.create({
      user,
      plan: createSubscriptionDto.plan,
      amount,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: customerId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      autoRenew: true,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancel in Stripe
    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    return this.subscriptionRepository.save(subscription);
  }

  async getUserSubscription(userId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  private async getOrCreateStripeCustomer(user: User): Promise<string> {
    // Check if user already has a Stripe customer ID
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingSubscription?.stripeCustomerId) {
      return existingSubscription.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    return customer.id;
  }

  // Webhook handler
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.confirmPayment(paymentIntent.id);
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = stripeSubscription.status as SubscriptionStatus;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      await this.subscriptionRepository.save(subscription);
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      await this.subscriptionRepository.save(subscription);
    }
  }
}
