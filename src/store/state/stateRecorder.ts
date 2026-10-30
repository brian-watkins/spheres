import { StateToken, tokenOrigin, TokenOrigin } from "../tokenRegistry.js"

const originStack: Array<TokenOrigin> = []

export function didCreateToken(token: StateToken<any>) {
  const origin = originStack[originStack.length - 1]
  if (origin !== undefined) {
    token[tokenOrigin] = origin
  }
}

export function recordTokens(origin: TokenOrigin, activity: () => void): void {
  originStack.push(origin)
  activity()
  originStack.pop()
}
