import { View, inputValue, view } from "@src/index.js";
import { GetState, container, write } from "state-party";

const nameContainer = container({ initialValue: "Cool Dude" })

export default function(): View {
  return view()
    .section(el => {
      el.view
        .h1(el => el.view.text("Hello!"))
        .withState({ view: fragmentView })
    })
    .hr()
    .input(el => {
      el.config
        .type("text")
        .on({ input: evt => write(nameContainer, inputValue(evt)) })
    })
}

function fragmentView(get: GetState): View {
  return view()
    .p(el => {
      el.config.dataAttribute("order", "first")
      el.view.text("This is the first paragraph")
    })
    .p(el => {
      el.config.dataAttribute("order", "second")
      el.view.text("This is the second paragraph")
    })
    .p(el => {
      el.config.dataAttribute("order", "third")
      el.view.text(`Written by: ${get(nameContainer)}`)
    })
}