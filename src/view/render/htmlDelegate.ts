import { Stateful } from "../../store/index.js";
import { ViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { ViewRendererDelegate } from "./viewRenderer.js";

export class HtmlRendererDelegate implements ViewRendererDelegate {
  private configDelegate: ViewConfigDelegate
  private inputConfigDelegate: ViewConfigDelegate

  constructor() {
      this.configDelegate = new HtmlConfigDelegate()
      this.inputConfigDelegate = new HtmlInputConfigDelegate()
  }

  createElement(tag: string): Element {
    return document.createElement(tag)
  }

  getConfigDelegate(tag: string): ViewConfigDelegate {
    if (tag === "input") {
      return this.inputConfigDelegate
    } else {
      return this.configDelegate
    }
  }
}

export class BooleanAttributesDelegate implements ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | boolean | Stateful<string | boolean>): ViewConfig {
    switch (typeof value) {
      case "function": {
        return config.attribute(name, (get) => {
          const attrValue = value(get)
          if (typeof attrValue === "boolean") {
            return attrValue ? "" : undefined
          } else {
            return attrValue
          }
        })
      }
      case "boolean": {
        if (value) {
          return config.attribute(name, "")
        } else {
          return config
        }
      }
      default: {
        return config.attribute(name, value)
      }
    }
  }
}

export class HtmlConfigDelegate extends BooleanAttributesDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | boolean | Stateful<string | boolean>) {
    if (name === "class") {
      return config.property("className", value)
    }

    if (name === "checked") {
      return config.property("checked", value)
    }

    return super.defineAttribute(config, name, value)
  }
}

export class HtmlInputConfigDelegate extends HtmlConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "value") {
      return config.property("value", value)
    }

    return super.defineAttribute(config, name, value)
  }
}