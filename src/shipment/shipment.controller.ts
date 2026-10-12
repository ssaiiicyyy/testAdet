import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  // Get all shipments (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.shipmentsService.getAll();
  }

  // Get single shipment by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.shipmentsService.findById(+id);
  }

  // Create shipment
  @Post()
  async create(@Body() body: { name: string }) {
    return this.shipmentsService.create(body.name);
  }

  // Update shipment (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.shipmentsService.updateShipment(+id, body);
  }

  // Delete shipment (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.shipmentsService.deleteShipment(+id);
  }
}

export { Controller };
