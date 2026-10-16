import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export interface CreateOrderData {
  product_id: number;
  quantity: number;
  order_status: string;
  total_amount: number;
  customer_id: number;
}

export interface UpdateOrderData {
  product_id?: number;
  quantity?: number;
  order_date?: string;
  order_status?: string;
  total_amount?: number;
  customer_id?: number;
}

@Injectable()
export class OrderService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(data: CreateOrderData) {
    await this.ensureProductExists(data.product_id);
    await this.ensureCustomerExists(data.customer_id);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO `orders` (product_id, quantity, order_date, order_status, total_amount, customer_id) VALUES (?, ?, CURDATE(), ?, ?, ?)',
      [
        data.product_id,
        data.quantity,
        data.order_status,
        data.total_amount,
        data.customer_id,
      ],
    );
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM `orders` WHERE order_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM `orders`',
    );
    return rows;
  }

  async updateOrder(id: number, partial: UpdateOrderData) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.product_id !== undefined) {
      await this.ensureProductExists(partial.product_id);
      fields.push('product_id = ?');
      values.push(partial.product_id);
    }
    if (partial.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(partial.quantity);
    }
    if (partial.order_date !== undefined) {
      fields.push('order_date = ?');
      values.push(partial.order_date);
    }
    if (partial.order_status !== undefined) {
      fields.push('order_status = ?');
      values.push(partial.order_status);
    }
    if (partial.total_amount !== undefined) {
      fields.push('total_amount = ?');
      values.push(partial.total_amount);
    }
    if (partial.customer_id !== undefined) {
      await this.ensureCustomerExists(partial.customer_id);
      fields.push('customer_id = ?');
      values.push(partial.customer_id);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.pool()!.execute(
      `UPDATE \`orders\` SET ${fields.join(', ')} WHERE order_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteOrder(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM `orders` WHERE order_id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }

  private async ensureProductExists(productId: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT product_id FROM product WHERE product_id = ?',
      [productId],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
  }

  private async ensureCustomerExists(customerId: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT customer_id FROM customer WHERE customer_id = ?',
      [customerId],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }
  }
}
