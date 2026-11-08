import { container, StateManifest } from "@store/index"

// Text from an untrusted source, like a user's message, that tries to close the
// script tag holding the streamed state and run a script of its own
export const UNTRUSTED_TEXT = `</script><script>window.__untrustedScriptRan = true</script>`

export const message = container({ initialValue: "" })

export const serializedTokens: StateManifest = {
  message,
}
