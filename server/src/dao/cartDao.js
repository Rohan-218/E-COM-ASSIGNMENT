import { STATUS } from '../utils';
import { Mapper, QueryBuilder, parserId, parserDate, parserInteger } from './helper';

class CartDao {
  cartQuery = `
    SELECT 
      c.id AS cart_id,
      c.user_id,
      c.total_items,
      c.total_cost,
      c.created_by,
      c.created_on,
      c.updated_by,
      c.updated_on
    FROM cart c
  `;

  /**
   * Create a new cart for user
   */
  async createCart(client, userId, createdBy) {
    const res = await client.query(
      `INSERT INTO cart (user_id, created_by, updated_by)
       VALUES ($1, $2, $2)
       RETURNING id`,
      [userId, createdBy]
    );
    return Mapper.getId(res);
  }

  /**
   * Get cart by user id (with product details)
   */
  async getCartByUserId(client, userId) {
    const cartRes = await client.query(`${this.cartQuery} WHERE c.user_id = $1`, [userId]);
    const cart = Mapper.getUnique(cartRes, CartDao.mapCart);

    if (!cart) return null;

    const productRes = await client.query(
      `
      SELECT 
        cp.cart_id,
        cp.product_id,
        p.name AS product_name,
        p.price,
        p.rating,
        cp.qty
      FROM cart_product cp
      JOIN product p ON p.id = cp.product_id
      WHERE cp.cart_id = $1
      `,
      [cart.id]
    );

    cart.items = Mapper.mapAll(productRes, CartDao.mapCartItem);
    return cart;
  }

  /**
   * Add or update product in cart
   */
  async addOrUpdateCartItem(client, userId, productId, qty, updatedBy) {
    // Get or create cart
    let cart = await this.getCartByUserId(client, userId);
    if (!cart) {
      const newCartId = await this.createCart(client, userId, updatedBy);
      cart = { id: newCartId };
    }

    // Check if product already exists in cart
    const existing = await client.query(
      `SELECT qty FROM cart_product WHERE cart_id = $1 AND product_id = $2`,
      [cart.id, productId]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      await client.query(
        `UPDATE cart_product SET qty = $1 WHERE cart_id = $2 AND product_id = $3`,
        [qty, cart.id, productId]
      );
    } else {
      // Insert new
      await client.query(
        `INSERT INTO cart_product (cart_id, product_id, qty)
         VALUES ($1, $2, $3)`,
        [cart.id, productId, qty]
      );
    }

    // Recalculate totals
    await this.recalculateCartTotals(client, cart.id, updatedBy);
    return true;
  }

  /**
   * Remove product from cart
   */
  async removeCartItem(client, userId, productId, updatedBy) {
    const cart = await this.getCartByUserId(client, userId);
    if (!cart) return false;

    await client.query(
      `DELETE FROM cart_product WHERE cart_id = $1 AND product_id = $2`,
      [cart.id, productId]
    );

    await this.recalculateCartTotals(client, cart.id, updatedBy);
    return true;
  }

  /**
   * Recalculate total_items and total_cost for a cart
   */
  async recalculateCartTotals(client, cartId, updatedBy) {
    const res = await client.query(
      `
      SELECT 
        COALESCE(SUM(cp.qty), 0) AS total_items,
        COALESCE(SUM(cp.qty * p.price), 0) AS total_cost
      FROM cart_product cp
      JOIN product p ON p.id = cp.product_id
      WHERE cp.cart_id = $1
      `,
      [cartId]
    );

    const totals = res.rows[0];
    await client.query(
      `UPDATE cart 
       SET total_items = $1, total_cost = $2, updated_by = $3 
       WHERE id = $4`,
      [totals.total_items, totals.total_cost, updatedBy, cartId]
    );
  }

  /**
   * Empty entire cart
   */
  async clearCart(client, userId, updatedBy) {
    const cart = await this.getCartByUserId(client, userId);
    if (!cart) return false;

    await client.query(`DELETE FROM cart_product WHERE cart_id = $1`, [cart.id]);
    await this.recalculateCartTotals(client, cart.id, updatedBy);
    return true;
  }

  /**
   * Map DB row to cart object
   */
  static mapCart(rows) {
    const first = rows[0];
    if (!first) return null;

    return {
      id: parserId(first.cart_id),
      userId: parserId(first.user_id),
      totalItems: parserInteger(first.total_items),
      totalCost: parserInteger(first.total_cost),
      createdBy: parserId(first.created_by),
      createdOn: parserDate(first.created_on),
      updatedBy: parserId(first.updated_by),
      updatedOn: parserDate(first.updated_on),
      items: [],
    };
  }

  /**
   * Map DB row to cart product item
   */
  static mapCartItem(row) {
    return {
      productId: parserId(row.product_id),
      productName: row.product_name,
      price: parserInteger(row.price),
      rating: parserInteger(row.rating),
      qty: parserInteger(row.qty),
    };
  }
}

export default CartDao;