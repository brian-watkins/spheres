import { TokenOrigin } from "../tokenRegistry.js"

let currentOrigin: TokenOrigin | undefined = undefined

export function getTokenOrigin(): TokenOrigin | undefined {
  return currentOrigin
}

export function withTokenOrigin<T>(origin: TokenOrigin | undefined, activity: () => T): T {
  const previous = currentOrigin
  currentOrigin = origin
  try {
    return activity()
  } finally {
    currentOrigin = previous
  }
}
