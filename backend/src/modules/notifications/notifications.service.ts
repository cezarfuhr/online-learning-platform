import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });

    const notification = this.notificationRepository.create({
      user,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata,
      actionUrl: dto.actionUrl,
    });

    const saved = await this.notificationRepository.save(notification);

    // Send real-time notification
    await this.notificationsGateway.sendNotificationToUser(dto.userId, saved);

    // TODO: Send email notification if user has email notifications enabled
    // await this.sendEmailNotification(user, saved);

    return saved;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });

    return {
      notifications,
      total,
      page,
      lastPage: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  // Helper methods for common notifications

  async notifyCourseEnrollment(userId: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.COURSE_ENROLLED,
      title: 'Course Enrollment',
      message: `You have successfully enrolled in "${courseTitle}"`,
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId },
    });
  }

  async notifyNewLesson(userId: string, courseTitle: string, lessonTitle: string, courseId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.NEW_LESSON,
      title: 'New Lesson Available',
      message: `A new lesson "${lessonTitle}" has been added to "${courseTitle}"`,
      actionUrl: `/courses/${courseId}`,
      metadata: { courseId, lessonTitle },
    });
  }

  async notifyCertificateGenerated(userId: string, courseTitle: string, certificateId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.CERTIFICATE_GENERATED,
      title: 'Certificate Generated',
      message: `Congratulations! Your certificate for "${courseTitle}" is ready`,
      actionUrl: `/certificates/${certificateId}`,
      metadata: { certificateId },
    });
  }

  async notifyQuizGraded(userId: string, quizTitle: string, score: number, passed: boolean) {
    return this.createNotification({
      userId,
      type: NotificationType.QUIZ_GRADED,
      title: 'Quiz Graded',
      message: `Your quiz "${quizTitle}" has been graded. Score: ${score}%. ${passed ? 'Passed!' : 'Try again!'}`,
      metadata: { quizTitle, score, passed },
    });
  }

  async notifyForumReply(userId: string, postTitle: string, replierName: string, postId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.FORUM_REPLY,
      title: 'New Reply',
      message: `${replierName} replied to your post "${postTitle}"`,
      actionUrl: `/forum/posts/${postId}`,
      metadata: { postId, replierName },
    });
  }

  async notifyPaymentSuccess(userId: string, amount: number, courseTitle: string) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Payment Successful',
      message: `Your payment of $${amount} for "${courseTitle}" was successful`,
      metadata: { amount, courseTitle },
    });
  }

  async notifySubscriptionExpiring(userId: string, daysLeft: number) {
    return this.createNotification({
      userId,
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: 'Subscription Expiring Soon',
      message: `Your subscription will expire in ${daysLeft} days`,
      actionUrl: '/subscription',
      metadata: { daysLeft },
    });
  }

  async notifyNewReview(instructorId: string, studentName: string, courseTitle: string, rating: number) {
    return this.createNotification({
      userId: instructorId,
      type: NotificationType.NEW_REVIEW,
      title: 'New Review',
      message: `${studentName} left a ${rating}-star review on "${courseTitle}"`,
      metadata: { studentName, courseTitle, rating },
    });
  }
}
