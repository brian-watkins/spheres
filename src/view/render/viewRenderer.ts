import { GetState, State, Stateful } from "../../store/index.js"
import { SpecialElementAttributes } from "../specialAttributes.js"
import { ViewConfigDelegate } from "./viewConfig.js"

export interface ConfigurableElement<A extends SpecialElementAttributes, B> {
  config: A
  children: B
}

export type ViewDefinition = (root: any) => void

export type ElementDefinition = (el: ConfigurableElement<any, any>) => void

export interface ViewCaseSelector<T> {
    when<X extends T>(typePredicate: (val: T) => val is X, generator: (state: State<X>) => ViewDefinition): ViewCaseSelector<T>
    default(generator: (state: State<T>) => ViewDefinition): void
}

export interface ViewConditionSelector {
  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this
  default(view: ViewDefinition): void;
}

export interface ViewSelector {
  withUnion<T>(state: State<T>): ViewCaseSelector<T>
  withConditions(): ViewConditionSelector
}

export interface ViewRenderer {
  useDelegate(delegate: ViewRendererDelegate, runner: () => void): void
  textNode(value: string | Stateful<string>): this
  element(tag: string, builder?: ElementDefinition): this
  subview(view: ViewDefinition): this
  subviews<T>(
    data: (get: GetState) => Array<T>,
    viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition
  ): this
  subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this
}

export interface ViewRendererDelegate {
  createElement(tag: string): Element
  getConfigDelegate(tag: string): ViewConfigDelegate
}

export function isStateful<T>(value: T | Stateful<T>): value is Stateful<T> {
  return typeof value === "function"
}

abstract class BaseViewRenderer implements ViewRenderer {
  constructor(protected delegate: ViewRendererDelegate) { }

  abstract textNode(value: string | Stateful<string>): this
  abstract element(tag: string, builder?: ElementDefinition): this
  abstract subviews<T>(data: (get: GetState) => T[], viewGenerator: (item: State<T>, index?: State<number>) => ViewDefinition): this
  abstract subviewFrom(selectorGenerator: (selector: ViewSelector) => void): this

  subview(view: ViewDefinition): this {
    view(this)
    return this
  }

  useDelegate(delegate: ViewRendererDelegate, runner: () => void) {
    const oldDelegate = this.delegate
    this.delegate = delegate
    runner()
    this.delegate = oldDelegate
  }
}

export const AbstractViewRenderer = new Proxy(BaseViewRenderer, {
  construct(targetClass, args, newInstanceClass) {
    const obj = Reflect.construct(targetClass, args, newInstanceClass)
    return new Proxy(obj, {
      get: function (target, prop, receiver) {
        if (Reflect.has(obj, prop)) {
          return Reflect.get(target, prop, receiver)
        }
        else {
          return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
            target.element(prop as string, builder)
            return receiver
          }
        }
      }
    })
  }
})