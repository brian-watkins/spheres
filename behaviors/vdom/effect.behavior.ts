import { Container, container, derived, useEffect } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is, resolvesTo } from "great-expectations";
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
          await expect(selectElement("div").attribute("data-my-info"), resolvesTo("hello"))
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
          await expect(selectElement("div").attribute("data-my-info"), resolvesTo("awesome!"))
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
          await expect(selectElement("div").property("className"), resolvesTo("hello-style"))
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
          await expect(selectElement("div").property("className"), resolvesTo("goodbye-style"))
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
    }),

  example(renderContext<EffectOrderingContext>())
    .description("user effect that assumes rendering is complete")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState({
            token: container({ initialValue: "hello" }),
            domReport: []
          })
        }),
        fact("there is an effect that examines the DOM", (context) => {
          const word = derived(get => get(context.state.token))
          useEffect(context.store, {
            run(get) {
              if (get(word).length > 0) {
                const text = (document.querySelector("[data-test-element]") as HTMLElement)?.innerText ?? "<NO ELEMENT FOUND>"
                context.state.domReport.push(text)
              }
            },
          })
        }),
        fact("there is an element with reactive text", (context) => {
          context.mountView((root) => {
            root.div(el => {
              el.config.dataAttribute("test-element")
              el.children.textNode(get => {
                return get(context.state.token)
              })
            })
          })
        })
      ],
      observe: [
        effect("the effect runs when registered, before the view is mounted", (context) => {
          expect(context.state.domReport, is([
            "<NO ELEMENT FOUND>"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.token, "what???")
        })
      ],
      observe: [
        effect("the effect runs after the dom has been updated", (context) => {
          expect(context.state.domReport, is([
            "<NO ELEMENT FOUND>",
            "what???"
          ]))
        })
      ]
    })

])

interface EffectOrderingContext {
  token: Container<string>
  domReport: Array<string>
}