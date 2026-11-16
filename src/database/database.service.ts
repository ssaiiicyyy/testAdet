import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  pool: mysql.Pool | undefined;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || '',
      port: +(process.env.DB_PORT || 23642),
      user: process.env.DB_USER || 'avnadmin',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      maxIdle: 10,
      idleTimeout: 60_000,
    });
    // optional: test connection
    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool created');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool() {
    return this.pool;
  }
}