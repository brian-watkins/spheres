import { Container, GetState, container, rule, use, write } from "@spheres/store"
import { View, htmlTemplate, htmlView } from "@src/index"

const message = container({ initialValue: "Find the secret!" })

interface Context {
  id: number
  counter: Container<number>
}

export default function (): View {
  return htmlView(root => {
    root.main(el => {
      el.children
        .zone(funZone({ id: 1, counter: container({ initialValue: 0 }) }))
        .zone(funZone({ id: 2, counter: container({ initialValue: 0 }) }))
        .zone(funZone({ id: 3, counter: container({ initialValue: 0 }) }))
    })
  })
}

const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

const funZone = htmlTemplate<Context>(root => {
  root.div(el => {
    el.children
      .zone(title("Counter Row!"))
      .div(el => {
        el.config
          .dataAttribute("secret-message")
        el.children
          .textNode((get) => get(message))
      })
      .button(el => {
        el.config
          .dataAttribute("counter", (_, context) => `${context.id}`)
          .on("click", (_, context) => use(incrementRule, context.counter))
        el.children
          .textNode("Increment!")
      })
      .zone(description)
  })
})

function title(label: string) {
  return htmlView(root => {
    root.div(el => {
      el.children
        .hr()
        .h3(el => {
          el.config.on("click", () => write(message, "You found it!"))
          el.children.textNode(label)
        })
    })
  })
}

function description(get: GetState, context: Context): View {
  const count = get(context.counter)
  if (count % 2 === 0) {
    return htmlView(root => {
      root.div(el => {
        el.config.dataAttribute("message")
        el.children.textNode(`You've clicked ${count} times, which is good!`)
      })
    })
  } else {
    return htmlView(root => {
      root.h1(el => {
        el.config.dataAttribute("message")
        el.children.textNode(`${count} clicks just doesn't feel right. Try again!`)
      })
    })
  }
}