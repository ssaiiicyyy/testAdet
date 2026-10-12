import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoryService) {}

  // Get all categories (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }

  // Get single category by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.categoryService.findById(+id);
  }

  // Create category (open - for demo)
  @Post()
  async create(@Body() body: { name: string }) {
    return this.categoryService.create(body.name, undefined);
  }

  // Update category (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.categoryService.updateCategory(+id, body);
  }

  // Delete category (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(+id);
  }
}