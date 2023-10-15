import { Stateful, StoreMessage } from "state-party"
import { AriaAttribute, booleanAttributes } from "./htmlElements.js"
import { VirtualNodeConfig, addAttribute, addProperty, addStatefulAttribute, addStatefulProperty, setEventHandler, virtualNodeConfig } from "./vdom/virtualNode.js"
import { svgAttributeNames } from "./svgElements.js"

export interface SpecialAttributes {
  dataAttribute(name: string, value?: string | Stateful<string>): this
  innerHTML(html: string | Stateful<string>): this
  aria(name: AriaAttribute, value: string | Stateful<string>): this
  on(event: keyof HTMLElementEventMap, handler: <E extends Event>(evt: E) => StoreMessage<any>): this
}

export class BasicElementConfig implements SpecialAttributes {
  protected config: VirtualNodeConfig = virtualNodeConfig()

  recordAttribute(attributeAlias: string, value: string | Stateful<string>) {
    const attribute = svgAttributeNames.get(attributeAlias) ?? attributeAlias
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

  on(event: keyof HTMLElementEventMap, handler: <E extends Event>(evt: E) => StoreMessage<any>) {
    setEventHandler(this.config, event, handler)
    return this
  }

  resetConfig(config: VirtualNodeConfig) {
    this.config = config
  }
}

export class InputElementConfig extends BasicElementConfig {
  value(val: string | Stateful<string>) {
    if (typeof val === "function") {
      addStatefulProperty(this.config, "value", val)
    } else {
      addProperty(this.config, "value", val)
    }

    return this
  }

  checked(value: boolean | Stateful<boolean>) {
    this.recordBooleanProperty("checked", value)

    return this
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

Object.setPrototypeOf(Object.getPrototypeOf(new BasicElementConfig()), MagicConfig)
