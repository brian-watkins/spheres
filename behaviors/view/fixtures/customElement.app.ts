import { container, update, write } from "@store/index.js";
import { HTMLBuilder } from "@view/index.js";

const coolMessage = container({ initialValue: "NOTHING!" })

export default function (root: HTMLBuilder) {
  root.main(({ config, children }) => {
    config
      .on("cool-event", (evt) => {
        return write(coolMessage, (evt as CustomEvent).detail)
      })
    children
      .div(({ config, children }) => {
        config.dataAttribute("message")
        children.textNode(get => get(coolMessage))
      })
      .hr()
      .element("cool-element", ({ config }) => {
        config
          .attribute("cool-stuff", "camels")
      })
      .element("uncool-element", ({ config }) => {
        config.on("click", () => update(coolMessage, val => `${val} !!!`))
      })
  })
}

class CoolElement extends HTMLElement {
  static observedAttributes = ["cool-stuff"];

  private stuff: string = ""

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const button = document.createElement("div")
    button.id = "cool-button"
    button.appendChild(document.createTextNode("Please click me!"))
    button.addEventListener("click", () => {
      const custom = new CustomEvent("cool-event", {
        detail: this.stuff,
        bubbles: true,
        cancelable: true,
      })
      this.dispatchEvent(custom)
    })

    shadow.appendChild(button)
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === "cool-stuff") {
      this.stuff = newValue
    }
  }
}

customElements.define("cool-element", CoolElement)

class UncoolElement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = "<div>Here is some text to click!</div>"
  }
}

customElements.define("uncool-element", UncoolElement)