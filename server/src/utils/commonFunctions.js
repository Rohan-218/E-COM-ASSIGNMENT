import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const isUndefined = (value) => value === undefined;
export const isNull = (value) => value === null;

export const convertIsoDateToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return `${date}T${moment().format('HH:mm:ssZ')}`;
};

export const convertToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DDTHH:mm:ss');
};

export const convertToIsoDate = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DD');
};

export const checkIfValidDate = (date) => {
  if (!date) return false;
  return moment(date).isValid();
};

export const convertToStartOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 0, m: 0, s: 0, ms: 0,
  });
};

export const convertToEndOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 23, m: 59, s: 59, ms: 999,
  });
};

export const filterUndefinedFromObject = (obj) => (
  Object.keys(obj).reduce((acc, key) => {
    if (!isUndefined(obj[key]) && !isNull(obj[key])) {
      acc[key] = obj[key];
    }
    return acc;
  }, {}));

export const deleteFile = (filePath) => (
  new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('Invalid Path'));
    }
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      // if no error, file has been deleted successfully
      resolve(true);
    });
  })
);

export const getFileContent = (resourceDir, relativePath) => new Promise((resolve, reject) => {
  fs.readFile(path.join(resourceDir, relativePath), 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

export const formatStr = (str) => (str || '');
export const formatDate = (date) => (date ? moment(date).format('DD/MM/YYYY') : '');

export const sanitizeUrl = (url) => {
  if (!url) return url;
  let newUrl = url;
  if (url.endsWith('/')) {
    newUrl = url.substring(0, url.length - 1);
  }
  return newUrl;
};

export const getEnumArrayFromObj = (enumObj) => {
  if (!enumObj) return null;
  return Object.keys(enumObj).map((key) => enumObj[key]);
};

/**
 * Returns true if the value is a float
 * @param {string|number} val
 * @returns {boolean}
 */
export const isFloat = (val) => {
  const floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val)) return false;

  const parsedVal = parseFloat(val);
  return !(Number.isNaN(parsedVal));
};

/**
 * Returns if the value is an integer without any decimal
 * @param {string|number} val
 * @returns {boolean}
 */
export const isInt = (val) => {
  const intRegex = /^-?\d+$/;
  if (!intRegex.test(val)) return false;

  const intVal = parseInt(val, 10);
  return parseFloat(val) === intVal && !Number.isNaN(intVal);
};

const parserInteger = (value) => (isInt(value) ? parseInt(value, 10) : null);

export const isValidString = (str) => {
  const invalidTypeMap = {
    function: false,
    object: false,
    symbol: false,
  };
  if (!isUndefined(invalidTypeMap[typeof str])) return false;
  const stringifiedValue = String(str).trim();
  if (stringifiedValue.length < 1) return false;
  const incorrectValueMap = {
    null: false,
    undefined: false,
    NaN: false,
    Symbol: false,
    'Symbol()': false,
    '[object Object]': false,
  };
  return isUndefined(incorrectValueMap[stringifiedValue]);
};

export const parserString = (value) => (isValidString(value) ? String(value) : null);

/**
 * Returns an array of arrays split into chunks specified by the limit
 * @param {Array} array
 * @param {number} limit
 * @returns {Array.<Array>}
 */
export const splitArray = (array, limit) => {
  if (limit <= 0) {
    throw new Error('Limit must be greater than 0.');
  }

  const result = [];
  let currentIndex = 0;

  while (currentIndex < array.length) {
    result.push(array.slice(currentIndex, currentIndex + limit));
    currentIndex += limit;
  }

  return result;
};

/**
 * Checks if the date supplied is in YYYY-MM-DD format
 * @param {string} dateString
 * @returns {boolean}
 */
export const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  const isInValidFormat = regex.test(dateString);
  if (isInValidFormat) {
    return moment(dateString, 'YYYY-MM-DD').isValid();
  }
  return false;
};

// Function to handle circular references
const handleCircularReferences = (key, value, seen) => {
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return null; // Circular reference detected, discard key
    }
    seen.add(value);
  }
  return value;
};

// Function to handle Unicode characters
const handleUnicodeCharacters = (c) => {
  const charCode = c.charCodeAt(0).toString(16);
  const paddedCharCode = `0000${charCode}`.slice(-4);
  return `\\u${paddedCharCode}`;
};

// Main function
export const JSONStringify = (s, emitUnicode) => {
  const seen = new WeakSet();
  const json = JSON.stringify(s, (key, value) => handleCircularReferences(key, value, seen));
  return emitUnicode ? json : json.replace(/[\u007f-\uffff]/g, handleUnicodeCharacters);
};

/**
 * Returns SQL query with the values substituted in the placeholders, useful for debugging
 * @param {string} string Sql query
 * @param {Array} values Array of values for the query
 * @returns {String} Sql query with values
 */
export const interpolateString = (string, values) => string.replace(/\$(\d+)/g, (_, index) => {
  const arrayIndex = parseInt(index, 10) - 1;
  return values[arrayIndex] !== undefined ? `'${values[arrayIndex]}'` : `$${index}`;
});

export const isValidId = (id) => isInt(id) && parserInteger(id) > 0;

export const transformCase = (str) => {
  if (!isValidString(str)) return null;
  return str.toUpperCase().replace(/ /g, '_');
};

export const logOrigin = (origin, allowedOriginsCS) => {
  if (origin) {
    console.info('[CORS] Origin: %s - Allowed Origins: %s', origin, allowedOriginsCS.some((x) => origin?.indexOf(x) !== -1));
  }
};

export const transformCapitalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
    .replace(/_/g, ' ');
};

export const isValueInEnum = (str, enumObject) => {
  if (!isValidString(str)) return false;
  let enumArray = [];
  if (Array.isArray(enumObject)) {
    enumArray = enumObject;
  }
  enumArray = getEnumArrayFromObj(enumObject);
  return enumArray.map(
    (i) => transformCase(String(i)),
  ).find((i) => i === transformCase(str)) !== undefined;
};

export const isValidUUIDString = (string) => {
  if (!isValidString(string)) {
    return false;
  }
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(string);
};

export const generateUUIDString = () => uuidv4();

/**
 * Removes the duplicate entries of a object based on the
 * key provided
 * @param {Array.<Object>} arr
 * @param {string} key
 * @returns {Array.<Object>}
 */
export const removeDuplicatesObjects = (arr, key) => {
  const map = new Map();
  arr.forEach((obj) => {
    if (!map.has(obj[key])) {
      map.set(obj[key], obj);
    }
  });
  return Array.from(map.values());
};
