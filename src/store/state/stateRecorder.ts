import { StateToken } from "../tokenRegistry.js"

class StateRecorder {
  private _tokens: Array<StateToken<any>> = []

  recordToken(token: StateToken<any>) {
    this._tokens.push(token)
  }

  get tokens(): Array<StateToken<any>> {
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

export function recordTokens(activity: () => void): Array<StateToken<any>> {
  const recorder = new StateRecorder()
  recorderStack.unshift(recorder)
  activity()
  recorderStack.shift()
  return recorder.tokens
}