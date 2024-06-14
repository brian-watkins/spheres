import { GetState, ReactiveEffect, Store } from "../../store/index.js";
import { StringRenderer } from "./render.js";
import { ElementNode, NodeType, StatefulTextNode, StatefulNode, TextNode, VirtualNode } from "./virtualNode.js";


export function createStringRenderer(store: Store): StringRenderer {
  return (node: VirtualNode) => {
    return stringifyVirtualNode(store, node)
  }
}

function stringifyVirtualNode(store: Store, vnode: VirtualNode): string {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      return stringifyElement(store, vnode)
    case NodeType.TEXT:
      return stringifyTextNode(vnode)
    case NodeType.STATEFUL_TEXT:
      return stringifyReactiveText(store, vnode)
    case NodeType.STATEFUL:
      return stringifyStatefulNode(store, vnode)
    case NodeType.BLOCK:
      return stringifyVirtualNode(store, vnode.generator!())
    case NodeType.TEMPLATE:
      vnode.template.setArgs(vnode.args)
      return stringifyVirtualNode(store, vnode.template.virtualNode)
  }
}

function stringifyTextNode(node: TextNode): string {
  // probably should escape stuff here to avoid security problems
  return node.value.replace(/"/g, "&quot;")
}

function stringifyElement(store: Store, node: ElementNode): string {
  const attributes = node.data.attrs
  const statefulAttributes = node.data.statefulAttrs ?? {}

  if (node.data.props?.className) {
    attributes["class"] = node.data.props?.className
  }

  if (node.data.statefulProps?.className) {
    statefulAttributes["class"] = node.data.statefulProps.className
  }

  let attrs = Object.keys(attributes).map(key => ` ${key}="${node.data.attrs[key]}"`).join("")

  for (const attr in statefulAttributes) {
    const generator = statefulAttributes[attr].generator
    const query = new GetValueQuery(generator)
    store.useEffect(query)
    attrs += ` ${attr}="${query.value}"`
  }

  if (node.data.props?.innerHTML) {
    return `<${node.tag}${attrs}>${node.data.props.innerHTML}</${node.tag}>`
  }

  if (node.children.length === 0) {
    return `<${node.tag}${attrs} />`
  }

  const children = node.children.map(child => stringifyVirtualNode(store, child))

  return `<${node.tag}${attrs}>${children.join("")}</${node.tag}>`
}

class GetValueQuery<M> implements ReactiveEffect {
  value!: M

  constructor(private generator: (get: GetState) => M) { }

  run(get: GetState): void {
    this.value = this.generator(get)
  }
}

function stringifyStatefulNode(store: Store, node: StatefulNode): string {
  const query = new GetValueQuery(node.generator)
  store.useEffect(query)
  
  return stringifyVirtualNode(store, query.value)
}

function stringifyReactiveText(store: Store, node: StatefulTextNode): string {
  const query = new GetValueQuery(node.generator)
  store.useEffect(query)

  return stringifyTextNode({
    type: NodeType.TEXT,
    value: query.value ?? "",
    node: undefined
  })
}