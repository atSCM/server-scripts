const { join } = require('path');

module.exports = [
  "AddReferences.script.xml",
  "CreateNode.script.xml",
  "DeleteNode.script.xml"
].map(name => join(__dirname, name));