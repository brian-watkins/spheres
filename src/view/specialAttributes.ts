import { Stateful, StoreMessage } from "../store/index.js";
import { AriaAttribute } from "./elementData.js";

export interface SpecialElementAttributes {
  attribute(name: string, value: string | Stateful<string>): this
  dataAttribute(name: string, value?: string | Stateful<string>): this
  innerHTML(html: string | Stateful<string>): this
  aria(name: AriaAttribute, value: string | Stateful<string>): this
  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: (evt: E extends keyof HTMLElementEventMap ? HTMLElementEventMap[E] : Event) => StoreMessage<any>): this
}


