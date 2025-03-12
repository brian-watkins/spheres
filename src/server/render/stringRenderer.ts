import { Stateful, Store } from "../../store/index.js";
import { getTokenRegistry } from "../../store/store.js";
import { GetState, runQuery, State, TokenRegistry } from "../../store/tokenRegistry.js";
import { AriaAttribute, voidElements } from "../../view/elementData.js";
import { HTMLBuilder, HTMLView, SpecialElementAttributes } from "../../view/index.js";
import { EventsToDelegate } from "../../view/render/index.js";
import { listEndIndicator, listStartIndicator, switchEndIndicator, switchStartIndicator } from "../../view/render/fragmentHelpers.js";
import { IdSequence } from "../../view/render/idSequence.js";
import { StoreEventHandler } from "../../view/render/virtualNode.js";
import { ViteContext } from "./viteBuilder.js";
import { ConfigurableElement, ElementDefinition, ViewConfig, ViewConfigDelegate, ViewDefinition, ViewRenderer, ViewRendererDelegate, ViewSelector } from "../../view/render/viewRenderer.js";
import { ListItemTemplateContext } from "../../view/render/templateContext.js";
import { TransformRendererDelegate } from "./transformDelegate.js";

type StatefulString = (registry: TokenRegistry) => string

export interface HTMLTemplate {
  strings: Array<string>
  statefuls: Array<StatefulString>
}

export function buildStringRenderer(view: HTMLView, viteContext?: ViteContext): (store: Store) => string {
  // const builder = new HtmlViewBuilder()
  // builder.subview(view)
  // const template = buildHtmlTemplate(builder.toVirtualNode(), new IdSequence(), viteContext)
  const renderer = new StringRenderer(new StringRendererDelegate(), viteContext, new IdSequence())

  view(renderer as unknown as HTMLBuilder)
  const template = renderer.template

  console.log("template", template)

  return (store) => {
    return stringForTemplate(getTokenRegistry(store), template)
  }
}

