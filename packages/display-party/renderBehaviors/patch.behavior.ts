import { makeVirtualTextNode } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElementWithText } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";

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

])