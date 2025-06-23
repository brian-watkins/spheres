import { Stateful } from "../../store/index.js";
import { runQuery } from "../../store/tokenRegistry.js";
import { ViewConfig, ViewConfigDelegate } from "../../view/render/viewConfig.js";
import { ViewRendererDelegate } from "../../view/render/viewRenderer.js";
import { HTMLTemplate } from "./stringRenderer.js";
import { getLinkData, LinkData, ViteContext } from "./viteBuilder.js";

interface TransformConfigDelegate extends ViewConfigDelegate {
  template: HTMLTemplate
}

export class TransformRendererDelegate implements ViewRendererDelegate {
  private configDelegate: TransformConfigDelegate | undefined

  constructor(private viteContext: ViteContext | undefined) { }

  createElement(): Element {
    throw new Error("Transform renderer does not create elements.");
  }

  get template(): HTMLTemplate {
    return this.configDelegate!.template
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

    throw new Error(`Transform delegate does not support tag: ${tag}`)
  }
}

class ScriptTransformConfigDelegate implements TransformConfigDelegate {
  private importRef: string | Stateful<string> | undefined
  private isAsync: boolean = false

  constructor(private viteContext: ViteContext | undefined) { }

  get template(): HTMLTemplate {
    if (this.importRef) {
      return templateForImport(this.viteContext!, this.importRef, "script", this.isAsync)
    } else {
      return {
        strings: [],
        statefuls: []
      }
    }
  }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    // Note that we just handle src and async here ... what about other attributes?
    // should we just gather all these and use them on the transformed script?
    if (name === "src") {
      this.importRef = value
    }
    if (name === "async") {
      this.isAsync = true
    }
    return config.attribute(name, value)
  }
}

class LinkTransformConfigDelegate implements TransformConfigDelegate {
  template: HTMLTemplate = { strings: [], statefuls: [] }

  constructor(private viteContext: ViteContext | undefined) { }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "href" && shouldTransformImport(this.viteContext)) {
      this.template = templateForImport(this.viteContext!, value, "stylesheet", false)
    }
    return config.attribute(name, value)
  }

}

export function shouldTransformImport(viteContext: ViteContext | undefined) {
  if (viteContext === undefined) {
    return false
  }

  if (viteContext.command === "serve") {
    return false
  }

  return true
}

function templateForImport(viteContext: ViteContext, importRef: string | Stateful<string>, assetType: "script" | "stylesheet", isAsync: boolean): HTMLTemplate {
  if (typeof importRef === "function") {
    return {
      strings: ["", ""],
      statefuls: [
        (registry) => {
          const src = runQuery(registry, importRef) ?? ""
          const linkData = getLinkData(viteContext, assetType, src, isAsync)
          return renderLinks(viteContext, linkData)
        }
      ]
    }
  }

  const linkData = getLinkData(viteContext, assetType, importRef, isAsync)
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
        // here I think we'd like to add all attributes that
        // were on the original script tag
        // the problem is though that some of these attributes could be stateful ...
        html += `<script type="module" ${link.async ? "async " : ""}src="${src}"></script>`
        break
      case "extra-script":
        // this is just internal so shouldn't have any user-supplied attributes
        html += `<link rel="modulepreload" href="${src}">`
        break
      case "stylesheet":
        // here we should probably add all attributes that
        // were on the original link tag
        html += `<link rel="stylesheet" href="${src}">`
        break
    }
  }
  return html
}
