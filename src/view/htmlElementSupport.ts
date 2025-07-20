import { BasicElementConfigSupport, ElementConfig, ElementConfigSupport, ElementSupport } from "./elementSupport.js";

export class HTMLElementSupport implements ElementSupport {
  private configSupport = new HtmlElementConfigSupport(
    new BasicElementConfigSupport()
  )
  private inputConfigSupport = new HtmlInputElementConfigSupport(this.configSupport)

  createElement(tag: string): Element {
    return document.createElement(tag)
  }

  getConfigSupport(tag: string): ElementConfigSupport {
    if (tag === "input") {
      return this.inputConfigSupport
    } else {
      return this.configSupport
    }
  }
}

class HtmlElementConfigSupport implements ElementConfigSupport {
  constructor(private next: ElementConfigSupport) { }
  
  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "class") {
      config.property("className", args[0])
      return
    }

    if (name === "checked") {
      config.property("checked", args[0])
      return
    }

    this.next.configure(config, name, args)
  }
}

class HtmlInputElementConfigSupport implements ElementConfigSupport {
  constructor(private next: ElementConfigSupport) { }

  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "value") {
      config.property("value", args[0])
      return
    }

    this.next.configure(config, name, args)
  }
}