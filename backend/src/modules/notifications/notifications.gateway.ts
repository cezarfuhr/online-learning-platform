import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from all user mappings
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    payload: { userId: string },
  ) {
    const { userId } = payload;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId).add(client.id);
    client.join(`user:${userId}`);

    return { success: true, message: 'Authenticated successfully' };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    payload: { notificationId: string },
  ) {
    await this.notificationsService.markAsRead(payload.notificationId);
    return { success: true };
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
    payload: { userId: string },
  ) {
    await this.notificationsService.markAllAsRead(payload.userId);
    return { success: true };
  }

  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  async broadcastNotification(notification: any) {
    this.server.emit('broadcast', notification);
  }
}
