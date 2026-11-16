import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export interface CreatePaymentData {
  payment_method: string;
  order_id: number;
}

export interface UpdatePaymentData {
  payment_method?: string;
  order_id?: number;
}

@Injectable()
export class PaymentsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(data: CreatePaymentData) {
    await this.ensureOrderExists(data.order_id);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO payment (payment_method, order_id) VALUES (?, ?)',
      [data.payment_method, data.order_id],
    );
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM payment WHERE payment_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM payment',
    );
    return rows;
  }

  async updatePayment(id: number, partial: UpdatePaymentData) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(partial.payment_method);
    }
    if (partial.order_id !== undefined) {
      await this.ensureOrderExists(partial.order_id);
      fields.push('order_id = ?');
      values.push(partial.order_id);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.pool()!.execute(
      `UPDATE payment SET ${fields.join(', ')} WHERE payment_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deletePayment(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM payment WHERE payment_id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }

  private async ensureOrderExists(orderId: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT order_id FROM `orders` WHERE order_id = ?',
      [orderId],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }
}
