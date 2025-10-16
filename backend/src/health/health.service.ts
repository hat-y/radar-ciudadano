import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly ds: DataSource) { }

  liveness() {
    return { ok: true, ts: new Date().toISOString() };
  }

  async db() {
    try {
      await this.ds.query('SELECT 1');
      return { db: 'up' as const };
    } catch (e) {
      return { db: 'down' as const, error: (e as Error).message };
    }
  }
}

