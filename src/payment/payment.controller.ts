import {BadRequestException,Body,Controller, Delete, Get, Param,Post,Put,UseGuards,} from '@nestjs/common';
import {PaymentsService,type CreatePaymentData, type UpdatePaymentData} from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPaymentData(body: unknown): body is CreatePaymentData {
  return (
    isRecord(body) &&
    typeof body.payment_method === 'string' &&
    body.payment_method.trim().length > 0 &&
    typeof body.order_id === 'number' &&
    Number.isInteger(body.order_id) &&
    body.order_id > 0
  );
}

function isValidPaymentUpdate(body: unknown): body is UpdatePaymentData {
  return (
    isRecord(body) &&
    (body.payment_method === undefined ||
      (typeof body.payment_method === 'string' &&
        body.payment_method.trim().length > 0)) &&
    (body.order_id === undefined ||
      (typeof body.order_id === 'number' &&
        Number.isInteger(body.order_id) &&
        body.order_id > 0))
  );
}

@Controller(['payment', 'payments'])
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Get all payments (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.paymentsService.getAll();
  }

  // Get single payment by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentsService.findById(+id);
  }

  // Create payment (open - for demo)
  @Post()
  async create(@Body() body: unknown) {
    if (!isValidPaymentData(body)) {
      throw new BadRequestException(
        'payment_method and a positive integer order_id are required',
      );
    }
    return this.paymentsService.create(body);
  }

  // Update payment (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    if (!isValidPaymentUpdate(body)) {
      throw new BadRequestException('Invalid payment update fields');
    }
    return this.paymentsService.updatePayment(+id, body);
  }

  // Delete payment (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentsService.deletePayment(+id);
  }
}