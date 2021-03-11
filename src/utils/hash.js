const crypto = require('crypto');

module.exports = function saltedHash(value) {
  const sum = crypto.createHash('sha256');
  const salt = crypto.randomBytes(16).toString('hex');
  sum.update(value + salt);
  return { hash: `sha256$${sum.digest('hex')}`, salt };
};
