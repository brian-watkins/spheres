import { Meta } from "@src/store"
import { equalTo, Matcher } from "great-expectations"

export function pendingMessage<M>(message: M): Matcher<Meta<M>> {
  return equalTo<Meta<M>>({
    type: "pending",
    message
  })
}

export function errorMessage<M>(message: M): Matcher<Meta<M>> {
  return equalTo<Meta<M>>({
    type: "error",
    message
  })
}

export function okMessage(): Matcher<Meta<any>> {
  return equalTo<Meta<any>>({
    type: "ok"
  })
}
