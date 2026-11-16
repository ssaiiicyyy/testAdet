import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoryService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(categoryName: string, productId: number) {
    await this.ensureProductExists(productId);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO category (category_name, product_id) VALUES (?, ?)',
      [categoryName, productId],
    );
    return {
      category_id: result.insertId,
      category_name: categoryName,
      product_id: productId,
    };
  }

  private async ensureProductExists(productId: number) {
    const [products] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT product_id FROM product WHERE product_id = ?',
      [productId],
    );
    if (products.length === 0) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM category WHERE category_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM category',
    );
    return rows;
  }

  async updateCategory(
    id: number,
    partial: { category_name?: string; product_id?: number },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.category_name !== undefined) {
      fields.push('category_name = ?');
      values.push(partial.category_name);
    }
    if (partial.product_id !== undefined) {
      await this.ensureProductExists(partial.product_id);
      fields.push('product_id = ?');
      values.push(partial.product_id);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.pool()!.execute(
      `UPDATE category SET ${fields.join(', ')} WHERE category_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteCategory(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM category WHERE category_id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }
}
