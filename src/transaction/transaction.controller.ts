import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  TransactionsService,
  type CreateTransactionData,
  type UpdateTransactionData,
} from './transaction.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isCreateTransactionData(
  body: unknown,
): body is CreateTransactionData {
  return (
    isRecord(body) &&
    typeof body.transaction_code === 'string' &&
    body.transaction_code.trim().length > 0 &&
    isPositiveInteger(body.order_id) &&
    isPositiveInteger(body.payment_id)
  );
}

function isUpdateTransactionData(
  body: unknown,
): body is UpdateTransactionData {
  return (
    isRecord(body) &&
    (body.transaction_code === undefined ||
      (typeof body.transaction_code === 'string' &&
        body.transaction_code.trim().length > 0)) &&
    (body.order_id === undefined || isPositiveInteger(body.order_id)) &&
    (body.payment_id === undefined || isPositiveInteger(body.payment_id))
  );
}

@Controller(['transaction', 'transactions'])
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.transactionsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.transactionsService.findById(+id);
  }

  @Post()
  create(@Body() body: unknown) {
    if (!isCreateTransactionData(body)) {
      throw new BadRequestException(
        'transaction_code, positive order_id, and positive payment_id are required',
      );
    }
    return this.transactionsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    if (!isUpdateTransactionData(body)) {
      throw new BadRequestException('Invalid transaction update fields');
    }
    return this.transactionsService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
