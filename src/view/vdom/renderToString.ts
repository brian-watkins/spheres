import { container, GetState, ReactiveEffect, Store } from "../../store/index.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "./fragmentHelpers.js";
import { IdSequence } from "./idSequence.js";
import { EventsToDelegate } from "./render.js";
import { ElementNode, NodeType, StatefulTextNode, TextNode, VirtualNode, StatefulListNode, StatefulSelectorNode } from "./virtualNode.js";


export function stringifyVirtualNode(store: Store, idSequence: IdSequence, vnode: VirtualNode): string {
  switch (vnode.type) {
    case NodeType.ELEMENT:
      return stringifyElement(store, idSequence, vnode)
    case NodeType.TEXT:
      return stringifyTextNode(vnode)
    case NodeType.STATEFUL_TEXT:
      return stringifyReactiveText(store, vnode)
    case NodeType.STATEFUL_SELECTOR:
      return stringifyStatefulSelect(store, idSequence, vnode)
    case NodeType.STATEFUL_LIST:
      return stringifyViewList(store, idSequence, vnode)
  }
}

function stringifyTextNode(node: TextNode): string {
  // probably should escape stuff here to avoid security problems
  return node.value.replace(/"/g, "&quot;")
}

function stringifyElement(store: Store, idSequence: IdSequence, node: ElementNode): string {
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

  const children = node.children.map(child => stringifyVirtualNode(store, idSequence, child))

  return `<${node.tag}${attrs}>${children.join("")}</${node.tag}>`
}

class GetValueQuery<M> implements ReactiveEffect {
  value!: M

  constructor(private generator: (get: GetState) => M) { }

  run(get: GetState): void {
    this.value = this.generator(get)
  }
}

function stringifyStatefulSelect(store: Store, idSequence: IdSequence, node: StatefulSelectorNode): string {
  const templateQuery = new GetValueQuery((get) => {
    return node.selectors.findIndex(selector => selector.select(get))
  })
  store.useEffect(templateQuery)

  const elementId = idSequence.next

  let html = `<!--${switchStartIndicator(elementId)}-->`
  if (templateQuery.value !== -1) {
    const template = node.selectors[templateQuery.value].template
    html += stringifyVirtualNode(store, new IdSequence(`${elementId}.${templateQuery.value}`), template.virtualNode)
  }
  html += `<!--${switchEndIndicator(elementId)}-->`

  return html
}

function stringifyReactiveText(store: Store, node: StatefulTextNode): string {
  const query = new GetValueQuery(node.generator)
  store.useEffect(query)

  return stringifyTextNode({
    type: NodeType.TEXT,
    value: query.value ?? "",
  })
}

function stringifyViewList(store: Store, idSequence: IdSequence, node: StatefulListNode): string {
  const query = new GetValueQuery(node.query)
  store.useEffect(query)

  const data = query.value

  const elementId = idSequence.next

  let html = `<!--${listStartIndicator(elementId)}-->`
  for (let i = 0; i < data.length; i++) {
    if (node.template.usesIndex) {
      node.template.setArgs({ item: data[i], index: container({ initialValue: i }) })
    } else {
      node.template.setArgs(data[i])
    }

    html += stringifyVirtualNode(store, new IdSequence(elementId), node.template.virtualNode)
  }
  html += `<!--${listEndIndicator(elementId)}-->`

  return html
}
