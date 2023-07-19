import { behavior, effect, example, fact } from "esbehavior"
import { equalTo, expect, is, resolvesTo } from "great-expectations"
import { selectElement, selectElementWithText, selectElements } from "helpers/displayElement.js"
import { addAttribute, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js"
import { renderContext } from "helpers/renderContext.js"

export default behavior("mount", [
  example(renderContext())
    .description("mount text")
    .script({
      suppose: [
        fact("a node with text", (context) => {
          context.mount(makeVirtualTextNode("Hello!"))
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
          context.mount(makeVirtualElement("span", virtualNodeConfig(), [
            makeVirtualTextNode("Cool!")
          ]))
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
          const config = virtualNodeConfig()
          addAttribute(config, "data-stuff", "227")
          context.mount(makeVirtualElement("span", config, [
            makeVirtualTextNode("This is "),
            makeVirtualTextNode("so cool!")
          ]))
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
          const config = virtualNodeConfig()
          addAttribute(config, "data-things", "14")
          context.mount(makeVirtualElement("div", config, [
            makeVirtualTextNode("Radical"),
            makeVirtualTextNode(" stuff!"),
          ]))
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
    .description("mount the same element with child elements")
    .script({
      suppose: [
        fact("an element with children", (context) => {
          const config = virtualNodeConfig()
          addAttribute(config, "data-things", "21")
          const pConfig = virtualNodeConfig()
          addAttribute(pConfig, "class", "text-slate-900")
          context.mount(makeVirtualElement("div", config, [
            makeVirtualElement("p", pConfig, [
              makeVirtualTextNode("This is some text.")
            ]),
            makeVirtualElement("p", pConfig, [
              makeVirtualTextNode("This is some more text.")
            ])
          ]))
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
    })
])