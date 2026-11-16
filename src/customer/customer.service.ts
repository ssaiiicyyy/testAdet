import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomerService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(customerName: string, customerNum: string, address: string) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO customer (customer_name, customer_num, address) VALUES (?, ?, ?)',
      [customerName, customerNum, address],
    );
    return {
      customer_id: result.insertId,
      customer_name: customerName,
      customer_num: customerNum,
      address,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM customer WHERE customer_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM customer',
    );
    return rows;
  }

  async updateCustomer(
    id: number,
    partial: {
      customer_name?: string;
      customer_num?: string;
      address?: string;
    },
  ) {
    const fields: string[] = [];
    const values: string[] = [];

    if (partial.customer_name !== undefined) {
      fields.push('customer_name = ?');
      values.push(partial.customer_name);
    }
    if (partial.customer_num !== undefined) {
      fields.push('customer_num = ?');
      values.push(partial.customer_num);
    }
    if (partial.address !== undefined) {
      fields.push('address = ?');
      values.push(partial.address);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(String(id));
    await this.pool()!.execute(
      `UPDATE customer SET ${fields.join(', ')} WHERE customer_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteCustomer(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM customer WHERE customer_id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }
}
