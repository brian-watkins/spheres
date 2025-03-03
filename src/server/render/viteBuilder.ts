import type { Manifest, ManifestChunk } from "vite"

export interface ViteContext {
  command: "serve" | "build"
  base: string
  manifest: Manifest | undefined
}

type SSRManifestChunk = ManifestChunk & { manifestKey: string }

export interface ScriptLink {
  type: "script"
  src: string
}

export interface ExtraScriptLink {
  type: "extra-script"
  src: string
}

export interface StylesheetLink {
  type: "stylesheet"
  src: string
}

export type LinkData = ScriptLink | ExtraScriptLink | StylesheetLink

export function getLinkData(viteContext: ViteContext, assetType: "script" | "stylesheet", src: string): Array<LinkData> {
  const fetched: Set<string> = new Set()

  function findLinks(type: "script" | "stylesheet" | "extra-script", src: string): Array<LinkData> {
    const chunk = findManifestChunk(viteContext, src)

    if (chunk === undefined) {
      return []
    }

    fetched.add(chunk.manifestKey)

    let linkData: Array<LinkData> = [
      { type, src: chunk.file }
    ]

    for (const script of chunk.imports ?? []) {
      if (fetched.has(script)) continue
      linkData = linkData.concat(findLinks("extra-script", script))
    }

    for (const script of chunk.dynamicImports ?? []) {
      if (fetched.has(script)) continue
      linkData = linkData.concat(findLinks("extra-script", script))
    }

    for (const styles of chunk.css ?? []) {
      linkData.push({ type: "stylesheet", src: styles })
    }

    return linkData
  }

  return findLinks(assetType, src)
}

function findManifestChunk(viteContext: ViteContext, path: string): SSRManifestChunk | undefined {
  for (const file in viteContext.manifest) {
    if (path.endsWith(file)) {
      return {
        ...viteContext.manifest[file],
        manifestKey: file
      }
    }
  }

  return undefined
}