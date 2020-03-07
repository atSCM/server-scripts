import { join } from 'path';
import { readFileSync } from 'fs';
import test from 'ava';
import NodeId from 'atscm/out/lib/model/opcua/NodeId';
import { NodeClass, DataType } from 'node-opcua';
import { serverDirectory as serverDir } from '../../config';
import { Variant, callScript, readNode } from './_helpers';

const script = new NodeId(`ns=1;s=SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.${serverDir}.CreateNode`);

function createNode(options) {
  return callScript(script, {
    paramObjString: new Variant(DataType.String, JSON.stringify(options)),
  });
}

const testNodeFolder = `ns=1;s=AGENT.OBJECTS.server-scripts-tests-${process.env.CIRCLE_BUILD_NUM ||
  Date.now().toString(16)}`;
const testNodeId = (name = Date.now().toString(16)) => new NodeId(`${testNodeFolder}.${name}`);

test.before(async () => {
  const nodeId = new NodeId(testNodeFolder);

  await createNode({
    nodeClass: NodeClass.Object.value,
    nodeId,
    parentNodeId: nodeId.parent,
    typeDefinition: new NodeId('ns=0;i=61'),
  });
});

test('ignores existing nodes', async t => {
  const nodeId = new NodeId('ns=1;s=AGENT.OBJECTS');
  const { createdNode, creatingNodeFailed } = await createNode({
    nodeId,
  });

  t.false(createdNode);
  t.false(creatingNodeFailed);
});

test('creates atvise server nodes', async t => {
  const nodeId = testNodeId('create');
  const { createdNode, creatingNodeFailed } = await createNode({
    nodeClass: NodeClass.Variable.value,
    nodeId,
    parentNodeId: nodeId.parent,
    typeDefinition: new NodeId('ns=0;i=62'),
    value: 13,
    dataType: DataType.Int32,
  });

  t.true(createdNode);
  t.false(creatingNodeFailed);
});

test('uses reference type if provided', async t => {
  const nodeId = testNodeId('reference');
  const { createdNode } = await createNode({
    nodeClass: NodeClass.Variable.value,
    nodeId,
    parentNodeId: nodeId.parent,
    reference: 'HasEventSource',
    typeDefinition: new NodeId('ns=0;i=62'),
    value: 13,
    dataType: DataType.Int32,
  });

  t.true(createdNode);
});

test('correctly handles binary data', async t => {
  const value = readFileSync(join(__dirname, '../fixtures/sample-binary.png'));

  const nodeId = testNodeId('binary-data');
  const { createdNode } = await createNode({
    nodeClass: NodeClass.Variable.value,
    nodeId,
    parentNodeId: nodeId.parent,
    typeDefinition: new NodeId('ns=0;i=62'),
    value,
    dataType: DataType.ByteString.value,
  });

  t.true(createdNode);

  t.deepEqual((await readNode(nodeId)).value.value, value);
});
