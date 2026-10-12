import { BadRequestException, Controller as NestController, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@NestController('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Get all customers (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.customerService.getAll();
  }

  // Get single customer by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.customerService.findById(+id);
  }

  // Create customer
  @Post()
  async create(@Body() body: unknown) {
    if (
      typeof body !== 'object' ||
      body === null ||
      !('customer_name' in body) ||
      typeof body.customer_name !== 'string' ||
      body.customer_name.trim().length === 0 ||
      !('customer_num' in body) ||
      typeof body.customer_num !== 'string' ||
      body.customer_num.trim().length === 0 ||
      !('address' in body) ||
      typeof body.address !== 'string' ||
      body.address.trim().length === 0
    ) {
      throw new BadRequestException(
        'customer_name, customer_num, and address are required',
      );
    }
    return this.customerService.create(
      body.customer_name,
      body.customer_num,
      body.address,
    );
  }

  // Update customer (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      customer_name?: string;
      customer_num?: string;
      address?: string;
    },
  ) {
    return this.customerService.updateCategory(+id, body);
  }

  // Delete customer (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.customerService.deleteCategory(+id);
  }
}