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
  defineAttribute(config: ViewConfig, name: string, value: string | boolean | Stateful<string | boolean>): ViewConfig
}

abstract class BaseViewConfig implements ViewConfig {
  constructor(protected delegate: ViewConfigDelegate) { }

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

export const AbstractViewConfig = new Proxy(BaseViewConfig, {
  construct(targetClass, args, newInstanceClass) {
    const obj = Reflect.construct(targetClass, args, newInstanceClass)
    return new Proxy(obj, {
      get: function (target, prop, receiver) {
        if (Reflect.has(obj, prop)) {
          return Reflect.get(target, prop, receiver)
        }
        else {
          return function (value: string | Stateful<string>) {
            target.delegate.defineAttribute(target, prop, value)
            return receiver
          }
        }
      }
    })
  }
})