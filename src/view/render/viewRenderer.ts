import { GetState, Stateful } from "../../store/index.js"
import { ElementSupport } from "../elementSupport.js"
import { SpecialElementAttributes } from "../specialAttributes.js"

export interface ConfigurableElement<A extends SpecialElementAttributes, B> {
  config: A
  children: B
}

export type ViewDefinition = (root: any) => void

export type ElementDefinition = (el: ConfigurableElement<any, any>) => void

export type UseCase<T> = <S>(
  generator: (
    dataReference: T,
    get: GetState
  ) => S
) => Stateful<S>

export interface ViewCaseMatcher<T> {
  when<X extends T>(typePredicate: (val: T) => val is X, generator: (useCase: UseCase<X>) => ViewDefinition): ViewCaseMatcher<T>
  default(generator: (useCase: UseCase<T>) => ViewDefinition): void
}

export interface ViewConditionMatcher {
  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this
  default(view: ViewDefinition): void;
}

export interface ViewMatcher {
  withUnion<T>(unionValue: (get: GetState) => T): ViewCaseMatcher<T>
  withConditions(): ViewConditionMatcher
}

export interface ListItem<T> {
  data: T
  index: number
}

export type UseItem<T> = <S>(
  generator: (
    item: ListItem<T>,
    get: GetState
  ) => S
) => Stateful<S>

export interface ViewRenderer {
  textNode(value: string | Stateful<string>): this
  element(tag: string, builder?: ElementDefinition, support?: ElementSupport): this
  subview(view: ViewDefinition): this
  subviews<T>(
    data: (get: GetState) => Array<T>,
    viewGenerator: (useItem: UseItem<T>) => ViewDefinition
  ): this
  subviewMatching(matcherGenerator: (matcher: ViewMatcher) => void): this
}

abstract class BaseViewRenderer implements ViewRenderer {
  abstract textNode(value: string | Stateful<string>): this
  abstract element(tag: string, builder?: ElementDefinition, support?: ElementSupport): this
  abstract subviewMatching(matcherGenerator: (matcher: ViewMatcher) => void): this
  abstract subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (useItem: UseItem<T>) => ViewDefinition): this

  subview(view: ViewDefinition): this {
    view(this)
    return this
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