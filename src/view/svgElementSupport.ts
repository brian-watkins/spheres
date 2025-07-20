import { svgAttributeNames } from "./elementData.js";
import { BasicElementConfigSupport, ElementConfig, ElementConfigSupport, ElementSupport } from "./elementSupport.js";

export class SVGElementSupport implements ElementSupport {
  private configSupport = new BasicElementConfigSupport(new SVGElementConfigSupport())
  
  createElement(tag: string): Element {
    return document.createElementNS("http://www.w3.org/2000/svg", tag)
  }

  getConfigSupport(): ElementConfigSupport {
    return this.configSupport
  }
}

class SVGElementConfigSupport implements ElementConfigSupport {
  configure(config: ElementConfig, name: string, args: Array<any>): void {
    const attribute = svgAttributeNames().get(name) ?? name
    config.attribute(attribute, args[0])
  }
}