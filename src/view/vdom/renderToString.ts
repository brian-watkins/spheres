import { container, GetState, ReactiveEffect, Store } from "../../store/index.js";
import { IdentifierGenerator } from "./idGenerator.js";
import { EventsToDelegate } from "./render.js";
import { ElementNode, NodeType, StatefulTextNode, TextNode, VirtualNode, StatefulListNode, StatefulSwitchNode } from "./virtualNode.js";


export function stringifyVirtualNode(store: Store, idGenerator: IdentifierGenerator, vnode: VirtualNode): string {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      return stringifyElement(store, idGenerator, vnode)
    case NodeType.TEXT:
      return stringifyTextNode(vnode)
    case NodeType.STATEFUL_TEXT:
      return stringifyReactiveText(store, vnode)
    case NodeType.STATEFUL_SWITCH:
      return stringifyStatefulSwitch(store, idGenerator, vnode)
    case NodeType.STATEFUL_LIST:
      return stringifyViewList(store, idGenerator, vnode)
  }
}

function stringifyTextNode(node: TextNode): string {
  // probably should escape stuff here to avoid security problems
  return node.value.replace(/"/g, "&quot;")
}

function stringifyElement(store: Store, idGenerator: IdentifierGenerator, node: ElementNode): string {
  const attributes = node.data.attrs
  const statefulAttributes = node.data.statefulAttrs ?? {}

  if (node.data.props?.className) {
    attributes["class"] = node.data.props?.className
  }

  if (node.data.statefulProps?.className) {
    statefulAttributes["class"] = node.data.statefulProps.className
  }

  const eventId = idGenerator.next
  for (const k in node.data.on) {
    if (EventsToDelegate.has(k)) {
      attributes[`data-spheres-${k}`] = eventId
    }
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

  const children = node.children.map(child => stringifyVirtualNode(store, idGenerator, child))

  return `<${node.tag}${attrs}>${children.join("")}</${node.tag}>`
}

class GetValueQuery<M> implements ReactiveEffect {
  value!: M

  constructor(private generator: (get: GetState) => M) { }

  run(get: GetState): void {
    this.value = this.generator(get)
  }
}

function stringifyStatefulSwitch(store: Store, idGenerator: IdentifierGenerator, node: StatefulSwitchNode): string {
  const selector = new GetValueQuery(node.selector)
  store.useEffect(selector)

  const eventId = idGenerator.next

  // Note: need to handle the case where the selector returns undefined

  return stringifyVirtualNode(store, new IdentifierGenerator(eventId), node.views[selector.value].virtualNode)
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

function stringifyViewList(store: Store, idGenerator: IdentifierGenerator, node: StatefulListNode): string {
  const query = new GetValueQuery(node.query)
  store.useEffect(query)

  const data = query.value

  const eventId = idGenerator.next

  let html = `<!--list-start-${eventId}-->`
  for (let i = 0; i < data.length; i++) {
    if (node.template.usesIndex) {
      node.template.setArgs({ item: data[i], index: container({ initialValue: i }) })
    } else {
      node.template.setArgs(data[i])
    }

    html += stringifyVirtualNode(store, new IdentifierGenerator(eventId), node.template.virtualNode)
  }
  html += `<!--list-end-->`

  return html
}