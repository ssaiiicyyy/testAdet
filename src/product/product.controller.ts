import { BadRequestException, Controller as NestController, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@NestController('product')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  // Get all products (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.productService.getAll();
  }

  // Get single product by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productService.findById(+id);
  }

  // Create product
  @Post()
  async create(@Body() body: unknown) {
    if (
      typeof body !== 'object' ||
      body === null ||
      !('product_name' in body) ||
      typeof body.product_name !== 'string' ||
      body.product_name.trim().length === 0 ||
      !('product_price' in body) ||
      typeof body.product_price !== 'number' ||
      !Number.isFinite(body.product_price) ||
      body.product_price < 0 ||
      !('manufacturers_id' in body) ||
      typeof body.manufacturers_id !== 'number' ||
      !Number.isInteger(body.manufacturers_id) ||
      body.manufacturers_id < 1
    ) {
      throw new BadRequestException(
        'product_name, a non-negative product_price, and a valid manufacturers_id are required',
      );
    }

    return this.productService.create(body.product_name, body.product_price, body.manufacturers_id);
  }

  // Update product (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { product_name?: string; product_price?: number; manufacturers_id?: number },
  ) {
    return this.productService.updateProduct(+id, body);
  }

  // Delete product (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.deleteProduct(+id);
  }
}