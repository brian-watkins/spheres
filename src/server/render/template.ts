import { runQuery, Stateful, TokenRegistry } from "../../store/tokenRegistry.js"

type StatefulString = (registry: TokenRegistry) => string

export interface HTMLTemplate {
  strings: Array<string>
  statefuls: Array<StatefulString>
}

export function emptyTemplate(): HTMLTemplate {
  return {
    strings: [ "" ],
    statefuls: []
  }
}

export function templateFromString(value: string): HTMLTemplate {
  return {
    strings: [ value ],
    statefuls: []
  }
}

export function toStatefulString(stateful: Stateful<string>, defaultValue: string = ""): StatefulString {
  return (registry) => runQuery(registry, stateful) || defaultValue
}

export function templateFromStateful(stateful: StatefulString): HTMLTemplate {
  return {
    strings: [ "", "" ],
    statefuls: [ stateful ]
  }
}

export function addStringToTemplate(current: HTMLTemplate, val: string): HTMLTemplate {
  return addTemplate(current, {
    strings: [val],
    statefuls: []
  })
}

export function addTemplate(current: HTMLTemplate, next: HTMLTemplate): HTMLTemplate {
  const added: HTMLTemplate = {
    strings: [...current.strings],
    statefuls: [...current.statefuls]
  }

  let currentString = added.strings[added.strings.length - 1]
  currentString = currentString + (next.strings[0] ?? "")
  if (next.strings.length > 1) {
    added.strings[added.strings.length - 1] = currentString
    added.strings = added.strings.concat(next.strings.slice(1))
  } else {
    added.strings[added.strings.length - 1] = currentString
  }

  added.statefuls = added.statefuls.concat(next.statefuls ?? [])

  return added
}

export function stringForTemplate(registry: TokenRegistry, template: HTMLTemplate): string {
  let html = ""
  for (let x = 0; x < template.strings.length; x++) {
    html += template.strings[x]
    if (x < template.statefuls.length) {
      html += template.statefuls[x](registry)
    }
  }
  return html
}
