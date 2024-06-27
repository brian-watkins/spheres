import { Container, container } from "@spheres/store";
import { htmlTemplate } from "@src/htmlViewBuilder";
import { WithArgs } from "@src/vdom/virtualNode";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement";
import { renderContext } from "helpers/renderContext";

export default behavior("reactive dom effects", [

  example(renderContext<Container<string>>())
    .description("reactive text")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({ initialValue: "hello" }))
        }),
        fact("there is an element with reactive text", (context) => {
          context.mountView((root) => {
            root.div(el => {
              el.config.dataAttribute("test-element")
              el.children.textNode(get => get(context.state))
            })
          })
        })
      ],
      observe: [
        effect("the text is rendered", async (context) => {
          await expect(selectElement("[data-test-element]").text(), resolvesTo("hello"))
        })
      ]
    }).andThen({
      perform: [
        step("the text is updated", (context) => {
          context.writeTo(context.state, "Have fun!")
        })
      ],
      observe: [
        effect("the text node is updated", async (context) => {
          await expect(selectElement("[data-test-element]").text(), resolvesTo("Have fun!"))
        })
      ]
    }),

  example(renderContext<Container<string>>())
    .description("nested children")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({ initialValue: "yo" }))
        }),
        fact("there are children with text that depend on the container state", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.children.div(el => {
                el.children.p(el => el.children.textNode(get => `One ${get(context.state)}`))
                el.children.p(el => el.children.textNode(get => `Two ${get(context.state)}`))
              })
            })
          })
        })
      ],
      observe: [
        effect("the text is rendered", async (context) => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo([
            "One yo",
            "Two yo"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state, "awesome!")
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo([
            "One awesome!",
            "Two awesome!"
          ]))
        })
      ]
    }),

  example(renderContext<Container<string>>())
    .description("nested zones")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({ initialValue: "cool" }))
        }),
        fact("there are nested zones", (context) => {
          const template = htmlTemplate((withArgs: WithArgs<string>) => root =>
            root.h2(el => el.children.textNode(withArgs(name => name)))
          )

          context.mountView(root => {
            root.div(el => {
              el.children
                .zone(template("Fun!"))
                .zone(template("Awesome!"))
                .zone(template("Great!"))
            })
          })
        })
      ],
      observe: [
        effect("the template is displayed", async () => {
          await expect(selectElements("H2").map(el => el.text()), resolvesTo([
            "Fun!",
            "Awesome!",
            "Great!"
          ]))
        })
      ]
    })
])