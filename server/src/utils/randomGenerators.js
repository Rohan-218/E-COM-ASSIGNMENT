import md5 from 'md5';
import crypto from 'crypto';

export const pad = (number, length, padder = '0') => {
  let newNumber = `${number}`;
  newNumber = newNumber.length >= length ? newNumber
    : new Array(length - newNumber.length + 1).join(padder) + newNumber;
  return newNumber;
};

export const randomNumber = (length = 6) => {
  const randomBytes = crypto.randomBytes(4);
  const randomNumberFromBytes = randomBytes.readUInt32LE(0);
  const min = 1;
  const max = parseInt((new Array(length + 1).join('9') || '1'), 10);
  const random = Math.floor(randomNumberFromBytes * (max - min + 1)) + min;
  return pad(random, length).substring(0, length);
};

export const randomString = (length = 11) => {
  const MAX_INT = 2 ** 32 - 1;
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) {
    const randomBytes = crypto.randomBytes(4); // 4 bytes for a 32-bit integer
    const randomInt = randomBytes.readUInt32LE(0);
    result += chars[Math.floor((randomInt / MAX_INT) * chars.length)];
  }
  return result;
};

export const randomPasswordGenerator = (length = 11) => {
  const string = randomString(length);
  const md5String = md5(string);
  return { string, md5String };
};

export const randomUserSalt = () => (randomString(32));
