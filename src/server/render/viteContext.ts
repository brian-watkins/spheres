import type { Manifest, ManifestChunk } from "vite"

export interface ViteContext {
  command: "serve" | "build"
  base: string
  manifest: Manifest | undefined
}

type SSRManifestChunk = ManifestChunk & { manifestKey: string }

export interface ScriptResource {
  type: "script"
  src: string
}

export interface ExtraScriptResource {
  type: "extra-script"
  src: string
}

export interface StylesheetResource {
  type: "stylesheet"
  src: string
}

export type TransformedResource = ScriptResource | ExtraScriptResource | StylesheetResource

export function shouldTransformImport(viteContext: ViteContext | undefined): viteContext is ViteContext {
  if (viteContext === undefined) {
    return false
  }

  if (viteContext.command === "serve") {
    return false
  }

  return true
}

export function shouldServeImport(viteContext: ViteContext | undefined): boolean {
  if (viteContext === undefined) {
    return false
  }

  if (viteContext.command === "serve") {
    return true
  }

  return false
}

export function getTransformedResource(viteContext: ViteContext, type: "script" | "stylesheet", src: string): TransformedResource {
  const chunk = findManifestChunk(viteContext, src)

  if (chunk === undefined) {
    return { type, src }
  }

  return {
    type,
    src: `${viteContext.base}${chunk.file}`
  }
}

export function getExtraResources(viteContext: ViteContext, resourceType: "script" | "stylesheet", src: string): Array<TransformedResource> {
  const fetched: Set<string> = new Set()

  function findResources(type: "script" | "stylesheet" | "extra-script", src: string, options: { extraOnly: boolean } = { extraOnly: false }): Array<TransformedResource> {
    const chunk = findManifestChunk(viteContext, src)

    if (chunk === undefined) {
      return []
    }

    fetched.add(chunk.manifestKey)

    let linkData: Array<TransformedResource> = options.extraOnly ? [] : [
      { type, src: `${viteContext.base}${chunk.file}` }
    ]

    for (const script of chunk.imports ?? []) {
      if (fetched.has(script)) continue
      linkData = linkData.concat(findResources("extra-script", script))
    }

    for (const script of chunk.dynamicImports ?? []) {
      if (fetched.has(script)) continue
      linkData = linkData.concat(findResources("extra-script", script))
    }

    for (const stylesheetSrc of chunk.css ?? []) {
      linkData.push({ type: "stylesheet", src: `${viteContext.base}${stylesheetSrc}` })
    }

    return linkData
  }

  return findResources(resourceType, src, { extraOnly: true })
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