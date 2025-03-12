import { GetState, Stateful } from "../../store/index.js";
import { booleanAttributes } from "../elementData.js";
import { SvgConfigDelegate, SvgRendererDelegate } from "./svgDelegate.js";
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
    if (tag === "svg") {
      return document.createElementNS("http://www.w3.org/2000/svg", "svg")
    } else {
      return document.createElement(tag)
    }
  }

  getRendererDelegate(tag: string): ViewRendererDelegate {
    if (tag === "svg") {
      return new SvgRendererDelegate()
    } else {
      return this
    }
  }

  getConfigDelegate(tag: string): ViewConfigDelegate {
    if (tag === "svg") {
      return new SvgConfigDelegate()
    }
    
    if (tag === "input") {
      return this.inputConfigDelegate
    } else {
      return this.configDelegate
    }
  }
}

export class HtmlConfigDelegate implements ViewConfigDelegate {
  constructor(protected isSSR: boolean) { }
  
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>) {
    if (!this.isSSR && name === "checked") {
      return config.property("checked", value)
    }

    if (!this.isSSR && name === "class") {
      return config.property("className", value)
    }
    
    if (booleanAttributes.has(name)) {
      if (typeof value === "function") {
        return config.attribute(name, (get: GetState) => value(get) ? name : undefined)
      } else {
        if (value) {
          return config.attribute(name, name)
        } else {
          return config
        }
      }
    }

    return config.attribute(name, value)
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