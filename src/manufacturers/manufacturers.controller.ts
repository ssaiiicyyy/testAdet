import { Controller as NestController, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@NestController('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturerService: ManufacturersService) {}

  // Get all manufacturers (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.manufacturerService.getAll();
  }

  // Get single manufacturer by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.manufacturerService.findById(+id);
  }

  // Create manufacturer
  @Post()
  async create(@Body() body: { manufacturers_name: string }) {
    return this.manufacturerService.create(body.manufacturers_name);
  }

  // Update manufacturer (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.manufacturerService.updateManufacturers(+id, body);
  }

  // Delete manufacturer (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.manufacturerService.updateManufacturers(+id, Body);
  }
}