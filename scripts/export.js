import { promises as fsp } from 'fs';
import { join } from 'path';
import { callMethod } from 'atscm/out/api';
import NodeId from 'atscm/out/lib/model/opcua/NodeId';
import { Variant, DataType, VariantArrayType } from 'node-opcua';

export default async function createExports({
  scripts = ['CreateNode', 'AddReferences', 'DeleteNode'],
  dir = join(__dirname, '../out'),
} = {}) {
  console.time('Creating export files');
  const {
    outputArguments: [{ value }],
  } = await callMethod(new NodeId('AGENT.OPCUA.METHODS.exportNodes'), [
    new Variant({
      dataType: DataType.NodeId,
      arrayType: VariantArrayType.Array,
      value: scripts.map(
        script => new NodeId(`SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm.${script}`)
      ),
    }),
  ]);

  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(join(dir, 'scripts.xml'), value);
  await fsp.writeFile(
    join(dir, 'exports.js'),
    `const { join } = require('path');

module.exports = ${JSON.stringify(['scripts.xml'], null, '  ')}.map(name => join(__dirname, name));`
  );
  console.timeEnd('Creating export files');
}

if (!module.parent) {
  createExports().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
