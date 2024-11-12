import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceGateway } from './gateway/price.gateway';
import { PriceService } from './services/price.service';


@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PriceGateway, PriceService],
})
export class AppModule {}