class StringRenderer implements ViewRenderer {
  readonly template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }


  constructor(private delegate: ViewRendererDelegate, private viteContext: ViteContext | undefined, private idSequence: IdSequence, private isTemplate: boolean = false) { }

  private appendToTemplate(next: HTMLTemplate) {
    console.log("Appending template", next)
    let currentString = this.template.strings[this.template.strings.length - 1]
    currentString = currentString + (next.strings[0] ?? "")
    if (next.strings.length > 1) {
      // this.template.strings.push(currentString)
      this.template.strings[this.template.strings.length - 1] = currentString
      this.template.strings = this.template.strings.concat(next.strings.slice(1))
      this.template.statefuls = this.template.statefuls.concat(next.statefuls ?? [])
      // currentString = template.strings[template.strings.length - 1]
    } else {
      this.template.strings[this.template.strings.length - 1] = currentString
    }
  }

  textNode(value: string | Stateful<string>): this {
    if (typeof value === "function") {
      this.appendToTemplate({
        strings: ["", ""],
        statefuls: [toStatefulString(value)]
      })
    } else {
      this.appendToTemplate({ strings: [value], statefuls: [] })
    }

    return this
  }

  element(tag: string, builder?: ElementDefinition): this {
    // if this is a script or a link that has a src or href and the vite context is defined and
    // the command is build, then we need to do something different here. The problem is that we
    // can't know if we have the correct attributes until we build the element. But we *can* build
    // once just to check
    const elementId = this.idSequence.next
    if (tag === "script" || tag === "link") {
      // try to get the transformed template and just append that
      const delegate = new TransformRendererDelegate(this.viteContext)
      const children = new StringRenderer(delegate, this.viteContext, this.idSequence)
      const config = new StringConfig(delegate.getConfigDelegate(tag), elementId)
      builder?.({
        config,
        children: children
      })
      if (delegate.template !== undefined) {
        this.appendToTemplate(delegate.template)
        return this
      }  
    }
    
    const children = new StringRenderer(this.delegate.getRendererDelegate(tag), this.viteContext, this.idSequence)
    const config = new StringConfig(this.delegate.getConfigDelegate(tag), elementId)

    if (this.isTemplate) {
      config.attribute("data-spheres-template", "")
    }

    builder?.({
      config,
      children: children
    })

    // we get a template from the children that we can then append
    // 

    this.appendToTemplate({
      strings: [`<${tag}`],
      statefuls: []
    })

    console.log("Config template", config.template)
    this.appendToTemplate(config.template)

    this.appendToTemplate({
      strings: ['>'],
      statefuls: []
    })

    if (voidElements.has(tag)) {
      return this
    }

    console.log("Checking tag", tag, this.viteContext?.command)
    if (this.viteContext !== undefined && this.viteContext.command === "serve" && tag === "head") {
      this.appendToTemplate({
        strings: [ `<script type="module" src="/@vite/client"></script>` ],
        statefuls: []
      })
    }

    if (config.innerHTMLContent !== undefined) {
      if (typeof config.innerHTMLContent === "function") {
        this.appendToTemplate({
          strings: ["", ""],
          statefuls: [
            toStatefulString(config.innerHTMLContent)
          ]
        })
      } else {
        this.appendToTemplate({
          strings: [config.innerHTMLContent],
          statefuls: []
        })
      }
    } else {
      this.appendToTemplate(children.template)
    }

    this.appendToTemplate({
      strings: [`</${tag}>`],
      statefuls: []
    })

    return this
  }

  subview(view: ViewDefinition): this {
    console.log("Adding subview")
    const renderer = new StringRenderer(this.delegate, this.viteContext, this.idSequence)
    view(renderer as unknown as HTMLBuilder)
    this.appendToTemplate(renderer.template)
    return this
  }

  subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this {
    const elementId = this.idSequence.next

    const renderer = new StringRenderer(this.delegate, this.viteContext, new IdSequence(elementId), true)
    const templateContext = new ListItemTemplateContext(renderer, viewGenerator)

    this.appendToTemplate({
      strings: [
        `<!--${listStartIndicator(elementId)}-->`,
        `<!--${listEndIndicator(elementId)}-->`
      ],
      statefuls: [
        (registry) => {
          const listData = runQuery(registry, data)
          let html: string = ""
          for (let i = 0; i < listData.length; i++) {
            let overlayRegistry = templateContext.createOverlayRegistry(registry, listData[i], i)
            html += stringForTemplate(overlayRegistry, renderer.template)
          }
          return html
        }
      ]
    })

    return this
  }

  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this {
    const elementId = this.idSequence.next
    const templateSelectorBuilder = new StringTemplateSelectorBuilder(this.delegate, this.viteContext, elementId)
    selectorGenerator(templateSelectorBuilder)
    const selectors = templateSelectorBuilder.selectors

    this.appendToTemplate({
      strings: [
        `<!--${switchStartIndicator(elementId)}-->`,
        `<!--${switchEndIndicator(elementId)}-->`
      ],
      statefuls: [
        (registry) => {
          const selectedIndex = runQuery(registry, (get) => {
            return selectors.findIndex(selector => selector.select(get))
          })
          if (selectedIndex === -1) {
            return ""
          }
          return stringForTemplate(registry, selectors[selectedIndex].template())
        }
      ]
    })

    return this
  }

}

interface StringTemplateSelector {
  select: (get: GetState) => boolean
  template: () => HTMLTemplate
}

class StringTemplateSelectorBuilder implements ViewSelector {
  private templateSelectors: Array<StringTemplateSelector> = []
  private defaultSelector: StringTemplateSelector | undefined

  constructor(private delegate: ViewRendererDelegate, private viteContext: ViteContext | undefined, private elementId: string) { }

  get selectors(): Array<StringTemplateSelector> {
    const selectors = [...this.templateSelectors]

    if (this.defaultSelector !== undefined) {
      selectors.push(this.defaultSelector)
    }

    return selectors
  }

  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this {
    const index = this.templateSelectors.length

    this.templateSelectors.push({
      select: predicate,
      template: () => {
        const renderer = new StringRenderer(this.delegate, this.viteContext, new IdSequence(`${this.elementId}.${index}`), true)
        view(renderer as unknown as HTMLBuilder)
        return renderer.template
      }
    })

    return this
  }

  default(view: ViewDefinition): void {
    this.defaultSelector = {
      select: () => true,
      template: () => {
        const renderer = new StringRenderer(this.delegate, this.viteContext, new IdSequence(`${this.elementId}.${this.templateSelectors.length}`), true)
        view(renderer as unknown as HTMLBuilder)
        return renderer.template
      }
    }
  }

}

