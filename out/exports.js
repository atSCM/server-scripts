const { join } = require('path');

module.exports = [
  "scripts.xml"
].map(name => join(__dirname, name));