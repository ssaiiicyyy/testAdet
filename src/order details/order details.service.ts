import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export interface CreateOrderDetailData {
  order_id: number;
  product_id: number;
  quantity: number;
}

export type UpdateOrderDetailData = Partial<CreateOrderDetailData>;

interface ProductRow extends RowDataPacket {
  product_price: number;
}

@Injectable()
export class OrderDetailsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(data: CreateOrderDetailData) {
    await this.ensureOrderExists(data.order_id);
    const unitPrice = await this.getProductPrice(data.product_id);
    const subtotal = unitPrice * data.quantity;

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO order_details (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
      [data.order_id, data.product_id, data.quantity, unitPrice, subtotal],
    );
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM order_details WHERE order_detail_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM order_details',
    );
    return rows;
  }

  async updateOrderDetails(id: number, partial: UpdateOrderDetailData) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Order detail ${id} not found`);
    }

    const orderId = partial.order_id ?? Number(existing.order_id);
    const productId = partial.product_id ?? Number(existing.product_id);
    const quantity = partial.quantity ?? Number(existing.quantity);
    const unitPrice =
      partial.product_id !== undefined
        ? await this.getProductPrice(productId)
        : Number(existing.unit_price);

    if (partial.order_id !== undefined) {
      await this.ensureOrderExists(orderId);
    }

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'UPDATE order_details SET order_id = ?, product_id = ?, quantity = ?, unit_price = ?, subtotal = ? WHERE order_detail_id = ?',
      [orderId, productId, quantity, unitPrice, unitPrice * quantity, id],
    );
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order detail ${id} not found`);
    }
    return this.findById(id);
  }

  async deleteOrderDetails(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM order_details WHERE order_detail_id = ?',
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

  private async getProductPrice(productId: number) {
    const [rows] = await this.pool()!.execute<ProductRow[]>(
      'SELECT product_price FROM product WHERE product_id = ?',
      [productId],
    );
    const product = rows[0];
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return Number(product.product_price);
  }
}
