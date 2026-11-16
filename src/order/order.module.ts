import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../database/database.module';
import {OrderService} from './order.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}



