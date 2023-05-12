import * as View from "@src/index.js"

export interface InputAppProps {
  defaultInputValue: string
}

export default function(context: InputAppProps): View.View {
  return View.div([], [
    View.input([
      View.data("with-default"),
      View.value(context.defaultInputValue),
      View.disabled(false)
    ], []),
    View.input([
      View.data("disabled"),
      View.disabled(true)
    ], [])
  ])
}