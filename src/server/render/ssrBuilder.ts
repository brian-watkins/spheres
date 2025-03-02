import { HeadElementAttributes, HTMLBuilder, HTMLElements, HTMLView, LinkElementAttributes, ScriptElementAttributes } from "../../view/htmlElements.js"
import { HtmlViewBuilder } from "../../view/htmlViewBuilder.js"
import { ConfigurableElement } from "../../view/viewBuilder.js"
import { BasicElementConfig } from "../../view/viewConfig.js"
import { Stateful } from "../../store/index.js"
import { addAttribute } from "../../view/render/virtualNode.js"
import { runQuery, TokenRegistry } from "../../store/tokenRegistry.js"
import type { ManifestChunk, Manifest } from "vite"

export interface ViteContext {
  command: "serve" | "build"
  base: string
  manifest: Manifest | undefined
}

type SSRManifestChunk = ManifestChunk & { manifestKey: string }

class SSRElementConfig extends BasicElementConfig {
  private _scriptImported: string | undefined
  private _extraImports: Array<string> = []
  private _extraCSS: Array<string> = []

  constructor(private tokenRegistry: TokenRegistry, private viteContext: ViteContext | undefined) {
    super()
  }

  get importedScript(): string | undefined {
    return this._scriptImported
  }

  get extraScripts() {
    return this._extraImports
  }

  get extraStylesheets() {
    return this._extraCSS
  }

  private findManifestEntry(path: string): SSRManifestChunk | undefined {
    for (const file in this.viteContext?.manifest) {
      if (path.endsWith(file)) {
        return {
          ...this.viteContext.manifest[file],
          manifestKey: file
        }
      }
    }

    return undefined
  }

  addManifestAttribute(name: string, value: string | Stateful<string>) {
    const resolvedSrc = typeof value === "function" ? runQuery(this.tokenRegistry, value) ?? "" : value
    const entryDetails = this.findManifestEntry(resolvedSrc)

    if (entryDetails === undefined) {
      addAttribute(this.config, name, resolvedSrc)
      return this
    }

    this._scriptImported = entryDetails.manifestKey

    for (const script of entryDetails.imports ?? []) {
      this._extraImports.push(script)
    }

    for (const script of entryDetails.dynamicImports ?? []) {
      this._extraImports.push(script)
    }

    if (entryDetails.css !== undefined) {
      this._extraCSS = entryDetails.css
    }

    addAttribute(this.config, name, `${this.viteContext?.base}${entryDetails.file}`)

    return this
  }
}

class ScriptElementConfig extends SSRElementConfig {
  src(value: string | Stateful<string>) {
    return this.addManifestAttribute("src", value)
  }
}

class LinkElementConfig extends SSRElementConfig {
  href(value: string | Stateful<string>) {
    return this.addManifestAttribute("href", value)
  }
}

export class SSRBuilder extends HtmlViewBuilder {
  private importedScripts: Set<string> = new Set()

  constructor(private tokenRegistry: TokenRegistry, private viteContext: ViteContext | undefined) {
    super()
  }

  subview(view: HTMLView): this {
    const builder = new SSRBuilder(this.tokenRegistry, this.viteContext)
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  private buildSSRElement(name: string, configBuilder: SSRElementConfig, builder?: (element: ConfigurableElement<any, any>) => void) {
    this.buildElement(name, configBuilder, builder)

    if (configBuilder.importedScript) {
      this.importedScripts.add(configBuilder.importedScript)

      for (const extraImport of configBuilder.extraScripts) {
        if (this.importedScripts.has(extraImport)) continue

        this.link(el => {
          el.config
            .rel("modulepreload")
            .href(extraImport)
        })
      }

      for (const extraStylesheet of configBuilder.extraStylesheets) {
        this.link(el => {
          el.config
            .rel("stylesheet")
            .href(`${this.viteContext?.base}${extraStylesheet}`)
        })
      }
    }

    return this
  }

  head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLElements>) => void) {
    return this.buildElement("head", new BasicElementConfig(), el => {
      if (this.viteContext?.command === "serve") {
        el.children.script(el => {
          el.config.type("module").src("/@vite/client")
        })
      }
      builder?.(el as ConfigurableElement<any, any>)
    })
  }

  script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void) {
    const scriptConfig = new ScriptElementConfig(this.tokenRegistry, this.viteContext)
    return this.buildSSRElement("script", scriptConfig, builder)
  }

  link(builder?: (element: ConfigurableElement<LinkElementAttributes, HTMLElements>) => void) {
    const linkElementConfig = new LinkElementConfig(this.tokenRegistry, this.viteContext)
    return this.buildSSRElement("link", linkElementConfig, builder)
  }
}
