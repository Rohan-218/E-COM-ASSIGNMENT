class Authentication {
  /**
   * Checks if the user has the right
   * @param {import("../dao/userDao").ActionUser} user
   * @param {string} right
   * @returns {boolean}
   */
  static hasRight(user, right) {
    return user.role.hasRight(right);
  }

  /**
   * Get the effective rights of the user
   * @param {import("../dao/userDao").ActionUser} user
   * @returns {string[]}
   */
  static userEffectiveRights(user) {
    return user.role.getRights();
  }

  static hasPermission(rights, right) {
    return rights.indexOf(right) !== -1;
  }
}

export default Authentication;
