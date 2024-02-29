import { GetState, State, Store } from "@spheres/store"
import { VirtualNode, makeStatefulElement, Stateful, makeTemplate, addStatefulProperty, addProperty } from "./vdom/virtualNode.js"
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

// maybe this should ONLY take a HTMLViewFunction<undefined>
export function renderToDOM(store: Store, element: Element, view: HtmlViewFunction): RenderResult {
  const render = createDOMRenderer(store)
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const renderResult = render(element, builder.toVirtualNode())

  return {
    root: renderResult.root,
    unmount: () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }
}

export function renderToString(store: Store, view: HtmlViewFunction): string {
  const render = createStringRenderer(store)
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  return render(builder.toVirtualNode())
}


// View

// It doesn't seem to make sense to have this be typed if there's no way to
// provide a context to it ... I guess this makes sense in the case of
// stateless zones where we can pass props via the options object. The thing
// is that you can use this in cases where you can't (currently) provide
// props, like as the root view that's passed to renderToDOM()
export type HtmlViewFunction<T = undefined> = (root: HTMLBuilder<T>) => void

// And this doesn't really make sense ... why would the root builder here
// need to take the same props? It's more that this reactive zone would
// be itself part of a builder that has props of type T that get passed to
// this ...
// export type ReactiveHtmlViewFunction<T> = (root: HTMLBuilder<T>, get: GetState, context: T) => void
export type ReactiveHtmlViewFunction<T, S> = (get: GetState, props: T) => HtmlViewFunction<S>


function toVirtualNode<T>(view: HtmlViewFunction<T>): VirtualNode {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder<T>)
  return builder.toVirtualNode()
}

function toReactiveVirtualNode<T, S>(generator: ReactiveHtmlViewFunction<T, S>, get: GetState, context: T): VirtualNode {
  const builder = new HtmlViewBuilder()
  generator(get, context)(builder as unknown as HTMLBuilder<S>)
  // view(builder as unknown as HTMLBuilder<T>, get, context)
  return builder.toVirtualNode()
}

export interface ZoneDetails<T> {
  template: HtmlViewFunction<T>
  props: T
  key?: string | number | State<any>
}

export interface SpecialHTMLElements<Context> {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes<Context>, HTMLElements<Context>, Context>) => void): this
  textNode(value: string | Stateful<string, Context>): this
  zone<T>(definition: ZoneDetails<T> | ((get: GetState, props: T) => ZoneDetails<undefined>)): this
  // zone<T>(definition: HtmlViewFunction<T>, options?: ViewOptions<T>): this
  // reactiveZone<T, S>(generator: ReactiveHtmlViewFunction<T, S>, options?: ViewOptions<T>): this
}

const configBuilder = new BasicElementConfig()

class InputElementConfig extends BasicElementConfig {
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

class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes<any>, HTMLElements<any>, any> {
  zone<T>(definition: HtmlViewFunction<T>, options?: ViewOptions<T>) {
    // if (definition.length > 1) {
      // this.storeNode(makeStatefulElement((get, context) => toReactiveVirtualNode(definition, get, context), options?.key))
    // } else {
      let vnode = this.getTemplateNode(definition)
      if (vnode === undefined) {
        vnode = toVirtualNode(definition as HtmlViewFunction<any>)
        this.setTemplateNode(definition, vnode)
      }
      this.storeNode(makeTemplate(vnode, options?.props, options?.key))
    // }

    return this
  }

  reactiveZone<T, S>(generator: ReactiveHtmlViewFunction<T, S>, options?: ViewOptions<T>) {
    // NOTE THAT options.props is not even used here?!?
    // In fact it never gets used ... BUT if this reactiveZone is inside
    // another zone with props, then those props will be passed to this as part
    // of the template effects ...
    this.storeNode(makeStatefulElement((get, props) => toReactiveVirtualNode(generator, get, props), options?.key))
    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes<any>, HTMLElements<any>, any>) => void) | undefined): this {
    return this.buildElement(tag, configBuilder, builder)
  }

  svg(builder?: (element: ConfigurableElement<SpecialElementAttributes<any>, SVGElements<any>, any>) => void) {
    this.storeNode(buildSvgElement(builder))
    return this
  }

  input(builder?: (element: ConfigurableElement<SpecialElementAttributes<any>, HTMLElements<any>, any>) => void) {
    return this.buildElement("input", inputConfigBuilder, builder)
  }
}
