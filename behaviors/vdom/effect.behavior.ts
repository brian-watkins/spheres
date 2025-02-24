import { Container, container } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { assignedWith, equalTo, expect, is, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "./helpers/displayElement";
import { renderContext } from "./helpers/renderContext";
import { HTMLBuilder } from "@view/index";

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
        effect("the text is rendered", async () => {
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
        effect("the text node is updated", async () => {
          await expect(selectElement("[data-test-element]").text(), resolvesTo("Have fun!"))
        })
      ]
    }),

  example(renderContext<Container<string>>())
    .description("reactive attribute")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({ initialValue: "hello" }))
        }),
        fact("there is an element with a reactive attribute", (context) => {
          context.mountView((root) => {
            root.div(el => {
              el.config.dataAttribute("my-info", get => get(context.state))
              el.children.textNode("Yo!")
            })
          })
        })
      ],
      observe: [
        effect("the element is rendered", async () => {
          const attributeText = await selectElement("div").attribute("data-my-info")
          expect(attributeText, is(assignedWith(equalTo("hello"))))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state, "awesome!")
        })
      ],
      observe: [
        effect("the attribute is updated", async () => {
          const attributeText = await selectElement("div").attribute("data-my-info")
          expect(attributeText, is(assignedWith(equalTo("awesome!"))))
        })
      ]
    }),

  example(renderContext<Container<string>>())
    .description("reactive property")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({ initialValue: "hello-style" }))
        }),
        fact("there is an element with a reactive property", (context) => {
          context.mountView((root) => {
            root.div(el => {
              el.config.class(get => get(context.state))
              el.children.textNode("Yo!")
            })
          })
        })
      ],
      observe: [
        effect("the className property is set", async () => {
          const propertyValue = await selectElement("div").property("className")
          expect(propertyValue, is(assignedWith(equalTo("hello-style"))))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state, "goodbye-style")
        })
      ],
      observe: [
        effect("the className property is updated", async () => {
          const propertyValue = await selectElement("div").property("className")
          expect(propertyValue, is(assignedWith(equalTo("goodbye-style"))))
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
        effect("the text is rendered", async () => {
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
          const funZone = (name: string) => (root: HTMLBuilder) => {
            root.h2(el => el.children.textNode(name))
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subview(funZone("Fun!"))
                .subview(funZone("Awesome!"))
                .subview(funZone("Great!"))
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
