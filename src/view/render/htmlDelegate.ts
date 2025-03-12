import { GetState, Stateful } from "../../store";
import { booleanAttributes } from "../elementData";
import { SvgConfigDelegate, SvgRendererDelegate } from "./svgDelegate";
import { ViewConfig, ViewConfigDelegate, ViewRendererDelegate } from "./viewRenderer";

export interface HTMLRendererDelegateOptions {
  isSSR?: boolean
}

export class HtmlRendererDelegate implements ViewRendererDelegate {
  private configDelegate: HtmlConfigDelegate
  private inputConfigDelegate: HtmlInputConfigDelegate

  constructor(private options: HTMLRendererDelegateOptions = {}) {
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
  constructor(private isSSR: boolean) { }
  
  // should probably check for boolean attributes here
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>) {
    if (name === "checked") {
      return config.property("checked", value)
    }

    if (name === "class") {
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

    // switch (name) {
    //   case "checked": {
    //     console.log("Rendering property", name)
        
    //     break
    //   }
    //   default: {
    //     console.log("Rendering attribute", name)
    //     config.attribute(name, value)
    //   }
    // }
  }
}

export class HtmlInputConfigDelegate extends HtmlConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    // need to fix this so it shows up as an attribute when SSR but need a test
    if (name === "value") {
      return config.property("value", value)
    }

    return super.defineAttribute(config, name, value)
  }
}