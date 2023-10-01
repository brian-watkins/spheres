import { View, htmlView } from "@src/index.js";
import { container, write } from "state-party";

const htmlContent = container({ initialValue: "<h1>Hello!</h1>" })

export default function(): View {
  return htmlView()
    .main(el => {
      el.children
        .input(el => {
          el.config
            .type("text")
            .on("input", (evt) => write(htmlContent, (evt.target! as HTMLInputElement).value))
        })
        .div(el => {
          el.config
            .id("reactiveElement")
            .innerHTML((get) => get(htmlContent))
        })
    })
}