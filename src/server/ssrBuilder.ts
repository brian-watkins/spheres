import { HTMLBuilder, HTMLElements, HTMLView, LinkElementAttributes, ScriptElementAttributes } from "../view/htmlElements.js"
import { HtmlViewBuilder } from "../view/htmlViewBuilder.js"
import { ConfigurableElement } from "../view/viewBuilder.js"
import { BasicElementConfig } from "../view/viewConfig.js"
import { Stateful } from "../store/index.js"
import { addAttribute } from "../view/render/virtualNode.js"
import { manifest } from "./assetManifest.js"

class ScriptElementConfig extends BasicElementConfig {
  private _extraImports: Array<string> = []
  private _extraCSS: Array<string> = []

  reset() {
    this._extraImports = []
    this._extraCSS = []
  }

  get extraImports() {
    return this._extraImports
  }

  get extraStylesheets() {
    return this._extraCSS
  }

  src(value: string | Stateful<string>) {
    if (typeof value === "function") {

    } else {
      if (manifest !== undefined) {
        const normalized = normalizePath(value)
        const entryDetails = manifest[normalized]
        if (entryDetails.imports !== undefined) {
          this._extraImports = entryDetails.imports
        }
        if (entryDetails.css !== undefined) {
          this._extraCSS = entryDetails.css
        }
        addAttribute(this.config, "src", entryDetails.file)
      }
      else {
        addAttribute(this.config, "src", value)
      }

    }

    return this
  }
}

const scriptElementConfig = new ScriptElementConfig()

class LinkElementConfig extends BasicElementConfig {
  href(value: string | Stateful<string>) {
    if (typeof value === "function") {

    } else {
      if (manifest !== undefined) {
        const normalized = normalizePath(value)
        const entryDetails = manifest[normalized]
        if (entryDetails === undefined) {
          addAttribute(this.config, "href", value)
        } else {
          addAttribute(this.config, "href", entryDetails.file)
        }
      }
      else {
        addAttribute(this.config, "href", value)
      }
    }

    return this
  }
}

const linkElementConfig = new LinkElementConfig()

export class SSRBuilder extends HtmlViewBuilder {
  subview(view: HTMLView): this {
    const builder = new SSRBuilder()
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void) {
    this.buildElement("script", scriptElementConfig, builder as (element: ConfigurableElement<any, any>) => void)

    for (const extraImport of scriptElementConfig.extraImports) {
      this.link(el => {
        el.config
          .rel("modulepreload")
          .href(extraImport)
      })
    }

    for (const extraStylesheet of scriptElementConfig.extraStylesheets) {
      this.link(el => {
        el.config
          .rel("stylesheet")
          .href(extraStylesheet)
      })
    }

    return this
  }

  link(builder?: (element: ConfigurableElement<LinkElementAttributes, never>) => void) {
    return this.buildElement("link", linkElementConfig, builder as (element: ConfigurableElement<any, any>) => void)
  }
}

function normalizePath(path: string): string {
  let normalized = path
  if (path.startsWith("./")) {
    normalized = path.substring(2)
  }
  return normalized
}