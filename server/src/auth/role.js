import Right from './right';
import { HttpException, formatErrorResponse } from '../utils';

class Role {
  roles = Object.freeze([
    'USER',
  ]);

  static roleValues = Object.freeze({
    USER: 'USER',
  });

  roleIds = Object.freeze({
    USER: 1,
  });

  USER = Right.userRights();

  /**
   * @type {string[]}
   */
  rights;

  /**
   * @type {string}
   */
  role;

  constructor(role) {
    if (this.roles.indexOf(role) === -1) {
      throw new HttpException.BadRequest(formatErrorResponse('role', 'notFound'));
    }
    this.role = role;
    this.rights = this[role];
  }

  /**
   * Checks if the user has the right
   * @param {string} right
   * @returns {boolean}
   */
  hasRight(right) {
    return (this.rights && this.rights.indexOf(right) !== -1);
  }

  /**
   * Gets the rights available for this role
   * @returns {string[]}
   */
  getRights() {
    return this.rights;
  }

  /**
   * Gets the role id based on the role
   * @returns {number}
   */
  getId() {
    return this.roleIds[this.role] || 0;
  }

  /**
   * Gets the name of the role
   * @returns {string}
   */
  getRoleName() {
    return this.role;
  }
}

export default Role;
