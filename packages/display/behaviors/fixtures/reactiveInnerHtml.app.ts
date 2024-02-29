import { HTMLBuilder } from "@src/index.js";
import { container, write } from "@spheres/store";

const htmlContent = container({ initialValue: "<h1>Hello!</h1>" })

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .input(el => {
        el.config
          .type("text")
          .on("input", (evt) => write(htmlContent, (evt.target! as HTMLInputElement).value))
      })
      .div(el => {
        el.config
          .id("reactiveElement")
          .innerHTML(get => get(htmlContent))
      })
  })
}