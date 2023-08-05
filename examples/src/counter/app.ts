import { View, view } from "display-party";
import { GetState, container, write } from "state-party";

const clickCount = container({
  initialValue: 0,
  reducer: (_: string, current) => {
    return current + 1
  }
})

export function counter(): View {
  return view().main(el => {
    el.children
      .withState({
        view: counterLabel
      })
      .button(el => {
        el.config.on({
          click: () => write(clickCount, "increment")
        })
        el.children.text("Count!")
      })
  })
}

function counterLabel(get: GetState): View {
  return view().p(el => {
    el.config.dataAttribute("counter-text")
    el.children.text(`Clicks: ${get(clickCount)}`)
  })
}