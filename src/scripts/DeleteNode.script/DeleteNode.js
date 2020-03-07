/* global nodeId */
export default function deleteNode() {
  const node = new UaNode(nodeId);

  return node.remove();
}
