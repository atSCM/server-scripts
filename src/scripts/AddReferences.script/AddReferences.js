/* global paramObjString */
import { getOptions } from '../../lib/parameters';

export default function addReferences(paramObj = getOptions(paramObjString)) {
  // add reference attempts that failed
  const failedAttempts = [];

  const node = new UaNode(paramObj.nodeId);

  if (!node.exists()) {
    throw new Error('Base node does not exist!');
  }

  paramObj.references.forEach(refGroupItem => {
    const refType = refGroupItem.referenceIdValue;

    refGroupItem.items.forEach(targetNodeId => {
      const targetNode = new UaNode(targetNodeId);

      if (!targetNode.exists()) {
        failedAttempts.push(targetNodeId);
      } else if (node.addreference(refType, targetNode) !== 0) {
        failedAttempts.push(targetNodeId);
      }
    });
  });

  return failedAttempts;
}
