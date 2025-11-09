import { STATUS } from '../utils';
import { Mapper, QueryBuilder, Queries, parserId, parserDate, parserInteger } from './helper';

class ProductDao {
  productQuery = `
    SELECT 
      p.id,
      p.name,
      p.price,
      p.rating,
      p.status,
      p.created_by,
      p.created_on,
      p.updated_by,
      p.updated_on
    FROM product p
  `;

  /**
   * Create new product
   */
  async createProduct(client, createProductDto, createdBy) {
    const res = await client.query(
      `INSERT INTO product (name, price, rating, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5)
       RETURNING id`,
      [
        createProductDto.name,
        createProductDto.price,
        createProductDto.rating || null,
        createProductDto.status || STATUS.ACTIVE,
        createdBy,
      ]
    );
    return Mapper.getId(res);
  }

  /**
   * Update product
   */
  async updateProduct(client, updateProductDto) {
    const fields = [];
    const values = [];
    let index = 1;

    if (updateProductDto.name) {
      fields.push(`name = $${index++}`);
      values.push(updateProductDto.name);
    }
    if (updateProductDto.price !== undefined) {
      fields.push(`price = $${index++}`);
      values.push(updateProductDto.price);
    }
    if (updateProductDto.rating !== undefined) {
      fields.push(`rating = $${index++}`);
      values.push(updateProductDto.rating);
    }
    if (updateProductDto.status) {
      fields.push(`status = $${index++}`);
      values.push(updateProductDto.status);
    }
    if (updateProductDto.updated_by) {
      fields.push(`updated_by = $${index++}`);
      values.push(updateProductDto.updated_by);
    }

    const sql = `UPDATE product SET ${fields.join(', ')} WHERE id = $${index}`;
    values.push(updateProductDto.id);

    const result = await client.query(sql, values);
    return result.rowCount === 1;
  }

  /**
   * Find product by ID
   */
  async findProductById(client, id, onlyActive = false) {
    const preArgs = [id];
    let query = `${this.productQuery} WHERE p.id = ?`;
    if (onlyActive) {
      query += ' AND p.status = ?';
      preArgs.push(STATUS.ACTIVE);
    }

    const qb = new QueryBuilder(query, preArgs);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getUnique(res, ProductDao.mapProduct);
  }

  /**
   * Get all products
   */
  async getAllProducts(client, onlyActive = false) {
    let query = `${this.productQuery}`;
    const preArgs = [];

    if (onlyActive) {
      query += ' WHERE p.status = ?';
      preArgs.push(STATUS.ACTIVE);
    }

    const qb = new QueryBuilder(query, preArgs);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.mapAll(res, ProductDao.mapProduct);
  }

  /**
   * Delete product by id
   */
  async deleteProductById(client, id) {
    const res = await client.query('DELETE FROM product WHERE id = $1', [id]);
    return res.rowCount === 1;
  }

  /**
   * Check duplicate product name
   */
  async findDuplicate(client, name, ignoreId = null) {
    const qb = new QueryBuilder(`SELECT id FROM product WHERE name = ?`, [name]);
    if (ignoreId) qb.append('AND id != ?', [ignoreId]);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getId(res) !== 0;
  }

  /**
   * Map DB rows to product object
   */
  static mapProduct(rows) {
    const first = rows[0];
    if (!first) return null;

    return {
      id: parserId(first.id),
      name: first.name,
      price: parserInteger(first.price),
      rating: parserInteger(first.rating),
      status: first.status,
      createdBy: parserId(first.created_by),
      createdOn: parserDate(first.created_on),
      updatedBy: parserId(first.updated_by),
      updatedOn: parserDate(first.updated_on),
    };
  }
}

export default ProductDao;