class StringRendererDelegate implements ViewRendererDelegate {
  constructor() { }

  createElement(tag: string): Element {
    return document.createElement(tag)
  }

  getRendererDelegate(): ViewRendererDelegate {
    return this
  }

  getConfigDelegate(): ViewConfigDelegate {
    // if (tag === "script") {
    //   return new ScriptConfigDelegate(this.viteContext)
    // }

    // if (tag === "link") {
    //   return new LinkConfigDelegate(this.viteContext)
    // }

    return new StringConfigDelegate()
  }

}

class StringConfigDelegate implements ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    return config.attribute(name, value)
  }
}

// class ScriptConfigDelegate extends StringConfigDelegate {
//   constructor(private tag: string, private viteContext: ViteContext | undefined) {
//     super()
//   }

//   defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
//     if (shouldTransformImport(this.viteContext, "script", name)) {
//       if (typeof value === "function") {
//         return config.attribute(name, (get) => {
//           const src = value(get) ?? ""
//           const linkData = getLinkData(this.viteContext!, "script", src)
//           return renderLinks(this.viteContext!, linkData)
//         })
//       } else {
//         const linkData = getLinkData(this.viteContext!, "script", value)
//         return config.attribute(name, renderLinks(this.viteContext!, linkData))
//       }
//     } else {
//       return config.attribute(name, value)
//     }
//   }
// }

// class LinkConfigDelegate extends StringConfigDelegate {
//   constructor(private viteContext: ViteContext | undefined) {
//     super()
//   }

//   defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
//     if (shouldTransformImport(this.viteContext, "link", name)) {
//       if (typeof value === "function") {
//         return config.attribute(name, (get) => {
//           const src = value(get) ?? ""
//           const linkData = getLinkData(this.viteContext!, "stylesheet", src)
//           // return renderLinks(this.viteContext!, linkData)
//         })
//       } else {
//         const linkData = getLinkData(this.viteContext!, "stylesheet", value)
//         return config.attribute(name, renderLinks(this.viteContext!, linkData))
//       }
//     } else {
//       return config.attribute(name, value)
//     }
//   }
// }

class StringConfig implements ViewConfig {
  // private currentString: string = ""
  readonly template: HTMLTemplate = {
    strings: [""],
    statefuls: []
  }

  innerHTMLContent: string | Stateful<string> | undefined = undefined

  //@ts-ignore
  constructor(private delegate: ViewConfigDelegate, private elementId: string) { }

  // get template(): HTMLTemplate {
  //   return {
  //     strings: [this.currentString],
  //     statefuls: []
  //   }
  // }

  private appendToTemplate(next: HTMLTemplate) {
    console.log("Appending template", next)
    let currentString = this.template.strings[this.template.strings.length - 1]
    currentString = currentString + (next.strings[0] ?? "")
    if (next.strings.length > 1) {
      // this.template.strings.push(currentString)
      this.template.strings[this.template.strings.length - 1] = currentString
      this.template.strings = this.template.strings.concat(next.strings.slice(1))
      this.template.statefuls = this.template.statefuls.concat(next.statefuls ?? [])
      // currentString = template.strings[template.strings.length - 1]
    } else {
      this.template.strings[this.template.strings.length - 1] = currentString
    }
  }

  dataAttribute(name: string, value: string | Stateful<string> = "true"): this {
    return this.attribute(`data-${name}`, value)
  }

  innerHTML(html: string | Stateful<string>): this {
    this.innerHTMLContent = html
    return this
  }

  aria(name: AriaAttribute, value: string | Stateful<string>): this {
    return this.attribute(`aria-${name}`, value)
  }

  attribute(name: string, value: string | Stateful<string>): this {
    if (typeof value === "function") {
      this.appendToTemplate({
        strings: [` ${name}="`, `"`],
        statefuls: [
          toStatefulString(value)
        ]
      })
    } else {
      // this.currentString += ` ${name}="${value}"`
      this.appendToTemplate({
        strings: [` ${name}="${value}"`],
        statefuls: []
      })
    }

    return this
  }

