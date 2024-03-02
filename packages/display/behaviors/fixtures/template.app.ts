import { Container, container, rule, use, write } from "@spheres/store";
import { HTMLBuilder, TemplateContext } from "@src/index";

const greeting = container({
  initialValue: "Hello"
})

interface Context {
  id: number
  name: string
  counter: Container<number>
}

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, {
        id: 1, name: "Cool dude", counter: container({ initialValue: 0 })
      })
      .zoneWithTemplate(funZone, {
        id: 2, name: "Awesome person", counter: container({ initialValue: 0 })
      })
      .zoneWithTemplate(funZone, {
        id: 3, name: "Fun human", counter: container({ initialValue: 0 })
      })
  })
}

function funZone(this: TemplateContext<Context>, root: HTMLBuilder) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("greeting", () => `${this.props.id}`)
            el.children
              .textNode((get) => `${get(greeting)}, ${this.props.name}!`)
          })
          .div(el => {
            el.config
              .dataAttribute("counter", () => `${this.props.id}`)
            el.children
              .textNode((get) => `${get(this.props.counter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .button(el => {
            el.config
              .dataAttribute("increment-counter", () => `${this.props.id}`)
              .on("click", () => {
                return use(rule((get) => {
                  return write(this.props.counter, get(this.props.counter) + 1)
                }))
              })
            el.children
              .textNode("Click me!")
          })
      })
  })
}