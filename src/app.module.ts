import { Module } from '@nestjs/common';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { ProductModule } from './product/product.module';
import { ShipmentsModule } from './shipment/shipment.module';
import { PaymentsModule } from './payment/payment.module';
import { TransactionsModule } from './transaction/transaction.module';
import { CustomerModule } from './customer/customer.module';
import { OrderModule } from './order/order.module';


@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, CategoryModule, ManufacturersModule, CustomerModule, OrderModule, ProductModule, ShipmentsModule, PaymentsModule, TransactionsModule],
})
export class AppModule {}