import { command, supplied, SuppliedState } from "../store/index.js";
import { CommandController, TokenRegistry } from "../store/tokenRegistry.js";

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

declare const domEffectBrand: unique symbol

export type GetElement = <T extends Element>(id: ElementIdentifier<T>) => T

export interface DomEffect {
  readonly [domEffectBrand]: true
  effect: (getElement: GetElement) => void
}

export function domEffect(
  effect: (getElement: GetElement) => void
): DomEffect {
  return { effect } as DomEffect
}

export type DomAction = DomEffect

export const domAction = command<DomAction>()

export class DomActionController implements CommandController<DomAction> {
  run(registry: TokenRegistry, message: DomAction): void {
    message.effect((elementId) => {
      const nodeController = registry.getState(elementId[elementToken])

      const element = nodeController.getValue()
      if (element === undefined) {
        throw new Error("Attempt to resolve an unknown element identifier! Use the elementIdentifier method when configuring a view element to associate the identifier with an element.")
      }

      return element
    })
  }
}