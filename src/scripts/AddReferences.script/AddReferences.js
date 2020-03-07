/* global paramObjString */

import { getOptions } from '../../lib/parameters';

function isSingular(referenceType) {
  return referenceType === UaNode.HASMODELLINGRULE;
}

export default function addReferences(paramObj = getOptions(paramObjString)) {
  // add reference attempts that failed
  const failedAttempts = [];

  const node = new UaNode(paramObj.nodeId);

  if (!node.exists()) {
    throw new Error('Base node does not exist!');
  }

  paramObj.references.forEach(refGroupItem => {
    const refType = refGroupItem.referenceIdValue;

    if (isSingular(refType)) {
      if (refGroupItem.items.length > 1) {
        throw new Error(`${paramObj.nodeId} cannot have multiple reference of type ${refType}`);
      }

      // Check existing reference
      const [existing] = node.browse({ reference: refType });

      if (existing) {
        if (existing.node.nodeaddr === refGroupItem.items[0]) {
          // Alright, this reference is already valid
          return;
        }

        // An invalid reference exists: We have to remove it first
        node.deletereference(refType, existing.node.nodeid);
      }
    }

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
