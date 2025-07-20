import { Stateful } from "../store/index.js"

export interface ElementConfig {
  attribute(name: string, value: string | Stateful<string>): this
  property<T extends string | boolean>(name: string, value: T | Stateful<T>): this
}

export interface ElementConfigSupport {
  configure(config: ElementConfig, name: string, args: Array<any>): void
}

export interface ElementSupport {
  createElement(tag: string): Element
  getConfigSupport(tag: string): ElementConfigSupport
}

export class BasicElementConfigSupport implements ElementConfigSupport {
  constructor(private next: ElementConfigSupport = new AttributeElementConfigSupport()) { }
  
  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "dataAttribute") {
      config.attribute(`data-${args[0]}`, args[1] ?? "true")
      return
    }
    if (name === "aria") {
      config.attribute(`aria-${args[0]}`, args[1])
      return
    }
    if (name === "innerHTML") {
      config.property("innerHTML", args[0])
      return
    }

    const value = args[0]
    switch (typeof value) {
      case "function": {
        config.attribute(name, (get) => {
          const attrValue = value(get)
          if (typeof attrValue === "boolean") {
            return attrValue ? "" : undefined
          } else {
            return attrValue
          }
        })
        break
      }
      case "boolean": {
        if (value) {
          config.attribute(name, "")
        }
        break
      }
      default: {
        this.next.configure(config, name, args)
      }
    }
  }
}

class AttributeElementConfigSupport implements ElementConfigSupport {
  configure(config: ElementConfig, name: string, args: Array<any>): void {
    config.attribute(name, args[0])
  }
}