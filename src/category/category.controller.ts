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
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.categoryService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.categoryService.findById(+id);
  }

  @Post()
  create(@Body() body: unknown) {
    if (
      typeof body !== 'object' ||
      body === null ||
      !('category_name' in body) ||
      typeof body.category_name !== 'string' ||
      body.category_name.trim().length === 0 ||
      !('product_id' in body) ||
      typeof body.product_id !== 'number' ||
      !Number.isInteger(body.product_id) ||
      body.product_id <= 0
    ) {
      throw new BadRequestException(
        'category_name and a positive integer product_id are required',
      );
    }
    return this.categoryService.create(body.category_name, body.product_id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: { category_name?: string; product_id?: number },
  ) {
    return this.categoryService.updateCategory(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(+id);
  }
}
