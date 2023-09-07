import { Store } from "state-party";
import { StringRenderer } from "./render.js";
import { ElementNode, NodeType, ReactiveTextNode, StatefulNode, TextNode, VirtualNode } from "./virtualNode.js";


export function createStringRenderer(store: Store): StringRenderer {
  return (node: VirtualNode) => {
    return stringifyVirtualNode(store, node)
  }
}

function stringifyVirtualNode(store: Store, node: VirtualNode): string {
  switch (node.type) {
    case NodeType.ELEMENT:
      return stringifyElement(store, node)
    case NodeType.TEXT:
      return stringifyTextNode(node)
    case NodeType.REACTIVE_TEXT:
      return stringifyReactiveText(store, node)
    case NodeType.STATEFUL:
      return stringifyStatefulNode(store, node)
  }
}

function stringifyTextNode(node: TextNode): string {
  // probably should escape stuff here to avoid security problems
  return node.value.replace(/"/g, "&quot;")
}

function stringifyElement(store: Store, node: ElementNode): string {
  const attrs = Object.keys(node.data.attrs).map(key => ` ${key}="${node.data.attrs[key]}"`).join("")

  if (node.data.props.innerHTML) {
    return `<${node.tag}${attrs}>${node.data.props.innerHTML}</${node.tag}>`
  }

  if (node.children.length === 0) {
    return `<${node.tag}${attrs} />`
  }

  const children = node.children.map(child => stringifyVirtualNode(store, child))

  return `<${node.tag}${attrs}>${children.join("")}</${node.tag}>`
}

function stringifyStatefulNode(store: Store, node: StatefulNode): string {
  let statefulNode: VirtualNode
  const unsubscribe = store.query((get) => {
    statefulNode = node.generator(get)
  })
  unsubscribe()
  return stringifyVirtualNode(store, statefulNode!)
}

function stringifyReactiveText(store: Store, node: ReactiveTextNode): string {
  let textNode: TextNode
  const unsubscribe = store.query((get) => {
    textNode = {
      type: NodeType.TEXT,
      value: node.generator(get),
      node: undefined
    }
  })
  unsubscribe()
  return stringifyTextNode(textNode!)
}