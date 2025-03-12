import { StoreEventHandler } from "./index.js"
import { Stateful } from "../../store/index.js"
import { AriaAttribute } from "../elementData.js"

export interface ViewConfig {
  dataAttribute(name: string, value: string | Stateful<string>): this
  innerHTML(html: string | Stateful<string>): this
  aria(name: AriaAttribute, value: string | Stateful<string>): this
  attribute(name: string, value: string | Stateful<string>): this
  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this
  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this
}

export interface ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig
}

export abstract class AbstractViewConfig implements ViewConfig {
  constructor (protected delegate: ViewConfigDelegate) { }

  dataAttribute(name: string, value: string | Stateful<string> = "true"): this {
    return this.attribute(`data-${name}`, value)
  }

  innerHTML(html: string | Stateful<string>): this {
    return this.property("innerHTML", html)
  }

  aria(name: AriaAttribute, value: string | Stateful<string>): this {
    return this.attribute(`aria-${name}`, value)
  }

  abstract attribute(name: string, value: string | Stateful<string>): this
  
  abstract property<T extends string | boolean>(name: string, value: T | Stateful<T>): this
  
  abstract on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this
}

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

Object.setPrototypeOf(AbstractViewConfig.prototype, MagicConfig)