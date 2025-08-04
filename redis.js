const Crypto = require('crypto');

console.log(Crypto.createHash('md5').update('hello').digest('hex'));