import { Container, container, rule, use, write } from "@spheres/store";
import { htmlTemplate } from "@src/index";
import { WithProps } from "@src/vdom/virtualNode";

const greeting = container({
  initialValue: "Hello"
})

interface Context {
  id: number
  name: string
  counter: Container<number>
}

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .zone(funZone({
        id: 1, name: "Cool dude", counter: container({ initialValue: 0 })
      }))
      .zone(funZone({
        id: 2, name: "Awesome person", counter: container({ initialValue: 0 })
      }))
      .zone(funZone({
        id: 3, name: "Fun human", counter: container({ initialValue: 0 })
      }))
  })
})

const funZone = htmlTemplate((withProps: WithProps<Context>) => {
  return root =>
    root.div(el => {
      el.children
        .hr()
        .div(el => {
          el.children
            .div(el => {
              el.config
                .dataAttribute("greeting", withProps((props) => `${props.id}`))
              el.children
                .textNode(withProps((props, get) => `${get(greeting)}, ${props.name}!`))
            })
            .div(el => {
              el.config
                .dataAttribute("counter", withProps((props) => `${props.id}`))
              el.children
                .textNode(withProps((props, get) => `${get(props.counter)} clicks!`))
            })
        })
        .div(el => {
          el.children
            .button(el => {
              el.config
                .dataAttribute("increment-counter", withProps((props) => `${props.id}`))
                .on("click", () => {
                  return use(rule(withProps((props, get) => {
                    return write(props.counter, get(props.counter) + 1)
                  })))
                })
              el.children
                .textNode("Click me!")
            })
        })
    })
})