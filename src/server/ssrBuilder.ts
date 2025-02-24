import { HTMLBuilder, HTMLElements, HTMLView, LinkElementAttributes, ScriptElementAttributes } from "../view/htmlElements.js"
import { HtmlViewBuilder } from "../view/htmlViewBuilder.js"
import { ConfigurableElement } from "../view/viewBuilder.js"
import { BasicElementConfig } from "../view/viewConfig.js"
import { Stateful } from "../store/index.js"
import { addAttribute } from "../view/render/virtualNode.js"
import { runQuery, TokenRegistry } from "../store/tokenRegistry.js"
import type { Manifest } from "vite"

class ScriptElementConfig extends BasicElementConfig {
  private _extraImports: Array<string> = []
  private _extraCSS: Array<string> = []

  constructor(private tokenRegistry: TokenRegistry, private manifest: Manifest | undefined) {
    super()
  }

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
    const resolvedSrc = typeof value === "function" ? runQuery(this.tokenRegistry, value) ?? "" : value

    if (this.manifest !== undefined) {
      const normalized = normalizePath(resolvedSrc)
      const entryDetails = this.manifest[normalized]
      if (entryDetails.imports !== undefined) {
        this._extraImports = entryDetails.imports
      }
      if (entryDetails.css !== undefined) {
        this._extraCSS = entryDetails.css
      }
      addAttribute(this.config, "src", entryDetails.file)
    }
    else {
      addAttribute(this.config, "src", resolvedSrc)
    }

    return this
  }
}

class LinkElementConfig extends BasicElementConfig {
  private extraCSS: Array<string> = []
  private extraImports: Array<string> = []

  constructor(private tokenRegistry: TokenRegistry, private manifest: Manifest | undefined) {
    super()
  }

  get extraStylesheets() {
    return this.extraCSS
  }

  get extraScripts() {
    return this.extraImports
  }

  href(value: string | Stateful<string>) {
    const resolvedHref = typeof value === "function" ? runQuery(this.tokenRegistry, value) ?? "" : value

    if (this.manifest !== undefined) {
      const normalized = normalizePath(resolvedHref)
      const entryDetails = this.manifest[normalized]
      if (entryDetails === undefined) {
        addAttribute(this.config, "href", resolvedHref)
      } else {
        if (entryDetails.css !== undefined) {
          this.extraCSS = entryDetails.css
        }
        if (entryDetails.imports !== undefined) {
          this.extraImports = entryDetails.imports
        }

        addAttribute(this.config, "href", entryDetails.file)
      }
    }
    else {
      addAttribute(this.config, "href", resolvedHref)
    }

    return this
  }
}

export class SSRBuilder extends HtmlViewBuilder {
  constructor(private tokenRegistry: TokenRegistry, private manifest: Manifest | undefined) {
    super()
  }

  subview(view: HTMLView): this {
    const builder = new SSRBuilder(this.tokenRegistry, this.manifest)
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void) {
    const scriptConfig = new ScriptElementConfig(this.tokenRegistry, this.manifest)
    this.buildElement("script", scriptConfig, builder as (element: ConfigurableElement<any, any>) => void)

    for (const extraImport of scriptConfig.extraImports) {
      this.link(el => {
        el.config
          .rel("modulepreload")
          .href(extraImport)
      })
    }

    for (const extraStylesheet of scriptConfig.extraStylesheets) {
      this.link(el => {
        el.config
          .rel("stylesheet")
          .href(extraStylesheet)
      })
    }

    return this
  }

  link(builder?: (element: ConfigurableElement<LinkElementAttributes, never>) => void) {
    const linkElementConfig = new LinkElementConfig(this.tokenRegistry, this.manifest)
    this.buildElement("link", linkElementConfig, builder as (element: ConfigurableElement<any, any>) => void)

    for (const extraScript of linkElementConfig.extraScripts) {
      this.link(el => {
        el.config
          .rel("modulepreload")
          .href(extraScript)
      })
    }

    for (const extraStylesheet of linkElementConfig.extraStylesheets) {
      this.link(el => {
        el.config
          .rel("stylesheet")
          .href(extraStylesheet)
      })
    }

    return this
  }
}

function normalizePath(path: string): string {
  let normalized = path
  if (path.startsWith("./")) {
    normalized = path.substring(2)
  }
  return normalized
}