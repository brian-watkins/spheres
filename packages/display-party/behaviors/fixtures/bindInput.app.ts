import { View, view } from "@src/index.js";
import { GetState, container, write } from "state-party";

const funState = container({ initialValue: "" })

export default function(): View {
  return view()
    .main(el => {
      el.children
        .label(el => {
          el.config
            .for("nameInput")
          el.children
            .text("Tell me your name:")
        })
        .input(el => {
          el.config
            .id("nameInput")
            .type("text")
            .bind(funState)
        })
        .hr()
        .withState({
          view: nameView
        })
        .button(el => {
          el.config
            .dataAttribute("reset-button")
            .on({ click: () => write(funState, "") })
          el.children
            .text("Leave!")
        })
    })
}

function nameView(get: GetState): View {
  return view()
    .div(el => {
      const name = get(funState)

      el.config
        .dataAttribute("greeting")
      el.children
        .text(name === "" ? `Hello, anyone?!` : `Hello, ${get(funState)}!!!`)
    })
}