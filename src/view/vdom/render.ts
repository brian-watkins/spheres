import { Store } from "../../store/index.js"
import { VirtualNode, VirtualTemplate } from "./virtualNode.js"

export type StringRenderer = (node: VirtualNode) => string

export type DOMNodeRenderer = (store: Store, vnode: VirtualNode) => Node

export interface TemplateData {
  template: VirtualTemplate<any>
  args: any
}

export type TemplateNodeRenderer = (store: Store, templateData: TemplateData) => Node
