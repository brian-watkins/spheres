import { container, Container, State } from "@spheres/store";
import { HTMLView } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement";
import { renderContext } from "helpers/renderContext";

interface ListContext {
  items: Container<Array<String>>
}

export default behavior("list effects", [

  example(renderContext<ListContext>())
    .description("simple list with text")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["1", "2", "3"] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.ul(el => {
              el.children.zones(get => get(context.state.items), liView)
            })
          })
        })
      ],
      observe: [
        effect("the view is rendered", async () => {
          const text = await selectElements("li").map(el => el.text())
          expect(text, is([
            "Item 1",
            "Item 2",
            "Item 3"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.items, ["1", "2", "A", "B"])
        })
      ],
      observe: [
        effect("the view is rendered", async () => {
          const text = await selectElements("li").map(el => el.text())
          expect(text, is([
            "Item 1",
            "Item 2",
            "Item A",
            "Item B",
          ]))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("simple list with properties")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["cat"] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.ul(el => {
              el.children.zones(get => get(context.state.items), liStyledView)
            })
          })
        })
      ],
      observe: [
        effect("the view is rendered with the stateful property", async () => {
          const className = await selectElement("li").property("className")
          expect(className, is("style-cat"))
        }),
        effect("static properties are also rendered", async () => {
          const className = await selectElement("span").property("className")
          expect(className, is("special-text"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.items, ["dog"])
        })
      ],
      observe: [
        effect("the view is rendered with the correct property", async () => {
          const className = await selectElement("li").property("className")
          expect(className, is("style-dog"))
        })
      ]
    })

])

function liView(item: State<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children
        .textNode("Item ")
        .textNode(get => get(item))
    })
  }
}

function liStyledView(item: State<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.config
        .class(get => `style-${get(item)}`)

      el.children.span(el => {
        el.config.class("special-text")
        el.children.textNode("Some item")
      })
    })
  }
}
