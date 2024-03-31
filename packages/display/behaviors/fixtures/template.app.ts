import { Container, container, rule, use, write } from "@spheres/store";
import { WithArgs, htmlTemplate } from "@src/index";

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

const funZone = htmlTemplate((withArgs: WithArgs<Context>) => {
  return root =>
    root.div(el => {
      el.children
        .hr()
        .div(el => {
          el.children
            .div(el => {
              el.config
                .dataAttribute("greeting", withArgs((props) => `${props.id}`))
              el.children
                .textNode(withArgs((props, get) => `${get(greeting)}, ${props.name}!`))
            })
            .div(el => {
              el.config
                .dataAttribute("counter", withArgs((props) => `${props.id}`))
              el.children
                .textNode(withArgs((props, get) => `${get(props.counter)} clicks!`))
            })
        })
        .div(el => {
          el.children
            .button(el => {
              el.config
                .dataAttribute("increment-counter", withArgs((props) => `${props.id}`))
                .on("click", () => {
                  return use(rule(withArgs((props, get) => {
                    return write(props.counter, get(props.counter) + 1)
                  })))
                })
              el.children
                .textNode("Click me!")
            })
        })
    })
})