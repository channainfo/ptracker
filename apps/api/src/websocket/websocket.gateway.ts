import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: true, // Allow all origins for development
    credentials: true,
  },
  namespace: '/',
})
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from query or headers
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          client.data.user = payload;
          this.logger.log(`Authenticated client connected: ${payload.email}`);
        } catch (error) {
          this.logger.warn(`Invalid token from client ${client.id}`);
          // Still allow connection for public features
        }
      }

      this.connectedClients.set(client.id, client);
      this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);

      // Send welcome message
      client.emit('connected', {
        message: 'Connected to CryptoTracker WebSocket',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    client.emit('joined-room', { room: data.room });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
    client.emit('left-room', { room: data.room });
  }

  // Utility methods for broadcasting
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  sendToUser(userId: string, event: string, data: any) {
    // Find client by user ID (would need to store user ID mapping)
    for (const [clientId, client] of this.connectedClients) {
      if (client.data.user?.sub === userId) {
        client.emit(event, data);
        break;
      }
    }
  }

  // Market data broadcasting
  broadcastMarketData(data: any) {
    this.broadcastToRoom('market-data', 'market-update', data);
  }

  // Portfolio updates
  broadcastPortfolioUpdate(userId: string, data: any) {
    this.sendToUser(userId, 'portfolio-update', data);
  }

  // System notifications
  broadcastSystemNotification(data: any) {
    this.broadcastToAll('system-notification', data);
  }
}