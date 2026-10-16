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
import {
  ShipmentsService,
  type CreateShipmentData,
  type UpdateShipmentData,
} from './shipment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCreateShipmentData(body: unknown): body is CreateShipmentData {
  return (
    isRecord(body) &&
    isPositiveInteger(body.order_id) &&
    isNonEmptyString(body.courier_name) &&
    (body.tracking_number === undefined ||
      body.tracking_number === null ||
      typeof body.tracking_number === 'string') &&
    isNonEmptyString(body.shipment_status)
  );
}

function isUpdateShipmentData(body: unknown): body is UpdateShipmentData {
  return (
    isRecord(body) &&
    (body.order_id === undefined || isPositiveInteger(body.order_id)) &&
    (body.courier_name === undefined ||
      isNonEmptyString(body.courier_name)) &&
    (body.tracking_number === undefined ||
      body.tracking_number === null ||
      typeof body.tracking_number === 'string') &&
    (body.shipment_status === undefined ||
      isNonEmptyString(body.shipment_status))
  );
}

@Controller(['shipment', 'shipments'])
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
  async create(@Body() body: unknown) {
    if (!isCreateShipmentData(body)) {
      throw new BadRequestException(
        'order_id, courier_name, and shipment_status are required',
      );
    }
    return this.shipmentsService.create(body);
  }

  // Update shipment (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    if (!isUpdateShipmentData(body)) {
      throw new BadRequestException('Invalid shipment update fields');
    }
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
