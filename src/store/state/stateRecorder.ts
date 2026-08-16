import { StateToken } from "../tokenRegistry.js"

class StateRecorder {
  private _tokens: Set<StateToken<any>> = new Set()

  recordToken(token: StateToken<any>) {
    this._tokens.add(token)
  }

  get tokens(): Set<StateToken<any>> {
    return this._tokens
  }
}

const recorderStack: Array<StateRecorder> = []

export function didCreateToken(token: StateToken<any>) {
  let currentRecorder = recorderStack[0]
  if (currentRecorder !== undefined) {
    currentRecorder.recordToken(token)
  }
}

export function recordTokens(activity: () => void): Set<StateToken<any>> {
  const recorder = new StateRecorder()
  recorderStack.unshift(recorder)
  activity()
  recorderStack.shift()
  return recorder.tokens
}