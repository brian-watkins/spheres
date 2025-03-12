import { GetState, State, Stateful } from "../../store/index.js"
import { SpecialElementAttributes } from "../specialAttributes.js"
import { ViewConfigDelegate } from "./viewConfig.js"

export interface ConfigurableElement<A extends SpecialElementAttributes, B> {
  config: A
  children: B
}

export type ViewDefinition = (root: any) => void

export type ElementDefinition = (el: ConfigurableElement<any, any>) => void

export interface ViewSelector {
  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this
  default(view: ViewDefinition): void;
}

export interface ViewRenderer {
  textNode(value: string | Stateful<string>): this
  element(tag: string, builder?: ElementDefinition): this
  subview(view: ViewDefinition): this
  subviews<T>(
    data: (get: GetState) => Array<T>,
    viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition
  ): this
  subviewOf(selectorGenerator: (selector: ViewSelector) => void): this
}

export interface ViewRendererDelegate {
  createElement(tag: string): Element
  getRendererDelegate(tag: string): ViewRendererDelegate
  getConfigDelegate(tag: string): ViewConfigDelegate
}

export function isStateful<T>(value: T | Stateful<T>): value is Stateful<T> {
  return typeof value === "function"
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

export function decorateViewRenderer(renderer: any): void {
  Object.setPrototypeOf(renderer.prototype, MagicElements)
}