import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class ProductsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(productName: string, productPrice: number, manufacturersId: number) {
    await this.ensureManufacturerExists(manufacturersId);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO product (product_name, product_price, manufacturers_id) VALUES (?, ?, ?)',
      [productName, productPrice, manufacturersId],
    );
    return {
      product_id: result.insertId,
      product_name: productName,
      product_price: productPrice,
      manufacturers_id: manufacturersId,
    };
  }

  private async ensureManufacturerExists(manufacturersId: number) {
    const [manufacturers] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT manufacturers_id FROM manufacturers WHERE manufacturers_id = ?',
      [manufacturersId],
    );
    if (manufacturers.length === 0) {
      throw new NotFoundException(`Manufacturer ${manufacturersId} not found`);
    }
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM product WHERE product_id = ?',
      [id],
    );
    return rows?.[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM product',
    );
    return rows ?? [];
  }

  async updateProduct(
    id: number,
    partial: { product_name?: string; product_price?: number; manufacturers_id?: number },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (partial.product_name !== undefined) {
      fields.push('product_name = ?');
      values.push(partial.product_name);
    }
    if (partial.product_price !== undefined) {
      fields.push('product_price = ?');
      values.push(partial.product_price);
    }
    if (partial.manufacturers_id !== undefined) {
      await this.ensureManufacturerExists(partial.manufacturers_id);
      fields.push('manufacturers_id = ?');
      values.push(partial.manufacturers_id);
    }
    if (fields.length === 0) return await this.findById(id);
    values.push(id);
    const sql = `UPDATE product SET ${fields.join(', ')} WHERE product_id = ?`;
    await this.pool()!.execute(sql, values);
    return this.findById(id);
  }

  async deleteProduct(id: number) {
    const [res] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM product WHERE product_id = ?',
      [id],
    );
    return (res?.affectedRows ?? 0) > 0;
  }
}