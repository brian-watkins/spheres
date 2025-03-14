import { Stateful } from "../../store/index.js";
import { ViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { ViewRendererDelegate } from "./viewRenderer.js";

export interface HTMLRendererDelegateOptions {
  isSSR?: boolean
}

export class HtmlRendererDelegate implements ViewRendererDelegate {
  private configDelegate: HtmlConfigDelegate
  private inputConfigDelegate: HtmlInputConfigDelegate

  constructor(options: HTMLRendererDelegateOptions = {}) {
    this.configDelegate = new HtmlConfigDelegate(options.isSSR ?? false)
    this.inputConfigDelegate = new HtmlInputConfigDelegate(options.isSSR ?? false)
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

export class HtmlConfigDelegate implements ViewConfigDelegate {
  constructor(protected isSSR: boolean) { }

  defineAttribute(config: ViewConfig, name: string, value: string | boolean | Stateful<string | boolean>) {
    if (!this.isSSR && name === "class") {
      return config.property("className", value)
    }

    if (!this.isSSR && name === "checked") {
      return config.property("checked", value)
    }

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

export class HtmlInputConfigDelegate extends HtmlConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (!this.isSSR && name === "value") {
      return config.property("value", value)
    }

    return super.defineAttribute(config, name, value)
  }
}