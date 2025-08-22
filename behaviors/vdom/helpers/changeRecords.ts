export interface DOMTextChangeRecord {
  type: "text"
}

export function textChangeRecord(): DOMTextChangeRecord {
  return {
    type: "text"
  }
}

export interface DOMStructureChangeRecord {
  type: "structure"
  removedNodes: number
  addedNodes: number
}

export function structureChangeRecord(details: { removedNodes: number, addedNodes: number }): DOMStructureChangeRecord {
  return {
    type: "structure",
    removedNodes: details.removedNodes,
    addedNodes: details.addedNodes
  }
}

export type DOMChangeRecord = DOMTextChangeRecord | DOMStructureChangeRecord