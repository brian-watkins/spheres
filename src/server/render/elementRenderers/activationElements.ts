import { container } from "../../../store/index.js"
import { SerializedState, SerializedStateType } from "../../../view/activate.js"
import { StateMap } from "../../../view/index.js"
import { addTemplate, emptyTemplate, HTMLTemplate, templateFromString, toStatefulString } from "../template.js"
import { getExtraResources, getTransformedResource, shouldTransformImport, TransformedResource, ViteContext } from "../viteContext.js"

export interface ActivationOptions {
  viteContext?: ViteContext,
  stateMap?: StateMap,
  activationScripts?: Array<string>
}

export function getActivationTemplate(options: ActivationOptions): HTMLTemplate {
  let template = emptyTemplate()

  if (options.stateMap) {
    template = addTemplate(template, storeDataTemplate(options.stateMap))
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

export const storeIdToken = container({ initialValue: "" })

export function storeDataTemplate(stateMap: StateMap): HTMLTemplate {
  return {
    strings: [
      `<script type="application/json" data-spheres-store="`,
      `">`,
      `</script>`
    ],
    statefuls: [
      toStatefulString((get) => get(storeIdToken)),
      toStatefulString(get => {
        const values: Array<SerializedState> = []

        for (const key in stateMap) {
          const token = stateMap[key]
          values.push({
            k: SerializedStateType.Container,
            t: key,
            v: get(token)
          })

          const metaValue = get(token.meta)
          if (metaValue.type !== "ok") {
            values.push({
              k: SerializedStateType.Meta,
              t: key,
              v: metaValue
            })
          }
        }

        return JSON.stringify(values)
      })
    ]
  }
}