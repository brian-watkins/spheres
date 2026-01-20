import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { HTMLBuilder } from "@view/index";
import { serializedValue } from "@store/serialize";
import { container } from "@store/index";
import { selectElement } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

export default behavior("streaming state", [

  example(renderContext())
    .description("queuing serialized state that arrives before activation")
    .script({
      suppose: [
        fact("there is server side rendered html", (context) => {
          context.loadServerSideRenderedHtml(testView)
        }),
        fact("the view is prepared for streaming", (context) => {
          context.initStream()
        })
      ],
      perform: [
        step("some data is streamed", (context) => {
          context.streamState("1", serializedValue("stuff", [ "cats", "bowling shoes" ]))
          context.streamState("2", serializedValue("name", "Mr. Cool"))
        }),
        step("the zone is activated", (context) => {
          context.activateSSRZone(testView, { stuff, name })
        })
      ],
      observe: [
        effect("the view is updated with the streamed data", async () => {
          await expect(selectElement("h1").text(), resolvesTo("Hello, Mr. Cool!"))
          await expect(selectElement("p").text(), resolvesTo("You have these things: cats and bowling shoes"))
        })
      ]
    })

])

const stuff = container({ initialValue: [ "stuff" ] })
const name = container({ initialValue: "No Name" })

function testView(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => {
        el.children.textNode(get => `Hello, ${get(name)}!`)
      })
      .hr()
      .p(el => {
        el.children.textNode(get => `You have these things: ${get(stuff).join(" and ")}`)
      })
  })
}