import { Stateful } from "../../store";
import { runQuery } from "../../store/tokenRegistry";
import { ViewConfig, ViewConfigDelegate, ViewRendererDelegate } from "../../view/render/viewRenderer";
import { HTMLTemplate } from "./stringRenderer";
import { getLinkData, LinkData, ViteContext } from "./viteBuilder";

interface TransformConfigDelegate {
  template: HTMLTemplate | undefined
}

export class TransformRendererDelegate implements ViewRendererDelegate {
  private configDelegate: TransformConfigDelegate | undefined

  constructor(private viteContext: ViteContext | undefined) { }
  
  createElement(): Element {
    throw new Error("Method not implemented.");
  }

  get template(): HTMLTemplate | undefined {
    return this.configDelegate?.template
  }

  getRendererDelegate(): ViewRendererDelegate {
    return this
  }

  getConfigDelegate(tag: string): ViewConfigDelegate {
    if (tag === "script") {
      this.configDelegate = new ScriptTransformConfigDelegate(this.viteContext)
      return this.configDelegate
    }
    if (tag === "link") {
      this.configDelegate = new LinkTransformConfigDelegate(this.viteContext)
      return this.configDelegate
    }
    return new TransformConfigDelegate()
  }
}

class TransformConfigDelegate implements ViewConfigDelegate {
  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    return config.attribute(name, value)
  }
}

class ScriptTransformConfigDelegate implements ViewConfigDelegate, TransformConfigDelegate {
  template: HTMLTemplate | undefined

  constructor(private viteContext: ViteContext | undefined) { }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "src" && shouldTransformImport(this.viteContext)) {
      this.template = templateForImport(this.viteContext!, value, "script")
    }
    return config.attribute(name, value)
  }
}

class LinkTransformConfigDelegate implements ViewConfigDelegate, TransformConfigDelegate {
  template: HTMLTemplate | undefined

  constructor(private viteContext: ViteContext | undefined) { }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "href" && shouldTransformImport(this.viteContext)) {
      this.template = templateForImport(this.viteContext!, value, "stylesheet")
    }
    return config.attribute(name, value)
  }

}

function shouldTransformImport(viteContext: ViteContext | undefined) {
  if (viteContext === undefined) {
    return false
  }

  if (viteContext.command === "serve") {
    return false
  }

  return true
}

function templateForImport(viteContext: ViteContext, importRef: string | Stateful<string>, assetType: "script" | "stylesheet"): HTMLTemplate {
  if (typeof importRef === "function") {
    return {
      strings: ["", ""],
      statefuls: [
        (registry) => {
          const src = runQuery(registry, importRef) ?? ""
          const linkData = getLinkData(viteContext, assetType, src)
          return renderLinks(viteContext, linkData)
        }
      ]
    }
  }

  const linkData = getLinkData(viteContext, assetType, importRef)
  return {
    strings: [renderLinks(viteContext, linkData)],
    statefuls: []
  }
}

function renderLinks(viteContext: ViteContext, links: Array<LinkData>): string {
  let html = ""
  for (const link of links) {
    const src = `${viteContext.base}${link.src}`
    switch (link.type) {
      case "script":
        html += `<script type="module" src="${src}"></script>`
        break
      case "extra-script":
        html += `<link rel="modulepreload" href="${src}">`
        break
      case "stylesheet":
        html += `<link rel="stylesheet" href="${src}">`
        break
    }
  }
  return html
}
