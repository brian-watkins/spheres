import { CommandActions, CommandManager, supplied, SuppliedState } from "../store/index.js";
import { TokenRegistry } from "../store/tokenRegistry.js";

declare const elementType: unique symbol
const elementToken = Symbol("elementToken")

export interface ElementIdentifier<T extends Element = Element> {
  // The elementType property holds the correct type for this element.
  readonly [elementType]?: (el: T) => void
  // The type of SuppliedState needs to be any to satisfy typescript.
  [elementToken]: SuppliedState<any>
}

export function elementIdentifier<T extends Element = Element>(): ElementIdentifier<T> {
  return { [elementToken]: supplied({ initialValue: undefined }) }
}

export function storeElement(registry: TokenRegistry, identifier: ElementIdentifier<any>, element: Element) {
  const publisher = registry.getState(identifier[elementToken])
  publisher.publish(element)
}

export type GetElement = <T extends Element>(id: ElementIdentifier<T>) => T

export interface DomCommandActions extends CommandActions {
  getElement: GetElement
}

export interface DomCommandManager<M> {
  exec(message: M, actions: DomCommandActions): void
}

export function withDomActions<M>(manager: DomCommandManager<M>): CommandManager<M> {
  return {
    exec(message, actions) {
      manager.exec(message, {
        ...actions,
        getElement(identifier) {
          const element = actions.get(identifier[elementToken])
          if (element === undefined) {
            throw new Error("Attempt to resolve an unknown element identifier! Use the elementIdentifier method when configuring a view element to associate the identifier with an element.")
          }
          return element
        }
      })
    }
  }
}