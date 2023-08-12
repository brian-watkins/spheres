import { Meta } from "@src/index.js"
import { equalTo, Matcher } from "great-expectations"

export function pendingMessage<M>(message: M): Matcher<Meta<M, unknown>> {
  return equalTo<Meta<M, unknown>>({
    type: "pending",
    message
  })
}

export function errorMessage<M, E>(message: M, reason: E): Matcher<Meta<M, E>> {
  return equalTo<Meta<M, E>>({
    type: "error",
    message,
    reason
  })
}

export function okMessage(): Matcher<Meta<any, unknown>> {
  return equalTo<Meta<any, unknown>>({
    type: "ok"
  })
}
