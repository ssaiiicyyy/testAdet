import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from '../database/database.service';

export interface CreateShipmentData {
  order_id: number;
  courier_name: string;
  tracking_number?: string | null;
  shipment_status: string;
}

export interface UpdateShipmentData {
  order_id?: number;
  courier_name?: string;
  tracking_number?: string | null;
  shipment_status?: string;
}

@Injectable()
export class ShipmentsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(data: CreateShipmentData) {
    await this.ensureOrderExists(data.order_id);

    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO shipment (order_id, courier_name, tracking_number, shipment_status) VALUES (?, ?, ?, ?)',
      [
        data.order_id,
        data.courier_name,
        data.tracking_number ?? null,
        data.shipment_status,
      ],
    );
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM shipment WHERE shipment_id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM shipment',
    );
    return rows;
  }

  async updateShipment(id: number, partial: UpdateShipmentData) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (partial.order_id !== undefined) {
      await this.ensureOrderExists(partial.order_id);
      fields.push('order_id = ?');
      values.push(partial.order_id);
    }
    if (partial.courier_name !== undefined) {
      fields.push('courier_name = ?');
      values.push(partial.courier_name);
    }
    if (partial.tracking_number !== undefined) {
      fields.push('tracking_number = ?');
      values.push(partial.tracking_number);
    }
    if (partial.shipment_status !== undefined) {
      fields.push('shipment_status = ?');
      values.push(partial.shipment_status);
    }

    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.pool()!.execute(
      `UPDATE shipment SET ${fields.join(', ')} WHERE shipment_id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteShipment(id: number) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'DELETE FROM shipment WHERE shipment_id = ?',
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
