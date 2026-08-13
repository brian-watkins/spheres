import { behavior, effect, example, fact } from "best-behavior";
import { testableStringRendererContext } from "./helpers/testableStringRendererContext";
import { container } from "@store/index";
import { svg } from "@view/index";
import { expect, is, stringContaining } from "great-expectations";

export default behavior("advanced types", [

  example(testableStringRendererContext)
    .description("readonly array with subviews")
    .script({
      suppose: [
        fact("a readonly array is used with subviews", (context) => {
          const list = container<ReadonlyArray<number>>({ initialValue: [ 1, 2, 3 ] })
          
          context.renderView(root => {
            root.subviews(get => get(list), (useItem) => root => {
              root.div(el => {
                el.children.textNode(useItem(item => `Item ${item.data}`))
              })
            })
          })
        })
      ],
      observe: [
        effect("it renders the list", (context) => {
          expect(context.getHTML(), is(stringContaining(`<div>Item 1</div><div>Item 2</div><div>Item 3</div>`)))
        })
      ]
    }),

  example(testableStringRendererContext)
    .description("readonly array with svg subviews")
    .script({
      suppose: [
        fact("a readonly array is used with svg subviews", (context) => {
          const list = container<ReadonlyArray<number>>({ initialValue: [ 1, 2, 3 ] })

          context.renderView(root => {
            root.subview(svg(svgEl => {
              svgEl.children.subviews(get => get(list), (useItem) => root => {
                root.text(el => {
                  el.children.textNode(useItem(item => `Item ${item.data}`))
                })
              })
            }))
          })
        })
      ],
      observe: [
        effect("it renders the list", (context) => {
          expect(context.getHTML(), is(stringContaining(`<text>Item 1</text><text>Item 2</text><text>Item 3</text>`)))
        })
      ]
    })

])