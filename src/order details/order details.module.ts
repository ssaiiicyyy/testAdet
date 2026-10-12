import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrderDetailsController } from './order details.controller';
import { DatabaseModule } from '../database/database.module';
import { OrderDetailsService } from './order details.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}



