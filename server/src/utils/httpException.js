/* eslint-disable max-classes-per-file */
export class BadRequest extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 400;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class Unauthorized extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 401;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class Forbidden extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 403;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class NotFound extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 404;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class Conflict extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 409;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class UpgradeRequired extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 426;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}

export class ServerError extends Error {
  constructor(msg, metaData = null) {
    super(msg);
    this.status = 500;
    this.isTrusted = true;
    if (metaData) {
      this.metaData = metaData;
    }
  }
}
