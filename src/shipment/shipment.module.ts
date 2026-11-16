import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ShipmentsService } from './shipment.service';
import { ShipmentsController } from './shipment.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}



