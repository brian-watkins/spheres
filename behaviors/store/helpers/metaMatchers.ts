import { Meta } from "@store/index.js"
import { equalTo, Matcher, objectWith } from "great-expectations"

export function pendingMessage<M>(message: M): Matcher<Meta<M, unknown>> {
  return objectWith<Meta<M, unknown>>({
    type: equalTo("pending"),
    message: equalTo(message)
  })
}

export function errorMessage<M, E>(message: M, reason: E): Matcher<Meta<M, E>> {
  return objectWith<Meta<M, E>>({
    type: equalTo("error"),
    message: equalTo(message),
    reason: equalTo(reason)
  })
}

export function okMessage(): Matcher<Meta<any, unknown>> {
  return objectWith<Meta<any, unknown>>({
    type: equalTo("ok")
  })
}
