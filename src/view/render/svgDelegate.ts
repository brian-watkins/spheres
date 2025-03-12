import { Stateful } from "../../store/index.js";
import { svgAttributeNames } from "../elementData.js";
import { ViewConfig, ViewConfigDelegate } from "./viewConfig.js";
import { ViewRendererDelegate } from "./viewRenderer.js";

export class SvgRendererDelegate implements ViewRendererDelegate {
  private configDelegate = new SvgConfigDelegate()

  createElement(tag: string): Element {
    return document.createElementNS("http://www.w3.org/2000/svg", tag)
  }

  getRendererDelegate(): ViewRendererDelegate {
    return this
  }

  getConfigDelegate(): ViewConfigDelegate {
    return this.configDelegate
  }
}

export class SvgConfigDelegate implements ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    const attribute = svgAttributeNames.get(name) ?? name
    return config.attribute(attribute, value)
  }
}