import { Stateful } from "../../store";
import { svgAttributeNames } from "../elementData";
import { ViewConfig, ViewConfigDelegate, ViewRendererDelegate } from "./viewRenderer";

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