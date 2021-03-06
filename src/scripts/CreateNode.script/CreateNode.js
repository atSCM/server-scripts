/* global paramObjString */

import { getOptions } from '../../lib/parameters';
import { toBinaryString } from '../../lib/encoding';

export default function createNode(paramObj = getOptions(paramObjString)) {
  const InstanceTypes = [UaNode.NODECLASS_VARIABLE, UaNode.NODECLASS_OBJECT];

  const BaseTypes = [UaNode.NODECLASS_VARIABLETYPE, UaNode.NODECLASS_OBJECTTYPE];

  let nodeObj = {};
  const returnObj = {
    createdNode: false,
    creatingNodeFailed: false,
  };

  const node = new UaNode(paramObj.nodeId);
  const nodeClass = paramObj.nodeClass || UaNode.NODECLASS_UNSPECIFIED;

  if (!node.exists()) {
    nodeObj = {
      browsename: paramObj.browseName,
      nodeclass: nodeClass,
      parent: paramObj.parentNodeId,
      typedefinition: paramObj.typeDefinition,
      modellingrule: paramObj.modellingRule ? paramObj.modellingRule : null,
    };

    if (~InstanceTypes.indexOf(nodeClass)) {
      nodeObj.reference = UaNode.HASCOMPONENT;

      if (nodeClass === UaNode.NODECLASS_VARIABLE) {
        nodeObj.valuerank = paramObj.valueRank >= 1 ? paramObj.valueRank : -1;
        nodeObj.value = paramObj.value;
        nodeObj.datatype = paramObj.dataType;

        if (nodeObj.datatype === UaNode.DATETIME) {
          nodeObj.value =
            paramObj.valueRank >= 1 ? nodeObj.value.map(v => new Date(v)) : new Date(nodeObj.value);
        } else if (nodeObj.datatype === UaNode.BYTESTRING) {
          nodeObj.value = toBinaryString(nodeObj.value.data);
        } else if (nodeObj.datatype === UaNode.STRING && nodeObj.value === null) {
          // Otherwise "null" is written
          nodeObj.value = '';
        }
      }
    } else if (~BaseTypes.indexOf(nodeClass)) {
      nodeObj.reference = UaNode.HASSUBTYPE;

      if (nodeClass === UaNode.NODECLASS_VARIABLETYPE) {
        nodeObj.valueRank = UaNode.VALUERANK_SCALARORONEDIMENSION;
        nodeObj.value = '';
        nodeObj.datatype = UaNode.STRING;
      }
    } else {
      throw new Error(`Node class ${nodeClass} is invalid`);
    }

    if (paramObj.reference) {
      const reference = UaNode[paramObj.reference.toUpperCase()];

      if (!reference) {
        throw new Error(`Unknown reference type '${paramObj.reference}'`);
      }

      nodeObj.reference = reference;
    }

    if (node.create(nodeObj) === 0) {
      returnObj.createdNode = true;
    } else {
      returnObj.creatingNodeFailed = true;
    }
  }

  return returnObj;
}
