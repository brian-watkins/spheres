import { View, view } from "display-party";

export function converter(): View {
  return view().main(el => {
    el.children
      .div(el => {
        el.children
          .label(el => {
            el.config.for("celsius")
            el.children.text("Celsius")
          })
          .input(el => el.config.id("celsius").type("text"))
      })
      .div(el => {
        el.children
          .label(el => {
            el.config.for("farenheit")
            el.children.text("Farenheit")
          })
          .input(el => el.config.id("farenheit").type("text"))
      })
  })
}