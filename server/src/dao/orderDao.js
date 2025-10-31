import { STATUS } from '../utils';
import { Mapper, QueryBuilder, parserId, parserDate, parserInteger } from './helper';

class OrderDao {
  orderQuery = `
    SELECT 
      o.id,
      o.user_id,
      o.product_id,
      p.name AS product_name,
      p.price AS product_price,
      o.qty,
      o.status,
      o.created_on,
      o.updated_on
    FROM orders o
    JOIN product p ON o.product_id = p.id
  `;

  /**
   * Checkout — Move products from cart to orders
   */
  async checkout(client, userId) {
    // Get all items in the user's cart
    const cartItemsRes = await client.query(
      `SELECT cp.product_id, cp.qty 
         FROM cart_product cp
         JOIN cart c ON cp.cart_id = c.id
        WHERE c.user_id = $1`,
      [userId]
    );

    const cartItems = cartItemsRes.rows;
    if (!cartItems.length) return false;

    // Insert each item into orders
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO orders (user_id, product_id, qty, status, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $1, $1)`,
        [userId, item.product_id, item.qty, STATUS.ACTIVE]
      );
    }

    // Clear the user's cart after checkout
    await client.query(
      `DELETE FROM cart_product
        WHERE cart_id = (SELECT id FROM cart WHERE user_id = $1)`,
      [userId]
    );

    await client.query(
      `UPDATE cart 
          SET total_items = 0, total_cost = 0, updated_by = $1 
        WHERE user_id = $1`,
      [userId]
    );

    return true;
  }

  /**
   * Get all orders for a user
   */
  async getOrdersByUser(client, userId) {
    const qb = new QueryBuilder(
      `${this.orderQuery} WHERE o.user_id = ? ORDER BY o.created_on DESC`,
      [userId]
    );

    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.mapAll(res, OrderDao.mapOrder);
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(client, orderId) {
    const qb = new QueryBuilder(`${this.orderQuery} WHERE o.id = ?`, [orderId]);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getUnique(res, OrderDao.mapOrder);
  }

  /**
   * Delete an order (optional admin use)
   */
  async deleteOrder(client, orderId) {
    const res = await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
    return res.rowCount === 1;
  }

  /**
   * Map DB rows to order object
   */
  static mapOrder(rows) {
    const first = rows[0];
    if (!first) return null;

    return {
      id: parserId(first.id),
      userId: parserId(first.user_id),
      productId: parserId(first.product_id),
      productName: first.product_name,
      productPrice: parserInteger(first.product_price),
      qty: parserInteger(first.qty),
      status: first.status,
      createdOn: parserDate(first.created_on),
      updatedOn: parserDate(first.updated_on),
    };
  }
}

export default OrderDao;