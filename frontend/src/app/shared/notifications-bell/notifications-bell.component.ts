import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationsService } from '@app/core/services/notifications.service';
import { AuthService } from '@app/core/services/auth.service';
import { Notification } from '@app/core/models/notification.model';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-bell.component.html',
  styleUrls: ['./notifications-bell.component.css'],
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  notifications$ = this.notificationsService.notifications$;
  unreadCount$ = this.notificationsService.unreadCount$;
  showDropdown = false;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.notificationsService.connect(user.id);
      this.notificationsService.getNotifications(1, 10).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.notificationsService.disconnect();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationsService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe();
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      course_enrolled: '📚',
      new_lesson: '🎓',
      quiz_graded: '📝',
      certificate_generated: '🏆',
      forum_reply: '💬',
      payment_success: '💳',
      new_review: '⭐',
      announcement: '📢',
    };
    return icons[type] || '🔔';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }
}
