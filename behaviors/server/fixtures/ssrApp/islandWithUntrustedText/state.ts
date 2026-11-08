import { container, StateManifest } from "@store/index.js"

export const UNTRUSTED_TEXT = `</script><script>window.__untrustedScriptRan = true</script>`

export const message = container({ initialValue: "" })

export const serializedTokens: StateManifest = {
  message,
}
