import { Stateful, StoreMessage } from "../store/index.js"
import { SpecialElementAttributes } from "./specialAttributes.js"
import { StoreEventHandler, VirtualNodeConfig, addAttribute, addProperty, addStatefulAttribute, addStatefulProperty, setEventHandler, virtualNodeConfig } from "./render/virtualNode.js"
import { booleanAttributes } from "./elementData.js"

export class BasicElementConfig implements SpecialElementAttributes {
  protected config: VirtualNodeConfig = virtualNodeConfig()

  recordAttribute(attribute: string, value: string | Stateful<string>) {
    if (typeof value === "function") {
      addStatefulAttribute(this.config, attribute, value)
    } else {
      addAttribute(this.config, attribute, value)
    }
    return this
  }

  recordBooleanAttribute(attribute: string, isSelected: boolean | Stateful<boolean>) {
    if (typeof isSelected === "function") {
      addStatefulAttribute(this.config, attribute, (get) => isSelected(get) ? attribute : undefined)
    } else {
      if (isSelected) {
        addAttribute(this.config, attribute, attribute)
      }
    }
    return this
  }

  recordBooleanProperty(name: string, isSelected: boolean | Stateful<boolean>) {
    if (typeof isSelected === "function") {
      addStatefulProperty(this.config, name, (get) => isSelected(get) ? name : undefined)
    } else {
      if (isSelected) {
        addProperty(this.config, name, name)
      }
    }
    return this
  }

  innerHTML(html: string | Stateful<string>): this {
    if (typeof html === "function") {
      addStatefulProperty(this.config, "innerHTML", html)
    } else {
      addProperty(this.config, "innerHTML", html)
    }

    return this
  }

  attribute(name: string, value: string | Stateful<string>) {
    if (typeof value === "function") {
      addStatefulAttribute(this.config, name, value)
    } else {
      addAttribute(this.config, name, value)
    }

    return this
  }

  dataAttribute(name: string, value: string | Stateful<string> = "true") {
    if (typeof value === "function") {
      addStatefulAttribute(this.config, `data-${name}`, value)
    } else {
      addAttribute(this.config, `data-${name}`, value)
    }

    return this
  }

  aria(name: string, value: string | Stateful<string>) {
    if (typeof value === "function") {
      addStatefulAttribute(this.config, `aria-${name}`, value)
    } else {
      addAttribute(this.config, `aria-${name}`, value)
    }

    return this
  }

  on<E extends keyof HTMLElementEventMap | string>(event: E, handler: (evt: E extends keyof HTMLElementEventMap ? HTMLElementEventMap[E] : Event) => StoreMessage<any>): this {
    setEventHandler(this.config, event, handler as StoreEventHandler<any>)
    return this
  }

  resetConfig(config: VirtualNodeConfig) {
    this.config = config
  }
}

const MagicConfig = new Proxy({}, {
  get: (_, prop, receiver) => {
    const attribute = prop as string
    if (booleanAttributes.has(attribute)) {
      return function (isSelected: boolean | Stateful<boolean>) {
        return receiver.recordBooleanAttribute(attribute, isSelected)
      }
    } else {
      return function (value: string | Stateful<string>) {
        return receiver.recordAttribute(attribute, value)
      }
    }
  }
})

Object.setPrototypeOf(BasicElementConfig.prototype, MagicConfig)
