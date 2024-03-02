import { Container, StoreMessage, container, reset, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { TemplateContext } from "@src/index";

interface Context {
  id: number
  name: string
}

const clickCounter = container({ initialValue: 0 })

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, { id: 1, name: "Cool dude" })
      .zoneWithTemplate(funZone, { id: 2, name: "Awesome person" })
      .zoneWithTemplate(funZone, { id: 3, name: "Fun human" })
      .hr()
      .zoneWithTemplate(button, {
        name: "increment",
        label: "Increment the counter!",
        handler: () => use(incrementRule, clickCounter)
      })
  })
}


const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

function funZone(this: TemplateContext<Context>, root: HTMLBuilder) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("counter", () => `${this.props.id}`)
            el.children
              .textNode((get) => `${this.props.name} - ${get(clickCounter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .zoneWithTemplate(button, {
            name: "increment",
            label: `Click me to reset!`,
            handler: () => reset(clickCounter)
          })
      })
  })
}

interface ButtonContext {
  name: string
  handler: (evt: Event) => StoreMessage<any>
  label: string
}

function button(this: TemplateContext<ButtonContext>, root: HTMLBuilder) {
  root.button(el => {
    el.config
      .dataAttribute("button-name", () => this.props.name)
      .on("click", (evt) => this.props.handler(evt))
    el.children
      .textNode(() => this.props.label)
  })
}

