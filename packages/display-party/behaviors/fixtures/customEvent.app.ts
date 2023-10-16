import { View, htmlView } from "@src/index";
import { container, run, write } from "state-party";

const secretMessage = container({ initialValue: "" })

export default function (): View {
  return htmlView()
    .main(({ config, children }) => {
      config
        .on("super-secret-message", (evt) => {
          return write(secretMessage, (evt as CustomEvent).detail)
        })

      children
        .div(({ config, children }) => {
          config
            .dataAttribute("message")
          children
            .textNode((get) => `Message: ${get(secretMessage)}`)
        })
        .button(({ config, children }) => {
          config
            .on("click", (evt) => {
              return run(() => {
                const event = new CustomEvent("super-secret-message", {
                  bubbles: true,
                  cancelable: true,
                  detail: "This is a cool, secret message!"
                })
                evt.target?.dispatchEvent(event)
              })
            })
          children
            .textNode("Send Message!")
        })
    })
}