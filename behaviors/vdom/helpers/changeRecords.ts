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

export function nodeAddedRecord() {
  return structureChangeRecord({ addedNodes: 1, removedNodes: 0 })
}

export function nodeRemovedRecord() {
  return structureChangeRecord({ addedNodes: 0, removedNodes: 1 })
}

export function nodeReplacedRecord() {
  return structureChangeRecord({ addedNodes: 1, removedNodes: 1 })
}

export type DOMChangeRecord = DOMTextChangeRecord | DOMStructureChangeRecord