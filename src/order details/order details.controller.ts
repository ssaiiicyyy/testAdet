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
  OrderDetailsService,
  type CreateOrderDetailData,
  type UpdateOrderDetailData,
} from './order details.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isCreateOrderDetailData(
  body: unknown,
): body is CreateOrderDetailData {
  return (
    isRecord(body) &&
    isPositiveInteger(body.order_id) &&
    isPositiveInteger(body.product_id) &&
    isPositiveInteger(body.quantity)
  );
}

function isUpdateOrderDetailData(
  body: unknown,
): body is UpdateOrderDetailData {
  return (
    isRecord(body) &&
    (body.order_id === undefined || isPositiveInteger(body.order_id)) &&
    (body.product_id === undefined || isPositiveInteger(body.product_id)) &&
    (body.quantity === undefined || isPositiveInteger(body.quantity))
  );
}

@Controller(['orderdetails', 'order-details', 'orders details'])
export class OrderDetailsController {
  constructor(private readonly orderService: OrderDetailsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.orderService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.orderService.findById(+id);
  }

  @Post()
  create(@Body() body: unknown) {
    if (!isCreateOrderDetailData(body)) {
      throw new BadRequestException(
        'positive integer order_id, product_id, and quantity are required',
      );
    }
    return this.orderService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    if (!isUpdateOrderDetailData(body)) {
      throw new BadRequestException('Invalid order detail update fields');
    }
    return this.orderService.updateOrderDetails(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.deleteOrderDetails(+id);
  }
}
