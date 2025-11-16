import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentsService } from '@app/core/services/payments.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  @Input() courseId!: string;
  @Input() courseTitle!: string;
  @Input() amount!: number;

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  loading = false;
  error = '';
  success = false;

  constructor(private paymentsService: PaymentsService) {}

  async ngOnInit() {
    this.stripe = await loadStripe(environment.stripePublishableKey);

    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
      });

      this.cardElement.mount('#card-element');

      this.cardElement.on('change', (event) => {
        if (event.error) {
          this.error = event.error.message;
        } else {
          this.error = '';
        }
      });
    }
  }

  async handleSubmit() {
    if (!this.stripe || !this.cardElement) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Create payment intent
      const { clientSecret } = await this.paymentsService
        .createPaymentIntent({
          courseId: this.courseId,
          amount: this.amount,
          paymentMethod: 'credit_card',
          currency: 'usd',
        })
        .toPromise();

      // Confirm payment
      const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.cardElement,
          },
        }
      );

      if (stripeError) {
        this.error = stripeError.message || 'Payment failed';
        this.loading = false;
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await this.paymentsService.confirmPayment(paymentIntent.id).toPromise();
        this.success = true;
        this.loading = false;
      }
    } catch (err: any) {
      this.error = err.error?.message || 'An error occurred';
      this.loading = false;
    }
  }
}
