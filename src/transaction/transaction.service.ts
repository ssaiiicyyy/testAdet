import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export interface CreateTransactionData {
  transaction_code: string;
  order_id: number;
  payment_id: number;
}

export interface UpdateTransactionData {
  transaction_code?: string;
  order_id?: number;
  payment_id?: number;
}

@Injectable()
export class TransactionsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(data: CreateTransactionData) {
    await this.ensureOrderExists(data.order_id);
    await this.ensurePaymentExists(data.payment_id);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO transactions (transaction_code, order_id, payment_id) VALUES (?, ?, ?)',
      [data.transaction_code, data.order_id, data.payment_id],
    );
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM transactions WHERE transactions_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM transactions',
    );
    return rows;
  }

  async update(id: number, partial: UpdateTransactionData) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.transaction_code !== undefined) {
      fields.push('transaction_code = ?');
      values.push(partial.transaction_code);
    }
    if (partial.order_id !== undefined) {
      await this.ensureOrderExists(partial.order_id);
      fields.push('order_id = ?');
      values.push(partial.order_id);
    }
    if (partial.payment_id !== undefined) {
      await this.ensurePaymentExists(partial.payment_id);
      fields.push('payment_id = ?');
      values.push(partial.payment_id);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.pool()!.execute(
      `UPDATE transactions SET ${fields.join(', ')} WHERE transactions_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async remove(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM transactions WHERE transactions_id = ?',
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

  private async ensurePaymentExists(paymentId: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT payment_id FROM payment WHERE payment_id = ?',
      [paymentId],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }
  }
}
