import { State } from "./store";

class StateRecorder {
  private _tokens: Array<State<any>> = []

  recordToken(token: State<any>) {
    this._tokens.push(token)
  }

  get tokens(): Array<State<any>> {
    return this._tokens
  }
}

const recorderStack: Array<StateRecorder> = []

export function didCreateToken(token: State<any>) {
  let currentRecorder = recorderStack[0]
  if (currentRecorder !== undefined) {
    currentRecorder.recordToken(token)
  }
}

export function recordTokens(activity: () => void): Array<State<any>> {
  const recorder = new StateRecorder()
  recorderStack.unshift(recorder)
  activity()
  recorderStack.shift()
  return recorder.tokens
}