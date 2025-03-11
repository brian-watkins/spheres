import { GetState, State, Stateful } from "../../store"
import { SpecialElementAttributes } from "../specialAttributes"
import { ViewBuilder } from "../viewBuilder"
import { StoreEventHandler } from "./virtualNode"

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

// can we provide a decorator to handle special cases like the input element?
// And providing the namespace for the svg builder? Also svg attribute names
// need to be handled differently
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

// Seems like this really should just be recordAttribute, recordProperty, and on
// And then maybe we could provide a decorator or something?
export interface ViewConfig {
  dataAttribute(name: string, value: string | Stateful<string>): this
  innerHTML(html: string | Stateful<string>): this
  recordAttribute(name: string, value: string | Stateful<string>): this
  recordProperty<T extends string | boolean>(name: string, value: T | Stateful<T>): this
  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this
}