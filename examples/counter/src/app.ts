import { View, view } from "display-party";
import { GetState, container, selection, store, write } from "state-party";

const clickCount = container({ initialValue: 0 })
const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

export function counter(): View {
  return view().main(el => {
    el.children
      .withState({
        view: counterLabel
      })
      .button(el => {
        el.config.on({
          click: () => store(incrementCount)
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