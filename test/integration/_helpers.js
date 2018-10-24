import { StatusCodes, DataType, VariantArrayType as ArrayType } from 'node-opcua';
import NodeId from 'atscm/out/lib/model/opcua/NodeId.js';
import Session from 'atscm/out/lib/server/Session.js';

export async function callMethod({ base, method: methodId, args: inputArguments = [] }) {
  const session = await Session.create();

  return new Promise((resolve, reject) => {
    session.call([{
      objectId: base || methodId.parent,
      methodId,
      inputArguments,
    }], (err, [{ statusCode, outputArguments }] = []) => {
      if (err) {
        reject(err);
      } else if (statusCode.value !== StatusCodes.Good.value) {
        reject(new Error(`Method failed with status ${statusCode.name}.
(${statusCode.description})`));
      } else {
        resolve(outputArguments);
      }
    });
  });
}

export class Variant {

  constructor(dataType, value, arrayType = ArrayType.Scalar) {
    this.dataType = dataType;
    this.value = value;
    this.arrayType = arrayType;
  }

}

export async function callScript(script, options = {}) {
  const [status, description, keys, values] = await callMethod({
    method: new NodeId(NodeId.NodeIdType.STRING, 'AGENT.SCRIPT.METHODS.callScript', 1),
    args: [
      new Variant(DataType.NodeId, script),
      new Variant(DataType.NodeId, script.parent),
      new Variant(DataType.String, Object.keys(options), ArrayType.Array),
      new Variant(DataType.Variant, Object.values(options), ArrayType.Array),
    ],
  });

  if (status.value !== StatusCodes.Good) {
    throw new Error(`Script failed: ${description.value}`);
  }

  return keys.value.reduce((result, key, i) => Object.assign(result, {
    [key]: values.value[i].value,
  }), {});
}

export async function readNode(nodeId) {
  const session = await Session.create();

  return new Promise((resolve, reject) => {
    session.readVariableValue(nodeId, (err, value) => {
      if (err) { return reject(err); }
      return resolve(value);
    });
  });
}