  property<T extends string | boolean>(_: string, __: T | Stateful<T>): this {
    throw new Error("Method not implemented.");
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, _: StoreEventHandler<any>): this {
    if (EventsToDelegate.has(event)) {
      return this.attribute(`data-spheres-${event}`, this.elementId)
    } else {
      return this
    }
  }
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(StringRenderer.prototype, MagicElements)

const MagicConfig = new Proxy({}, {
  get: (_, prop, receiver) => {
    const attribute = prop as string
    // if (booleanAttributes.has(attribute)) {
    //   return function (isSelected: boolean | Stateful<boolean>) {
    //     if (typeof isSelected === "function") {
    //       receiver.delegate.defineAttribute(receiver, attribute, (get: GetState) => isSelected(get) ? attribute : undefined)
    //     } else {
    //       receiver.delegate.defineAttribute(receiver, attribute, isSelected ? attribute : undefined)
    //     }
    //     return receiver
    //     // return receiver.recordBooleanAttribute(attribute, isSelected)
    //   }
    // } else {
    return function (value: string | Stateful<string>) {
      // return receiver.recordAttribute(attribute, value)
      receiver.delegate.defineAttribute(receiver, attribute, value)
      return receiver
    }
    // }
  }
})

Object.setPrototypeOf(StringConfig.prototype, MagicConfig)


// export function buildHtmlTemplate(vnode: VirtualNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
//   switch (vnode.type) {
//     case NodeType.TEXT:
//       return templateForText(vnode)
//     case NodeType.STATEFUL_TEXT:
//       return templateForStatefulText(vnode)
//     case NodeType.STATEFUL_LIST:
//       return templateForStatefulList(vnode, idSequence, viteContext)
//     case NodeType.STATEFUL_SELECTOR:
//       return templateForStatefulSelector(vnode, idSequence, viteContext)
//     case NodeType.ELEMENT:
//       // return templateForElement(vnode, idSequence, viteContext)
//   }
// }

function toStatefulString(stateful: Stateful<string>): StatefulString {
  return (registry) => runQuery(registry, stateful) ?? ""
}

// function templateForText(vnode: TextNode): HTMLTemplate {
//   return { strings: [vnode.value], statefuls: [] }
// }

// function templateForStatefulText(vnode: StatefulTextNode): HTMLTemplate {
//   return {
//     strings: ["", ""],
//     statefuls: [
//       toStatefulString(vnode.generator)
//     ]
//   }
// }

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

// function templateForStatefulList(vnode: StatefulListNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
//   const elementId = idSequence.next

//   const listItemTemplate = buildHtmlTemplate(vnode.template.virtualNode, new IdSequence(elementId), viteContext)

//   return {
//     strings: [
//       `<!--${listStartIndicator(elementId)}-->`,
//       `<!--${listEndIndicator(elementId)}-->`
//     ],
//     statefuls: [
//       (registry) => {
//         const listData = runQuery(registry, vnode.query)
//         let html: string = ""
//         for (let i = 0; i < listData.length; i++) {
//           let overlayRegistry = vnode.template.createOverlayRegistry(registry, listData[i], i)
//           html += stringForTemplate(overlayRegistry, listItemTemplate)
//         }
//         return html
//       }
//     ]
//   }
// }

// function templateForStatefulSelector(vnode: StatefulSelectorNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
//   const elementId = idSequence.next

//   const templates = vnode.selectors.map((selector, index) => {
//     return buildHtmlTemplate(selector.template.virtualNode, new IdSequence(`${elementId}.${index}`), viteContext)
//   })

//   return {
//     strings: [
//       `<!--${switchStartIndicator(elementId)}-->`,
//       `<!--${switchEndIndicator(elementId)}-->`
//     ],
//     statefuls: [
//       (registry) => {
//         const selectedIndex = runQuery(registry, (get) => {
//           return vnode.selectors.findIndex(selector => selector.select(get))
//         })
//         if (selectedIndex === -1) {
//           return ""
//         }
//         return stringForTemplate(registry, templates[selectedIndex])
//       }
//     ]
//   }
// }

// function templateForElement(vnode: ElementNode, idSequence: IdSequence, viteContext: ViteContext | undefined): HTMLTemplate {
//   if (shouldTransformImport(viteContext, vnode, "script", "src")) {
//     return templateForImport(viteContext!, vnode, "script", "src")
//   }

//   if (shouldTransformImport(viteContext, vnode, "link", "href")) {
//     return templateForImport(viteContext!, vnode, "stylesheet", "href")
//   }

//   const attributes = vnode.data.attrs
//   const statefulAttributes = vnode.data.statefulAttrs ?? {}

//   if (vnode.data.props?.className) {
//     attributes["class"] = vnode.data.props?.className
//   }

//   if (vnode.data.statefulProps?.className) {
//     statefulAttributes["class"] = vnode.data.statefulProps.className
//   }

//   const elementId = idSequence.next
//   for (const k in vnode.data.on) {
//     if (EventsToDelegate.has(k)) {
//       attributes[`data-spheres-${k}`] = elementId
//     }
//   }

//   let staticAttrs = Object.keys(attributes)
//     .map(key => ` ${key}="${vnode.data.attrs[key]}"`)
//     .join("")

//   let strings: Array<string> = []
//   let statefuls: Array<StatefulString> = []

//   let currentString = `<${vnode.tag}${staticAttrs}`

//   for (const attr in statefulAttributes) {
//     currentString += ` ${attr}="`
//     strings.push(currentString)
//     statefuls.push(toStatefulString(statefulAttributes[attr]))
//     currentString = `"`
//   }

//   currentString += ">"

//   if (viteContext !== undefined && viteContext.command === "serve" && vnode.tag === "head") {
//     currentString += `<script type="module" src="/@vite/client"></script>`
//   }

//   if (voidElements.has(vnode.tag)) {
//     strings.push(currentString)
//     return { strings, statefuls }
//   }

//   if (vnode.data.props?.innerHTML) {
//     currentString += `${vnode.data.props.innerHTML}</${vnode.tag}>`
//     strings.push(currentString)
//     return { strings, statefuls }
//   }

//   if (vnode.data.statefulProps?.innerHTML) {
//     strings.push(currentString)
//     statefuls.push(toStatefulString(vnode.data.statefulProps.innerHTML))
//     strings.push(`</${vnode.tag}>`)
//     return { strings, statefuls }
//   }

//   for (const childNode of vnode.children) {
//     const template = buildHtmlTemplate(childNode, idSequence, viteContext)
//     currentString = currentString + (template.strings[0] ?? "")
//     if (template.strings.length > 1) {
//       strings.push(currentString)
//       strings = strings.concat(template.strings.slice(1, -1))
//       statefuls = statefuls.concat(template.statefuls ?? [])
//       currentString = template.strings[template.strings.length - 1]
//     }
//   }

//   strings.push(currentString + `</${vnode.tag}>`)

//   return { strings, statefuls }
// }

// function shouldTransformImport(viteContext: ViteContext | undefined, tag: string, attribute: string) {
//   if (viteContext === undefined) {
//     console.log("A")
//     return false
//   }

//   if (viteContext.command !== "build") {
//     console.log("B")
//     return false
//   }

//   console.log("Tag", tag)
//   return ((tag === "script" && attribute === "src") || (tag === "link" && attribute === "href"))
// }

// // function templateForImport(viteContext: ViteContext, vnode: ElementNode, assetType: "script" | "stylesheet", attributeName: string): HTMLTemplate {
// //   if (vnode.data.attrs[attributeName] !== undefined) {
// //     const linkData = getLinkData(viteContext, assetType, vnode.data.attrs[attributeName])
// //     return {
// //       strings: [renderLinks(viteContext, linkData)],
// //       statefuls: []
// //     }
// //   }

// //   const srcGenerator = vnode.data.statefulAttrs![attributeName]

// //   return {
// //     strings: ["", ""],
// //     statefuls: [
// //       (registry) => {
// //         const src = runQuery(registry, srcGenerator) ?? ""
// //         const linkData = getLinkData(viteContext, assetType, src)
// //         return renderLinks(viteContext, linkData)
// //       }
// //     ]
// //   }
// // }

// function renderLinks(viteContext: ViteContext, links: Array<LinkData>): string {
//   let html = ""
//   for (const link of links) {
//     const src = `${viteContext.base}${link.src}`
//     switch (link.type) {
//       case "script":
//         html += `<script type="module" src="${src}"></script>`
//         break
//       case "extra-script":
//         html += `<link rel="modulepreload" href="${src}">`
//         break
//       case "stylesheet":
//         html += `<link rel="stylesheet" href="${src}">`
//         break
//     }
//   }
//   return html
// }
