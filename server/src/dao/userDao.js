import moment from 'moment';
import { Client } from 'pg';
import { PasswordHash, userUpdateMap, userDetailsUpdateMap, userPasswordUpdateMap } from '../models';
import { Queries, Mapper, QueryBuilder, parserId, parserDate, parserInteger } from './helper';
import { STATUS } from '../utils';

class UserDao {
  userJoins = `
    LEFT JOIN user_details ud ON ud.user_id = u.id
  `;

  userQuery = `
    SELECT 
      u.id,
      u.email,
      u.password,
      u.status,
      u.created_on,
      ud.name,
      ud.phone_no,
      ud.address,
      ud.status AS user_details_status
    FROM users u
    ${this.userJoins}
  `;

  /**
   * Create new user and corresponding user_details
   */
  async createUser(client, createUserDto, createdBy) {
    // Create user
    const res = await client.query(
      `INSERT INTO users (email, password, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING id`,
      [createUserDto.email, createUserDto.password, createUserDto.status || STATUS.ACTIVE, createdBy]
    );

    const userId = Mapper.getId(res);

    // Create user_details
    await client.query(
      `INSERT INTO user_details (user_id, name, phone_no, address, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $6)`,
      [
        userId,
        createUserDto.name,
        createUserDto.phone_no,
        createUserDto.address || null,
        STATUS.ACTIVE,
        createdBy,
      ]
    );

    return userId;
  }

  /**
   * Update user and user_details
   */
  async updateUser(client, updateUserDto) {
    const { sql: sql1, args: args1 } = Queries.updaterFor('users', userUpdateMap, updateUserDto);
    const res1 = await client.query(sql1, args1);

    const { sql: sql2, args: args2 } = Queries.updaterFor('user_details', userDetailsUpdateMap, updateUserDto, 'user_id');
    const res2 = await client.query(sql2, args2);

    return res1.rowCount === 1 && res2.rowCount === 1;
  }

  /**
   * Update password
   */
  async updatePassword(client, hashedPassword, userId) {
    const { sql, args } = Queries.updaterFor('users', userPasswordUpdateMap, { hashedPassword, id: userId });
    const result = await client.query(sql, args);
    return result.rowCount === 1;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(client, email, onlyActive = false) {
    const preArgs = [email];
    let query = `${this.userQuery} WHERE u.email = ?`;
    if (onlyActive) {
      query += ' AND u.status = ?';
      preArgs.push(STATUS.ACTIVE);
    }

    const qb = new QueryBuilder(query, preArgs);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);

    return Mapper.getUnique(res, UserDao.mapUser);
  }

  /**
   * Find user by id
   */
  async findUserById(client, id, onlyActive = false) {
    const preArgs = [id];
    let query = `${this.userQuery} WHERE u.id = ?`;
    if (onlyActive) {
      query += ' AND u.status = ?';
      preArgs.push(STATUS.ACTIVE);
    }

    const qb = new QueryBuilder(query, preArgs);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);

    return Mapper.getUnique(res, UserDao.mapUser);
  }

  /**
   * Delete user by id
   */
  async deleteUserById(client, id) {
    const res = await client.query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount === 1;
  }

  /**
   * Check duplicate email
   */
  async findDuplicate(client, user, ignoreId) {
    const qb = new QueryBuilder(`SELECT id FROM users WHERE email = ?`, [user.email]);
    if (ignoreId) qb.append('AND id != ?', [ignoreId]);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getId(res) !== 0;
  }

  /**
   * Map database row to user object
   */
  static mapUser(rows) {
    const firstRow = rows[0];
    if (!firstRow) return null;

    return {
      id: parserId(firstRow.id),
      email: firstRow.email,
      passwordHash: firstRow.password ? new PasswordHash(firstRow.password) : null,
      status: firstRow.status,
      name: firstRow.name,
      phone_no: firstRow.phone_no,
      address: firstRow.address,
      createdOn: parserDate(firstRow.created_on),
    };
  }
}

export default UserDao;