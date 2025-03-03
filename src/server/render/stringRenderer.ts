import { Stateful, Store } from "../../store/index.js";
import { getTokenRegistry } from "../../store/store.js";
import { runQuery, TokenRegistry } from "../../store/tokenRegistry.js";
import { voidElements } from "../../view/elementData.js";
import { HTMLView } from "../../view/index.js";
import { EventsToDelegate } from "../../view/render/index.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "../../view/render/fragmentHelpers.js";
import { IdSequence } from "../../view/render/idSequence.js";
import { ElementNode, NodeType, StatefulListNode, StatefulSelectorNode, StatefulTextNode, TextNode, VirtualNode } from "../../view/render/virtualNode.js";
import { HtmlViewBuilder } from "../../view/htmlViewBuilder.js";
import { getLinkData, LinkData, ViteContext } from "./viteBuilder.js";

type StatefulString = (registry: TokenRegistry) => string

export interface HTMLTemplate {
  strings: Array<string>
  statefuls: Array<StatefulString>
}

export function buildStringRenderer(view: HTMLView, viteContext?: ViteContext): (store: Store) => string {
  const builder = new HtmlViewBuilder()
  builder.subview(view)
  const template = buildHtmlTemplate(builder.toVirtualNode(), new IdSequence(), viteContext)

  return (store) => {
    return stringForTemplate(getTokenRegistry(store), template)
  }
}

export function buildHtmlTemplate(vnode: VirtualNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
  switch (vnode.type) {
    case NodeType.TEXT:
      return templateForText(vnode)
    case NodeType.STATEFUL_TEXT:
      return templateForStatefulText(vnode)
    case NodeType.STATEFUL_LIST:
      return templateForStatefulList(vnode, idSequence, viteContext)
    case NodeType.STATEFUL_SELECTOR:
      return templateForStatefulSelector(vnode, idSequence, viteContext)
    case NodeType.ELEMENT:
      return templateForElement(vnode, idSequence, viteContext)
  }
}

function toStatefulString(stateful: Stateful<string>): StatefulString {
  return (registry) => runQuery(registry, stateful) ?? ""
}

function templateForText(vnode: TextNode): HTMLTemplate {
  return { strings: [vnode.value], statefuls: [] }
}

function templateForStatefulText(vnode: StatefulTextNode): HTMLTemplate {
  return {
    strings: ["", ""],
    statefuls: [
      toStatefulString(vnode.generator)
    ]
  }
}

function stringForTemplate(registry: TokenRegistry, template: HTMLTemplate): string {
  let html = ""
  for (let x = 0; x < template.strings.length; x++) {
    html += template.strings[x]
    if (x < template.statefuls.length) {
      html += template.statefuls[x](registry)
    }
  }
  return html
}

function templateForStatefulList(vnode: StatefulListNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
  const elementId = idSequence.next

  const listItemTemplate = buildHtmlTemplate(vnode.template.virtualNode, new IdSequence(elementId), viteContext)

  return {
    strings: [
      `<!--${listStartIndicator(elementId)}-->`,
      `<!--${listEndIndicator(elementId)}-->`
    ],
    statefuls: [
      (registry) => {
        const listData = runQuery(registry, vnode.query)
        let html: string = ""
        for (let i = 0; i < listData.length; i++) {
          let overlayRegistry = vnode.template.createOverlayRegistry(registry, listData[i], i)
          html += stringForTemplate(overlayRegistry, listItemTemplate)
        }
        return html
      }
    ]
  }
}

function templateForStatefulSelector(vnode: StatefulSelectorNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
  const elementId = idSequence.next

  const templates = vnode.selectors.map((selector, index) => {
    return buildHtmlTemplate(selector.template.virtualNode, new IdSequence(`${elementId}.${index}`), viteContext)
  })

  return {
    strings: [
      `<!--${switchStartIndicator(elementId)}-->`,
      `<!--${switchEndIndicator(elementId)}-->`
    ],
    statefuls: [
      (registry) => {
        const selectedIndex = runQuery(registry, (get) => {
          return vnode.selectors.findIndex(selector => selector.select(get))
        })
        if (selectedIndex === -1) {
          return ""
        }
        return stringForTemplate(registry, templates[selectedIndex])
      }
    ]
  }
}

