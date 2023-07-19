import { VirtualNode } from "./virtualNode.js"

export interface ElementRoot {
  type: "element-root"
  root: Node
}

export interface FragmentRoot {
  type: "fragment-root"
  root: Node
}

export type RenderedRoot = ElementRoot | FragmentRoot

export type DOMRenderer = (element: Node, node: VirtualNode) => RenderedRoot

export type StringRenderer = (node: VirtualNode) => Promise<string>
