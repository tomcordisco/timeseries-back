import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PriceService } from 'src/services/price.service';

// Configura el gateway de WebSocket para que permita cualquier origen (CORS) y use el namespace predeterminado
@WebSocketGateway({ namespace: '/', cors: { origin: '*' } })
@Injectable()
export class PriceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // Declara el servidor de WebSocket
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PriceGateway');

  // Inyecta el servicio de precios PriceService a traves del constructor
  constructor(private readonly priceService: PriceService) {}

  // Metodo que se ejecuta al inicializar el gateway
  afterInit(server: Server) {
    this.logger.log('WebSocket Initialized');
  }

  // Metodo que se ejecuta cuando un cliente se conecta al WebSocket
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Inicia la emision de precios enviando datos al cliente conectado
    this.priceService.startEmittingPrices((priceData) => {
      client.emit('priceUpdate', priceData);
    });
  }

  // Metodo que se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Detiene la emision de precios
    this.priceService.stopEmittingPrices();
  }
}
