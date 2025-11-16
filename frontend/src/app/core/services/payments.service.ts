import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Payment, Subscription, CreatePaymentRequest } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPaymentIntent(data: CreatePaymentRequest): Observable<{ clientSecret: string; payment: Payment }> {
    return this.http.post<{ clientSecret: string; payment: Payment }>(
      `${this.apiUrl}/create-intent`,
      data
    );
  }

  confirmPayment(paymentIntentId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/confirm/${paymentIntentId}`, {});
  }

  requestRefund(paymentId: string, reason?: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/refund/${paymentId}`, { reason });
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/my-payments`);
  }

  createSubscription(plan: 'basic' | 'pro' | 'enterprise'): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, { plan });
  }

  cancelSubscription(subscriptionId: string): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${this.apiUrl}/subscriptions/${subscriptionId}/cancel`,
      {}
    );
  }

  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/my-subscription`);
  }
}
