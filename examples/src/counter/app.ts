import { container, update } from "spheres/store";
import { HTMLBuilder } from "../../../src/view";

const clickCount = container({ initialValue: 0 })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.config.class("flex flex-col items-center w-3xl p-16 border-2 border-sky-500")
    el.children
      .p(el => {
        el.config.dataAttribute("counter-text")
          .class(textStyle)
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config
          .class(buttonStyle)
          .on("click", () => update(clickCount, (count) => count + 1))
        el.children.textNode("Count!")
      })
  })
}

const textStyle = "mb-8 text-6xl font-bold text-sky-600"

const buttonStyle = "disabled:bg-slate-400 hover:bg-sky-800 px-8 py-4 bg-sky-600 text-slate-100 text-xl font-bold"
