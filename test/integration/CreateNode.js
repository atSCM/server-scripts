import test from 'ava';
import NodeId from 'atscm/out/lib/model/opcua/NodeId';
import { NodeClass, DataType } from 'node-opcua';
import { serverDirectory as serverDir } from '../../config';
import { Variant, callScript } from './_helpers';

const script = new NodeId(`ns=1;s=SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.${serverDir}.CreateNode`);

function createNode(options) {
  return callScript(script, {
    paramObjString: new Variant(DataType.String, JSON.stringify(options)),
  });
}

const testNodeFolder = `ns=1;s=AGENT.OBJECTS.server-scripts-tests-${
  process.env.CIRCLE_BUILD_NUM || Date.now().toString(16)
}`;
const testNodeId = (name = Date.now().toString(16)) => new NodeId(`${testNodeFolder}.${name}`);

test.before(async () => {
  const nodeId = new NodeId(testNodeFolder);

  await createNode({
    nodeClass: NodeClass.Object.value,
    nodeId,
    parentNodeId: nodeId.parent,
    typeDefinition: new NodeId('ns=1;i=61'),
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
  const nodeId = testNodeId();
  const { createdNode, creatingNodeFailed } = await createNode({
    nodeClass: NodeClass.Variable.value,
    nodeId,
    parentNodeId: nodeId.parent,
    typeDefinition: new NodeId('ns=1;i=62'),
    value: 13,
    dataType: DataType.Integer,
  });

  t.true(createdNode);
  t.false(creatingNodeFailed);
});

test('uses reference type if provided', async t => {
  const nodeId = testNodeId();
  const { createdNode } = await createNode({
    nodeClass: NodeClass.Variable.value,
    nodeId,
    parentNodeId: nodeId.parent,
    reference: 'HasEventSource',
    typeDefinition: new NodeId('ns=1;i=62'),
    value: 13,
    dataType: DataType.Integer,
  });

  t.true(createdNode);
});
