/* eslint-disable class-methods-use-this */
import { Pool, Client } from 'pg';
import config from '../config';

class Database {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    if (pool) {
      this.pool = pool;
    } else {
      this.pool = new Pool({
        user: config.db.credentials.user,
        password: config.db.credentials.password,
        host: config.db.host,
        database: config.db.name,
        port: config.db.port,
      });
    }
  }

  async testConnection() {
    await this.pool.query('SELECT 1=1');
    return 'Db Pool Connected';
  }

  async withTransaction(callback) {
    /**
     * @type {Client}
     */
    const client = await this.pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      res = await callback(client);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return res;
  }

  endPool() {
    this.pool.end();
  }
}

export default Database;
