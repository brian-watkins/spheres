import { behavior, effect, example, fact } from "esbehavior"
import { equalTo, expect, is, resolvesTo } from "great-expectations"
import { selectElement, selectElementWithText, selectElements } from "helpers/displayElement.js"
import { renderContext } from "helpers/renderContext.js"
import { container } from "@spheres/store"

export default behavior("mount", [

  example(renderContext())
    .description("mount text")
    .script({
      suppose: [
        fact("there is a node with text", (context) => {
          context.mountView(root => root.textNode("Hello!"))
        })
      ],
      observe: [
        effect("the text is rendered", async () => {
          await expect(selectElementWithText("Hello!").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }),

  example(renderContext())
    .description("mount a different element from the root with text")
    .script({
      suppose: [
        fact("an element", (context) => {
          context.mountView(root => {
            root.span(el => {
              el.children.textNode("Cool!")
            })
          })
        })
      ],
      observe: [
        effect("the element is rendered", async () => {
          await expect(selectElement("span").text(), resolvesTo(equalTo("Cool!")))
        })
      ]
    }),

  example(renderContext())
    .description("mount a different element with text and an attribute")
    .script({
      suppose: [
        fact("an element", (context) => {
          context.mountView(root => {
            root.span(el => {
              el.config.dataAttribute("stuff", "227")
              el.children
                .textNode("This is ")
                .textNode("so cool!")
            })
          })
        })
      ],
      observe: [
        effect("the element is rendered", async () => {
          await expect(
            selectElement("span[data-stuff='227']").text(),
            resolvesTo(equalTo("This is so cool!"))
          )
        })
      ]
    }),

  example(renderContext())
    .description("mount the same element as the root with an attribute and text")
    .script({
      suppose: [
        fact("an element that is the same type as the root", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.config.dataAttribute("things", "14")
              el.children
                .textNode("Radical")
                .textNode(" stuff!")
            })
          })
        })
      ],
      observe: [
        effect("the element is rendered", async () => {
          await expect(
            selectElement("div[data-things='14']").text(),
            resolvesTo(equalTo("Radical stuff!"))
          )
        })
      ]
    }),
  example(renderContext())
    .description("mount an element with inner HTML")
    .script({
      suppose: [
        fact("there is an element with inner html content", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.config.innerHTML("<p data-fun-stuff=\"yo\">This is some text!</p>")
            })
          })
        })
      ],
      observe: [
        effect("the element is displayed", async () => {
          await expect(selectElement("[data-fun-stuff='yo']").text(), resolvesTo(equalTo("This is some text!")))
        })
      ]
    }),

  example(renderContext())
    .description("mount the same element with child elements")
    .script({
      suppose: [
        fact("an element with children", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.config.dataAttribute("things", "21")
              el.children
                .p(el => {
                  el.config.class("text-slate-900")
                  el.children.textNode("This is some text.")
                })
                .p(el => {
                  el.config.class("text-slate-900")
                  el.children.textNode("This is some more text.")
                })
            })
          })
        })
      ],
      observe: [
        effect("the elements are rendered", async () => {
          const texts = await selectElements("p[class='text-slate-900']")
            .map(el => el.text())

          expect(texts, is(equalTo([
            "This is some text.",
            "This is some more text."
          ])))
        })
      ]
    }),

  example(renderContext())
    .description("mount a stateful view")
    .script({
      suppose: [
        fact("a stateful view", (context) => {
          const name = container({ initialValue: "Funny person" })
          context.mountView(root => {
            root.div(el => {
              el.config.dataAttribute("label", "stateful")
              el.children.textNode(get => `${get(name)}, you are so stateful!`)
            })
          })
        })
      ],
      observe: [
        effect("it mounts the stateful element", async () => {
          await expect(selectElement("[data-label='stateful']").text(),
            resolvesTo(equalTo("Funny person, you are so stateful!")))
        })
      ]
    })
])