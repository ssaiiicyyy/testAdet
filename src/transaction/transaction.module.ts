import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TransactionsService } from './transaction.service';
import { TransactionsController } from './transaction.controller';
import { DatabaseModule } from '../database/database.module';
import { UsersController } from '../users/user.controller';
import { UsersService } from '../users/user.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}