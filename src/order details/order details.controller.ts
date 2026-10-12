import { Controller as NestController, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrderDetailsService } from './order details.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@NestController('orders details')
export class OrderDetailsController {
  constructor(private readonly orderService: OrderDetailsService) {}

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
  async create(@Body() body: { name: string }) {
    return this.orderService.create(body.name);
  }

  // Update order (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.orderService.updateCategory(+id, body);
  }

  // Delete order (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderService.deleteCategory(+id);
  }
}