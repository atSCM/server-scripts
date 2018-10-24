const { join } = require('path');

module.exports = [
  "AddReferences.script.xml",
  "DeleteNode.script.xml",
  "CreateNode.script.xml"
].map(name => join(__dirname, name));