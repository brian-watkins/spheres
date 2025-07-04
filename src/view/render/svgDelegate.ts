import { Stateful } from "../../store/index.js";
import { svgAttributeNames } from "../elementData.js";
import { DomRendererDelegate } from "./domRendererDelegate.js";
import { ViewConfig, ViewConfigDelegate } from "./viewConfig.js";

export class SvgRendererDelegate implements DomRendererDelegate {
  private configDelegate = new SvgConfigDelegate()

  createElement(tag: string): Element {
    return document.createElementNS("http://www.w3.org/2000/svg", tag)
  }

  useDelegate(): DomRendererDelegate {
    return this
  }

  getConfigDelegate(): ViewConfigDelegate {
    return this.configDelegate
  }
}

export class SvgConfigDelegate implements ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    const attribute = svgAttributeNames().get(name) ?? name
    return config.attribute(attribute, value)
  }
}