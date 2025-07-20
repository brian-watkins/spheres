import { StoreEventHandler } from "./index.js"
import { Stateful } from "../../store/index.js"
import { ElementConfigSupport } from "../elementSupport.js"

export interface ViewConfig {
  attribute(name: string, value: string | Stateful<string>): this
  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this
  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: StoreEventHandler<any>): this
}

abstract class BaseViewConfig implements ViewConfig {
  constructor(protected configSupport: ElementConfigSupport) { }

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
          return function (...args: Array<any>) {
            target.configSupport.configure(target, prop, args)
            return receiver
          }
        }
      }
    })
  }
})