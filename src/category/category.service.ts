import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class CategoryService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  private async productExists(productId: number, retryConnectionReset = true): Promise<boolean> {
    try {
      const [products] = await this.pool()!.execute<RowDataPacket[]>(
        'SELECT product_id FROM product WHERE product_id = ?',
        [productId],
      );
      return products.length > 0;
    } catch (error) {
      if (
        retryConnectionReset &&
        error instanceof Error &&
        'code' in error &&
        error.code === 'ECONNRESET'
      ) {
        return this.productExists(productId, false);
      }
      throw error;
    }
  }

  async create(name: string, productId: number) {
    if (!(await this.productExists(productId))) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO category (category_name, product_id) VALUES (?, ?)',
      [name, productId],
    );
    return {
      category_id: result.insertId,
      category_name: name,
      product_id: productId,
    };
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

  async updateCategory(id: number, partial: { name?: string }) {
    if (partial.name === undefined) return this.findById(id);
    await this.pool()!.execute(
      'UPDATE category SET category_name = ? WHERE category_id = ?',
      [partial.name, id],
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
