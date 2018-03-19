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

test('ignores existing nodes', async t => {
  const nodeId = new NodeId('ns=1;s=AGENT.OBJECTS');
  const { createdNode, creatingNodeFailed } = await createNode({
    nodeId,
  });

  t.false(createdNode);
  t.false(creatingNodeFailed);
});

test('creates atvise server nodes', async t => {
  const nodeId = new NodeId(`ns=1;s=AGENT.OBJECTS.test-${Date.now()}`);
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
