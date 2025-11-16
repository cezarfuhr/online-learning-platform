import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { Notification, NotificationResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private socket: Socket;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(`${environment.apiUrl}/notifications`, {
      transports: ['websocket'],
      autoConnect: false,
    });

    this.setupSocketListeners();
  }

  connect(userId: string): void {
    this.socket.connect();
    this.socket.emit('authenticate', { userId });
    this.loadUnreadCount();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  private setupSocketListeners(): void {
    this.socket.on('notification', (notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    });

    this.socket.on('broadcast', (notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });
  }

  getNotifications(page = 1, limit = 20): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<NotificationResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.notificationsSubject.next(response.notifications);
        this.unreadCountSubject.next(response.unreadCount);
      })
    );
  }

  loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe(response => {
      this.unreadCountSubject.next(response.count);
    });
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const notification = current.find(n => n.id === notificationId);
        const updated = current.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updated);

        if (notification && !notification.isRead) {
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }
      })
    );
  }
}
