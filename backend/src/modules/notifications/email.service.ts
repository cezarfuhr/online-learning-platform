import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendNotificationEmail(user: User, notification: Notification): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get('APP_NAME') || 'Learning Platform'}" <${this.configService.get('SMTP_FROM')}>`,
        to: user.email,
        subject: notification.title,
        html: this.generateEmailTemplate(user, notification),
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  private generateEmailTemplate(user: User, notification: Notification): string {
    const actionButton = notification.actionUrl
      ? `<a href="${this.configService.get('FRONTEND_URL')}${notification.actionUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #667eea;
                  color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
           View Details
         </a>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🎓 Learning Platform</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;
                    border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">${notification.title}</h2>
          <p style="font-size: 16px; color: #555;">${notification.message}</p>

          ${actionButton}

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

          <p style="font-size: 14px; color: #999;">
            Hi ${user.firstName},<br>
            This is an automated notification from your Learning Platform.
            If you don't want to receive these emails, you can update your notification
            preferences in your account settings.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    try {
      const mailOptions = {
        from: `"Learning Platform" <${this.configService.get('SMTP_FROM')}>`,
        to: user.email,
        subject: 'Welcome to Learning Platform!',
        html: `
          <h1>Welcome, ${user.firstName}!</h1>
          <p>Thank you for joining Learning Platform. We're excited to have you on board!</p>
          <p>Start exploring our courses and begin your learning journey today.</p>
          <a href="${this.configService.get('FRONTEND_URL')}/courses">Browse Courses</a>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Learning Platform" <${this.configService.get('SMTP_FROM')}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }
}
