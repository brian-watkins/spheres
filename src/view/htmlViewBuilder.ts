import { GetState, State, Store } from "../store/index.js"
import { makeStatefulElement, Stateful, addStatefulProperty, addProperty, VirtualTemplate, makeVirtualTextNode, makeZoneList } from "./vdom/virtualNode.js"
import { HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder, ViewOptions } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"

// Renderers

export interface RenderResult {
  root: Node
  unmount: () => void
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const render = createDOMRenderer(store)
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  const renderResult = render(element, builder.toVirtualNode())

  return {
    root: renderResult.root,
    unmount: () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }
}

export function renderToString(store: Store, view: HTMLView): string {
  const render = createStringRenderer(store)
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  return render(builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

const template: unique symbol = Symbol();
const templateArgs: unique symbol = Symbol();

export interface HTMLTemplateView<T> {
  [template]: HTMLVirtualTemplate<T>
  [templateArgs]: T
}

// export type HTMLDisplay = HTMLTemplateView<any>

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: HTMLView, options?: ViewOptions): this
  zoneShow(when: (get: GetState) => boolean, view: HTMLView): this
  zones<T>(data: Stateful<Array<T>>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this
}

class HTMLElementConfig extends BasicElementConfig {
  class(value: string | Stateful<string>): this {
    if (typeof value === "function") {
      addStatefulProperty(this.config, "className", value)
    } else {
      addProperty(this.config, "className", value)
    }

    return this
  }
}

const configBuilder = new HTMLElementConfig()

class InputElementConfig extends HTMLElementConfig {
  value(val: string | Stateful<string>) {
    if (typeof val === "function") {
      addStatefulProperty(this.config, "value", val)
    } else {
      addProperty(this.config, "value", val)
    }

    return this
  }

  checked(value: boolean | Stateful<boolean>) {
    this.recordBooleanProperty("checked", value)

    return this
  }
}

const inputConfigBuilder = new InputElementConfig()

// function toReactiveVirtualNode(generator: (get: GetState) => HTMLView, get: GetState): VirtualNode {
//   const builder = new HtmlViewBuilder()
//   generator(get)(builder as unknown as HTMLBuilder)
//   return builder.toVirtualNode()
// }

class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes, HTMLElements> implements SpecialHTMLElements {
  zone(view: HTMLView, _?: ViewOptions | undefined): this {
    // We're just going to assume that there's no args here
    // But we still want to treat this as a block I think
    // this.storeNode(makeBlockElement(() => {
      const builder = new HtmlViewBuilder()
      view(builder as unknown as HTMLBuilder)
      this.storeNode(builder.toVirtualNode())
    // }, options?.key))
    
    // if (typeof view === "function") {
      // this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode(view, get), options?.key))
    // } else {
      // this.storeNode(makeTemplate(view[template], view[templateArgs], options?.key))
    // }

    return this
  }

  zoneShow(when: (get: GetState) => boolean, view: HTMLView): this {
    // We need to somehow fix this so that it only converts the view to a
    // virtual node once ...
    // Note should we defer this somehow? So it only creates the virtual node
    // the very first time it renders? Probably doesn't matter too much
    const viewBuilder = new HtmlViewBuilder()
    view(viewBuilder as unknown as HTMLBuilder)
    const viewVirtualNode = viewBuilder.toVirtualNode()
    
    // this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode((get) => {
      // return when(get) ? view : root => root.textNode("")
    // }, get), undefined))

    const emptyTextNode = makeVirtualTextNode("")

    this.storeNode(makeStatefulElement(get => {
      return when(get) ? viewVirtualNode : emptyTextNode
    }, undefined))

    return this
  }

  zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this {
    // here we should just store a function that can generate the VirtualTemplate
    // the viewGenerator itself would be the best but the vdom shouldn't know about
    // HTML vs SVG ...
    // But I mean maybe it doesn't matter. We just create it here because we are
    // just calling zones once anyway ... The downside would be that another zone
    // with the same template function would still be treated as a separate template
    // but it probably doesn't matter
    const virtualTemplate = new HTMLVirtualTemplate(viewGenerator)

    this.storeNode(makeZoneList(virtualTemplate, data))

    return this
  }

  // zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (args: T) => HTMLTemplateView<T>): this {
  //   this.storeNode(makeTemplateList((args) => {
  //     const tempInstance = viewGenerator(args)
  //     return makeTemplate(tempInstance[template], tempInstance[templateArgs], args)
  //   }, data))

  //   return this
  // }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void) | undefined): this {
    return this.buildElement(tag, configBuilder, builder)
  }

  svg(builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) {
    this.storeNode(buildSvgElement(builder))
    return this
  }

  input(builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void) {
    return this.buildElement("input", inputConfigBuilder, builder)
  }
}

// VirtualTemplate gets passed to the vdom ... so it's basically like a
// virtual node -- or it's stored as part of the TemplateNode. It's the
// thing that allows us to pass args BECAUSE it generates a virtual node
// that contains thunks that capture the args variable, which we can set
// whenever we want to evaluate these for a particular instance (with its
// own args). Of course I wish we didn't have to do that.

export class HTMLVirtualTemplate<T> extends VirtualTemplate<T> {
  constructor(generator: (item: State<T>, index: State<number>) => HTMLView) {
    super()

    this.usesIndex = generator.length == 2

    const builder = new HtmlViewBuilder()
    generator(this.itemToken as State<T>, this.indexToken)(builder as unknown as HTMLBuilder)
    this.virtualNode = builder.toVirtualNode()
   }
  // constructor(generator: (withProps: WithArgs<T>) => HTMLView, protected args: T) {
  //   super()

  //   const builder = new HtmlViewBuilder()

  //   generator((handler) => {
  //     return (get) => {
  //       return handler(this.args, get)
  //     }
  //   })(builder as unknown as HTMLBuilder)

  //   this.virtualNode = builder.toVirtualNode()
  // }
}

// class HTMLTemplateDetails<P> implements HTMLTemplateView<P> {
//   [template]: HTMLVirtualTemplate<P>
//   [templateArgs]: any

//   constructor(temp: HTMLVirtualTemplate<P>, args: any) {
//     this[template] = temp
//     this[templateArgs] = args
//   }
// }

// export function htmlTemplate<P = undefined>(definition: (withArgs: WithArgs<P>) => HTMLView): (...props: ViewArgs<P>) => HTMLTemplateView<P> {
//   let virtualTemplate: HTMLVirtualTemplate<P> | undefined

//   return (...args: ViewArgs<P>) => {
//     const viewArgs: any = args.length == 0 ? undefined : args[0]

//     if (virtualTemplate === undefined) {
//       virtualTemplate = new HTMLVirtualTemplate(definition, viewArgs)
//     }

//     return new HTMLTemplateDetails(virtualTemplate, viewArgs)
//   }
// }