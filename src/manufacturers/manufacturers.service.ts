
import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class ManufacturersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async create(name: string) {
    const [result] = await this.pool()!.execute<ResultSetHeader>(
      'INSERT INTO manufacturers (manufacturers_name) VALUES (?)',
      [name],
    );
    return { manufacturers_id: result?.insertId ?? 0, manufacturers_name: name };
  }

  async findById(id: number) {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM manufacturers WHERE manufacturers_id = ?',
      [id],
    );
    return rows?.[0];
  }

  async getAll() {
    const [rows] = await this.pool()!.execute<RowDataPacket[]>(
      'SELECT * FROM manufacturers',
    );
    return rows ?? [];
  }

  async update(id: number, data: { manufacturers_name?: string }) {
    const manufacturerId = id;
    if (!data.manufacturers_name) return await this.findById(manufacturerId);
    await this.pool()!.execute(
      'UPDATE manufacturers SET manufacturers_name = ? WHERE manufacturers_id = ?',
      [data.manufacturers_name, manufacturerId],
    );
    return this.findById(manufacturerId);
  }

  async deleteManufacturer(id: number) {
    try {
      const [res] = await this.pool()!.execute<ResultSetHeader>(
        'DELETE FROM manufacturers WHERE manufacturers_id = ?',
        [id],
      );
      return (res?.affectedRows ?? 0) > 0;
    } catch (error) {
      if (
        error instanceof Error &&
        (('code' in error &&
          (error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED')) ||
          ('errno' in error && error.errno === 1451))
      ) {
        throw new ConflictException(
          'Cannot delete this manufacturer because products are linked to it.',
        );
      }
      throw error;
    }
  }
}