function templateForElement(vnode: ElementNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
  if (shouldTransformImport(viteContext, vnode, "script", "src")) {
    return templateForImport(viteContext!, vnode, "script", "src")
  }

  if (shouldTransformImport(viteContext, vnode, "link", "href")) {
    return templateForImport(viteContext!, vnode, "stylesheet", "href")
  }

  const attributes = vnode.data.attrs
  const statefulAttributes = vnode.data.statefulAttrs ?? {}

  if (vnode.data.props?.className) {
    attributes["class"] = vnode.data.props?.className
  }

  if (vnode.data.statefulProps?.className) {
    statefulAttributes["class"] = vnode.data.statefulProps.className
  }

  const elementId = idSequence.next
  for (const k in vnode.data.on) {
    if (EventsToDelegate.has(k)) {
      attributes[`data-spheres-${k}`] = elementId
    }
  }

  let staticAttrs = Object.keys(attributes)
    .map(key => ` ${key}="${vnode.data.attrs[key]}"`)
    .join("")

  let strings: Array<string> = []
  let statefuls: Array<StatefulString> = []

  let currentString = `<${vnode.tag}${staticAttrs}`

  for (const attr in statefulAttributes) {
    currentString += ` ${attr}="`
    strings.push(currentString)
    statefuls.push(toStatefulString(statefulAttributes[attr]))
    currentString = `"`
  }

  currentString += ">"

  if (viteContext !== undefined && viteContext.command === "serve" && vnode.tag === "head") {
    currentString += `<script type="module" src="/@vite/client"></script>`
  }

  if (voidElements.has(vnode.tag)) {
    strings.push(currentString)
    return { strings, statefuls }
  }

  if (vnode.data.props?.innerHTML) {
    currentString += `${vnode.data.props.innerHTML}</${vnode.tag}>`
    strings.push(currentString)
    return { strings, statefuls }
  }

  if (vnode.data.statefulProps?.innerHTML) {
    strings.push(currentString)
    statefuls.push(toStatefulString(vnode.data.statefulProps.innerHTML))
    strings.push(`</${vnode.tag}>`)
    return { strings, statefuls }
  }

  for (const childNode of vnode.children) {
    const template = buildHtmlTemplate(childNode, idSequence, viteContext)
    currentString = currentString + (template.strings[0] ?? "")
    if (template.strings.length > 1) {
      strings.push(currentString)
      strings = strings.concat(template.strings.slice(1, -1))
      statefuls = statefuls.concat(template.statefuls ?? [])
      currentString = template.strings[template.strings.length - 1]
    }
  }

  strings.push(currentString + `</${vnode.tag}>`)

  return { strings, statefuls }
}

function shouldTransformImport(viteContext: ViteContext | undefined, vnode: ElementNode, tag: string, attribute: string) {
  if (viteContext === undefined) {
    return false
  }

  if (viteContext.command !== "build") {
    return false
  }

  if (vnode.tag === tag) {
    return vnode.data.attrs[attribute] !== undefined ||
      vnode.data.statefulAttrs?.[attribute] !== undefined
  }

  return false
}

function templateForImport(viteContext: ViteContext, vnode: ElementNode, assetType: "script" | "stylesheet", attributeName: string): HTMLTemplate {
  if (vnode.data.attrs[attributeName] !== undefined) {
    const linkData = getLinkData(viteContext, assetType, vnode.data.attrs[attributeName])
    return {
      strings: [renderLinks(viteContext, linkData)],
      statefuls: []
    }
  }

  const srcGenerator = vnode.data.statefulAttrs![attributeName]

  return {
    strings: ["", ""],
    statefuls: [
      (registry) => {
        const src = runQuery(registry, srcGenerator) ?? ""
        const linkData = getLinkData(viteContext, assetType, src)
        return renderLinks(viteContext, linkData)
      }
    ]
  }
}

function renderLinks(viteContext: ViteContext, links: Array<LinkData>): string {
  let html = ""
  for (const link of links) {
    const src = `${viteContext.base}${link.src}`
    switch (link.type) {
      case "script":
        html += `<script type="module" src="${src}"></script>`
        break
      case "extra-script":
        html += `<link rel="modulepreload" href="${src}">`
        break
      case "stylesheet":
        html += `<link rel="stylesheet" href="${src}">`
        break
    }
  }
  return html
}
