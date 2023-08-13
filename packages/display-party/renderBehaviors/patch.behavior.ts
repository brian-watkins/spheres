import { addAttribute, addProperty, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElement, selectElementWithText, selectElements } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";
import { Container, container } from "state-party";

export default behavior("patch", [
  example(renderContext())
    .description("the text is patched")
    .script({
      suppose: [
        fact("a node with text", (context) => {
          context.mount(makeVirtualTextNode("Hello!"))
        })
      ],
      perform: [
        step("the node is patched with different text", (context) => {
          context.patch(makeVirtualTextNode("YO YO YO!"))
        })
      ],
      observe: [
        effect("the updated text is rendered", async () => {
          await expect(selectElementWithText("YO YO YO!").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }),
  example(renderContext())
    .description("the attributes are patched")
    .script({
      suppose: [
        fact("an element with attributes is mounted", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "17")
          addAttribute(config, "data-other-stuff", "22")
          context.mount(makeVirtualElement("p", config, [
            makeVirtualTextNode("Here is some thing!")
          ]))
        })
      ],
      perform: [
        step("the element is patched", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "23")
          addAttribute(config, "class", "text-lg")
          context.patch(makeVirtualElement("p", config, [
            makeVirtualTextNode("Here is some thing!")
          ]))
        })
      ],
      observe: [
        effect("the patched element is displayed", async () => {
          await expect(selectElement(".text-lg[data-stuff='23']").text(),
            resolvesTo(equalTo("Here is some thing!")))

          await expect(selectElement("[data-other-stuff='22']").exists(),
            resolvesTo(equalTo(false)))
        })
      ]
    }),
  example(renderContext())
    .description("the input value is patched")
    .script({
      suppose: [
        fact("an input element is mounted with no value", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "type", "text")
          context.mount(makeVirtualElement("input", config, []))
        })
      ],
      perform: [
        step("a value is typed into the field", async () => {
          await selectElement("input").type("22")
        })
      ],
      observe: [
        effect("the input value reflects the typed value", async () => {
          await expect(selectElement("input").inputValue(), resolvesTo(equalTo("22")))
        })
      ]
    }).andThen({
      perform: [
        step("the input value is patched", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "type", "text")
          addAttribute(config, "value", "23")
          context.patch(makeVirtualElement("input", config, []))
        })
      ],
      observe: [
        effect("the input value reflects the patched value", async () => {
          await expect(selectElement("input").inputValue(), resolvesTo(equalTo("23")))
        })
      ]
    }).andThen({
      perform: [
        step("the input value is removed via patch", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "type", "text")
          context.patch(makeVirtualElement("input", config, []))
        })
      ],
      observe: [
        effect("the input value is the empty string", async () => {
          await expect(selectElement("input").inputValue(), resolvesTo(equalTo("")))
        })
      ]
    }),
  example(renderContext())
    .description("element with innerHTML is patched")
    .script({
      suppose: [
        fact("there is an element with innerHTML", (context) => {
          const config = virtualNodeConfig()
          addProperty(config, "innerHTML", "<p data-fun-stuff=\"yo\">This is some text!</p>")
          context.mount(makeVirtualElement("div", config, []))
        })
      ],
      perform: [
        step("the element is patched", (context) => {
          const config = virtualNodeConfig()
          addProperty(config, "innerHTML", "<p data-fun-stuff=\"yo?\">This is some cooler text!</p>")
          context.patch(makeVirtualElement("div", config, []))
        })
      ],
      observe: [
        effect("the patched element is displayed", async () => {
          await expect(selectElement("[data-fun-stuff='yo?']").text(), resolvesTo(equalTo("This is some cooler text!")))
        })
      ]
    }),
  example(renderContext())
    .description("an element with children is replaced with innerHTML")
    .script({
      suppose: [
        fact("there is an element with children", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("h1", virtualNodeConfig(), [
              makeVirtualTextNode("My title!")
            ])
          ]))
        })
      ],
      perform: [
        step("the element children are replaced with innerHTML", (context) => {
          const config = virtualNodeConfig()
          addProperty(config, "innerHTML", "<h3>A Better title!</h3>")
          context.patch(makeVirtualElement("div", config, []))
        })
      ],
      observe: [
        effect("the element is updated", async () => {
          await expect(selectElement("h3").text(), resolvesTo(equalTo("A Better title!")))
        })
      ]
    }),
  example(renderContext())
    .description("child text is patched")
    .script({
      suppose: [
        fact("mount element with child text", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "99")
          context.mount(makeVirtualElement("p", config, [
            makeVirtualTextNode("Here is some thing!")
          ]))
        })
      ],
      perform: [
        step("update the child text", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "99")
          context.patch(makeVirtualElement("p", config, [
            makeVirtualTextNode("Here are some other things!")
          ]))
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("[data-stuff='99']").text(),
            resolvesTo(equalTo("Here are some other things!")))
        })
      ]
    }),
  example(renderContext())
    .description("patch text and attributes multiple levels deep")
    .script({
      suppose: [
        fact("mount multiple levels of elements", (context) => {
          const childConfig = virtualNodeConfig()
          addAttribute(childConfig, "class", "fun-stuff")
          const child = makeVirtualElement("div", childConfig, [
            makeVirtualElement("p", childConfig, [
              makeVirtualTextNode("Hello!")
            ])
          ])

          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "99")
          context.mount(makeVirtualElement("div", config, [
            child
          ]))
        })
      ],
      perform: [
        step("update text and attributes throughout the tree", (context) => {
          const updatedConfig = virtualNodeConfig()
          addAttribute(updatedConfig, "class", "fun-stuff highlighted")

          const child = makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("p", updatedConfig, [
              makeVirtualTextNode("Hello again!")
            ])
          ])

          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "84")
          context.patch(makeVirtualElement("div", config, [
            child
          ]))
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("p.highlighted").text(),
            resolvesTo(equalTo("Hello again!")))
        }),
        effect("the attributes are updated", async () => {
          await expect(selectElements(".fun-stuff").count(), resolvesTo(equalTo(1)))
          await expect(selectElement("[data-stuff='84']").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }).andThen({
      perform: [
        step("patch again but leave text unchanged", (context) => {
          const updatedConfig = virtualNodeConfig()
          addAttribute(updatedConfig, "class", "cool-stuff highlighted")

          const child = makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("p", updatedConfig, [
              makeVirtualTextNode("Hello again!")
            ])
          ])

          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "84")
          context.patch(makeVirtualElement("div", config, [
            child
          ]))
        })
      ],
      observe: [
        effect("the class is updated", async () => {
          await expect(selectElement(".cool-stuff").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }).andThen({
      perform: [
        step("patch the text again", (context) => {
          const updatedConfig = virtualNodeConfig()
          addAttribute(updatedConfig, "class", "cool-stuff highlighted")

          const child = makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("p", updatedConfig, [
              makeVirtualTextNode("Hello again?!")
            ])
          ])

          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "84")
          context.patch(makeVirtualElement("div", config, [
            child
          ]))
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("p.highlighted").text(),
            resolvesTo(equalTo("Hello again?!")))
        }),
      ]
    }),
  example(renderContext<Container<string>>())
    .description("patch a stateful element")
    .script({
      suppose: [
        fact("there is a stateful element", (context) => {
          context.setState(container({ initialValue: "bowling" }))
          const statefulChild = makeStatefulElement(virtualNodeConfig(), (get) => {
            const config = virtualNodeConfig()
            addAttribute(config, "class", "funny")
            return makeVirtualElement("div", config, [
              makeVirtualTextNode(`Your favorite sport is: ${get(context.state)}`)
            ])
          })
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChild
          ]))
        })
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state, "banking")
        })
      ],
      observe: [
        effect("the element is updated", async () => {
          await expect(selectElement(".funny").text(),
            resolvesTo(equalTo("Your favorite sport is: banking")))
        })
      ]
    }),
  example(renderContext<Container<string>>())
    .description("patch a stateful element root node to a different type")
    .script({
      suppose: [
        fact("there is a stateful element", (context) => {
          context.setState(container({ initialValue: "bowling" }))
          const statefulChild = makeStatefulElement(virtualNodeConfig(), (get) => {
            if (get(context.state) === "bowling") {
              const config = virtualNodeConfig()
              addAttribute(config, "class", "funny")
              return makeVirtualElement("div", config, [
                makeVirtualTextNode(`Your favorite sport is: ${get(context.state)}`)
              ])
            } else {
              return makeVirtualTextNode("You like weird sports!")
            }
          })
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChild
          ]))
        })
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state, "jet ski")
        })
      ],
      observe: [
        effect("the element is updated", async () => {
          await expect(selectElementWithText("You like weird sports!").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }).andThen({
      perform: [
        step("the state updates again", (context) => {
          context.writeTo(context.state, "bowling")
        })
      ],
      observe: [
        effect("the previous node has been removed", async () => {
          await expect(selectElementWithText("You like weird sports!").exists(), resolvesTo(equalTo(false)))
        }),
        effect("the element is updated", async () => {
          await expect(selectElement(".funny").text(),
            resolvesTo(equalTo("Your favorite sport is: bowling")))
        })
      ]
    }),
  example(renderContext<Container<string>>())
    .description("patch parent of stateful element")
    .script({
      suppose: [
        fact("there is an element with a stateful child", (context) => {
          context.setState(container({ initialValue: "swimming" }))
          const statefulChild = makeStatefulElement(virtualNodeConfig(), (get) => {
            const config = virtualNodeConfig()
            addAttribute(config, "class", "funny")
            return makeVirtualElement("div", config, [
              makeVirtualTextNode(`Your favorite sport is: ${get(context.state)}`)
            ])
          })
          const parentConfig = virtualNodeConfig()
          addAttribute(parentConfig, "data-thing", "199")
          context.mount(makeVirtualElement("div", parentConfig, [
            statefulChild
          ]))
        })
      ],
      perform: [
        step("the stateful element is patched", (context) => {
          context.writeTo(context.state, "diving")
        }),
        step("the parent element is patched", (context) => {
          const statefulChild = makeStatefulElement(virtualNodeConfig(), (get) => {
            const config = virtualNodeConfig()
            addAttribute(config, "class", "funny")
            return makeVirtualElement("div", config, [
              makeVirtualTextNode(`Your favorite sport is: ${get(context.state)}`)
            ])
          })
          const parentConfig = virtualNodeConfig()
          addAttribute(parentConfig, "data-thing", "801")
          context.patch(makeVirtualElement("div", parentConfig, [
            statefulChild
          ]))
        })
      ],
      observe: [
        effect("the parent element is updated", async () => {
          await expect(selectElement("[data-thing='801']").exists(), resolvesTo(equalTo(true)))
        }),
        effect("the child element is updated", async () => {
          await expect(selectElement(".funny").text(), resolvesTo(equalTo("Your favorite sport is: diving")))
        })
      ]
    })
])