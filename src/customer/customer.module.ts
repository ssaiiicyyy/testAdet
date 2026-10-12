import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomerController } from './customer.controller';
import { DatabaseModule } from '../database/database.module';
import { CustomerService } from './customer.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}



