import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  // Get all transactions (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.transactionsService.getAll();
  }

  // Get single transaction by id (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.transactionsService.findById(+id);
  }

  // Create transaction (open - for demo)
  @Post()
  async create(@Body() body: { username: string; password: string }) {
    return this.transactionsService.createTransaction(body.username, body.password);
  }

  // Update transaction (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.transactionsService.update(+id, body);
  }

  // Delete transaction (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}