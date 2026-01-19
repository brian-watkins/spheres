import { container } from "../../../store/index.js"
import { serializedValue, serializedMeta, SerializedState, StateManifest } from "../../../store/serialize.js"
import { prepareForStreaming } from "../../../view/activate.js"
import { addTemplate, emptyTemplate, HTMLTemplate, templateFromString, toStatefulString } from "../template.js"
import { getExtraResources, getTransformedResource, shouldTransformImport, TransformedResource, ViteContext } from "../viteContext.js"

export interface ActivationOptions {
  viteContext?: ViteContext,
  stateManifest?: StateManifest,
  activationScripts?: Array<string>
}

export function getActivationTemplate(options: ActivationOptions): HTMLTemplate {
  let template = emptyTemplate()

  if (options.stateManifest) {
    template = addTemplate(template, templateFromString(`<script>(${prepareForStreaming.toString()})();</script>`))
    template = addTemplate(template, storeDataTemplate(options.stateManifest))
  }
  if (options.activationScripts) {
    for (const scriptSrc of options.activationScripts) {
      template = addTemplate(template, activationScriptTemplate(options.viteContext, scriptSrc))
    }
  }

  return template
}

function activationScriptTemplate(viteContext: ViteContext | undefined, scriptSrc: string): HTMLTemplate {
  if (!shouldTransformImport(viteContext)) {
    return templateFromString(`<script type="module" async src="${scriptSrc}"></script>`)
  }

  const transformedResource = getTransformedResource(viteContext, "script", scriptSrc)

  // Should this always be async?
  let template = templateFromString(`<script type="module" async src="${transformedResource.src}"></script>`)

  const extraResources = getExtraResources(viteContext, "script", scriptSrc)
  for (const resource of extraResources) {
    template = addTemplate(template, templateForResource(resource))
  }

  return template
}

export function templateForResource(resource: TransformedResource): HTMLTemplate {
  switch (resource.type) {
    case "script":
      return templateFromString(`<script type="module" src="${resource.src}"></script>`)
    case "extra-script":
      return templateFromString(`<link rel="modulepreload" href="${resource.src}"></link>`)
    case "stylesheet":
      return templateFromString(`<link rel="stylesheet" href="${resource.src}"></link>`)
  }
}

export const storeIdToken = container({ name: "store-id", initialValue: "" })

export function storeDataTemplate(stateManifest: StateManifest): HTMLTemplate {
  return {
    strings: [
      `<script type="application/json" data-spheres-stream="init" data-spheres-store="`,
      `">`,
      `</script>`
    ],
    statefuls: [
      toStatefulString((get) => get(storeIdToken)),
      toStatefulString(get => {
        const values: Array<SerializedState> = []

        for (const key in stateManifest) {
          const token = stateManifest[key]
          values.push(serializedValue(key, get(token)))

          const metaValue = get(token.meta)
          if (metaValue.type !== "ok") {
            values.push(serializedMeta(key, metaValue))
          }
        }

        return JSON.stringify(values)
      })
    ]
  }
}