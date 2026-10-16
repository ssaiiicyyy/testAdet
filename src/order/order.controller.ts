import {
  BadRequestException,
  Body,
  Controller as NestController,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  OrderService,
  type CreateOrderData,
  type UpdateOrderData,
} from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isCreateOrderData(body: unknown): body is CreateOrderData {
  return (
    isRecord(body) &&
    isPositiveInteger(body.product_id) &&
    isPositiveInteger(body.quantity) &&
    typeof body.order_status === 'string' &&
    body.order_status.trim().length > 0 &&
    isNonNegativeInteger(body.total_amount) &&
    isPositiveInteger(body.customer_id)
  );
}

function isUpdateOrderData(body: unknown): body is UpdateOrderData {
  return (
    isRecord(body) &&
    (body.product_id === undefined || isPositiveInteger(body.product_id)) &&
    (body.quantity === undefined || isPositiveInteger(body.quantity)) &&
    (body.order_date === undefined || isDate(body.order_date)) &&
    (body.order_status === undefined ||
      (typeof body.order_status === 'string' &&
        body.order_status.trim().length > 0)) &&
    (body.total_amount === undefined ||
      isNonNegativeInteger(body.total_amount)) &&
    (body.customer_id === undefined || isPositiveInteger(body.customer_id))
  );
}

@NestController(['order', 'orders'])
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Get all orders (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.orderService.getAll();
  }

  // Get single order by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orderService.findById(+id);
  }

  // Create order
  @Post()
  async create(@Body() body: unknown) {
    if (!isCreateOrderData(body)) {
      throw new BadRequestException(
        'product_id, positive quantity, order_status, non-negative total_amount, and customer_id are required',
      );
    }
    return this.orderService.create(body);
  }

  // Update order (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    if (!isUpdateOrderData(body)) {
      throw new BadRequestException('Invalid order update fields');
    }
    return this.orderService.updateOrder(+id, body);
  }

  // Delete order (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderService.deleteOrder(+id);
  }
}