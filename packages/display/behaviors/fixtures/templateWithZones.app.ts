import { Container, GetState, container, rule, use, write } from "@spheres/store"
import { HTMLBuilder } from "@src/htmlElements"
import { HtmlViewFunction, ZoneDetails } from "@src/htmlViewBuilder"

const message = container({ initialValue: "Find the secret!" })

interface Context {
  id: number
  counter: Container<number>
}

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zone(funZone, {
        props: { id: 1, counter: container({ initialValue: 0 }) }
      })
      .zone(funZone, {
        props: { id: 2, counter: container({ initialValue: 0 }) }
      })
      .zone(funZone, {
        props: { id: 3, counter: container({ initialValue: 0 }) }
      })
  })
}

const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

function funZone(root: HTMLBuilder<Context>) {
  root.div(el => {
    el.children
      // .zone(title, { props: "Counter Row!" })
      .zone({
        template: title,
        props: "Counter Row!"
      })
      .div(el => {
        el.config
          .dataAttribute("secret-message")
        el.children
          .textNode(get => get(message))
      })
      .button(el => {
        el.config
          .dataAttribute("counter", (_, props) => `${props.id}`)
          .on("click", (_, props) => use(incrementRule, props.counter))
        el.children
          .textNode("Increment!")
      })
      // note that this is automatically getting the Context props
      // when it seems like we should pass in props via the options
      .zone(description)
  })
}

function title(root: HTMLBuilder<string>) {
  root.div(el => {
    el.children
      .hr()
      .h3(el => {
        el.config.on("click", () => write(message, "You found it!"))
        el.children.textNode((_, props) => props)
      })
  })
}

function description(get: GetState, props: Context): ZoneDetails<undefined> {
  const count = get(props.counter)

  return {
    template: (root) => {
      if (count % 2 === 0) {
        root.div(el => {
          el.config.dataAttribute("message")
          el.children.textNode(`You've clicked ${count} times, which is good!`)
        })
      } else {
        root.h1(el => {
          el.config.dataAttribute("message")
          el.children.textNode(`${count} clicks just doesn't feel right. Try again!`)
        })
      }
    },
    props: undefined
  }
}