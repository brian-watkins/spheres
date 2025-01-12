import { GetState } from "../../store/index.js";
import { initListener, StateListener, TokenRegistry } from "../../store/tokenRegistry.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { EventsToDelegate } from "./index.js";
import { ElementNode, NodeType, StatefulTextNode, TextNode, VirtualNode, StatefulListNode, StatefulSelectorNode } from "./virtualNode.js";

export function stringifyVirtualNode(registry: TokenRegistry, idSequence: IdSequence, vnode: VirtualNode): string {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      return stringifyElement(registry, idSequence, vnode)
    case NodeType.TEXT:
      return stringifyTextNode(vnode)
    case NodeType.STATEFUL_TEXT:
      return stringifyReactiveText(registry, vnode)
    case NodeType.STATEFUL_SELECTOR:
      return stringifyStatefulSelect(registry, idSequence, vnode)
    case NodeType.STATEFUL_LIST:
      return stringifyViewList(registry, idSequence, vnode)
  }
}

function stringifyTextNode(node: TextNode): string {
  // probably should escape stuff here to avoid security problems
  return node.value.replace(/"/g, "&quot;")
}

function stringifyElement(registry: TokenRegistry, idSequence: IdSequence, node: ElementNode): string {
  const attributes = node.data.attrs
  const statefulAttributes = node.data.statefulAttrs ?? {}

  if (node.data.props?.className) {
    attributes["class"] = node.data.props?.className
  }

  if (node.data.statefulProps?.className) {
    statefulAttributes["class"] = node.data.statefulProps.className
  }

  const elementId = idSequence.next
  for (const k in node.data.on) {
    if (EventsToDelegate.has(k)) {
      attributes[`data-spheres-${k}`] = elementId
    }
  }

  let attrs = Object.keys(attributes).map(key => ` ${key}="${node.data.attrs[key]}"`).join("")

  for (const attr in statefulAttributes) {
    const attributeValue = getValue(registry, statefulAttributes[attr])
    attrs += ` ${attr}="${attributeValue}"`
  }

  if (node.data.props?.innerHTML) {
    return `<${node.tag}${attrs}>${node.data.props.innerHTML}</${node.tag}>`
  }

  if (node.children.length === 0) {
    return `<${node.tag}${attrs} />`
  }

  const children = node.children.map(child => stringifyVirtualNode(registry, idSequence, child))

  return `<${node.tag}${attrs}>${children.join("")}</${node.tag}>`
}

function stringifyStatefulSelect(registry: TokenRegistry, idSequence: IdSequence, node: StatefulSelectorNode): string {
  const selectedIndex = getValue(registry, (get) => {
    return node.selectors.findIndex(selector => selector.select(get))
  })

  const elementId = idSequence.next

  let html = `<!--${switchStartIndicator(elementId)}-->`
  if (selectedIndex !== -1) {
    const template = node.selectors[selectedIndex].template
    html += stringifyVirtualNode(registry, new IdSequence(`${elementId}.${selectedIndex}`), template.virtualNode)
  }
  html += `<!--${switchEndIndicator(elementId)}-->`

  return html
}

function stringifyReactiveText(registry: TokenRegistry, node: StatefulTextNode): string {
  const text = getValue(registry, node.generator)

  return stringifyTextNode({
    type: NodeType.TEXT,
    value: text ?? "",
  })
}

function stringifyViewList(registry: TokenRegistry, idSequence: IdSequence, node: StatefulListNode): string {
  const data = getValue(registry, node.query)

  const elementId = idSequence.next

  let html = `<!--${listStartIndicator(elementId)}-->`
  for (let i = 0; i < data.length; i++) {
    html += stringifyVirtualNode(
      node.template.createOverlayRegistry(registry, data[i], i),
      new IdSequence(elementId),
      node.template.virtualNode
    )
  }
  html += `<!--${listEndIndicator(elementId)}-->`

  return html
}

class GetValueQuery<M> implements StateListener {
  value!: M

  constructor(public registry: TokenRegistry, private generator: (get: GetState) => M) { }

  init(get: GetState): void {
    this.run(get)
  }

  run(get: GetState): void {
    this.value = this.generator(get)
  }
}

function getValue<M>(registry: TokenRegistry, generator: (get: GetState) => M): M {
  const query = new GetValueQuery(registry, generator)
  initListener(query)
  return query.value
}