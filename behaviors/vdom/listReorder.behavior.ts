import { behavior, effect, example, fact, step } from "best-behavior"
import { renderContext } from "./helpers/renderContext.js";
import { selectElements } from "helpers/displayElement.js";
import { equalTo, expect, is, resolvesTo } from "great-expectations";
import { ListExamplesState, childElementText, renderAppBasedOnState, updateState } from "helpers/listHelpers.js";
import { Container } from "../../src/store/store.js";
import { container } from "../../src/store/container.js";

export default behavior("reorder list", [

  example(renderContext<ListExamplesState>())
    .description("reorder from front to back")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered", [
          "five", "four", "three", "two", "one"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "five (0)",
          "four (1)",
          "three (2)",
          "two (3)",
          "one (4)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered", [
          "four", "one", "five", "three", "two"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "four (0)", "one (1)", "five (2)", "three (3)", "two (4)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("swap")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five", "six", "seven"]),
      perform: [
        updateState("swap two elements", [
          "one", "six", "three", "four", "five", "two", "seven"
        ])
      ],
      observe: [
        childElementText("the elements are swapped", [
          "one (0)", "six (1)", "three (2)", "four (3)", "five (4)", "two (5)", "seven (6)"
        ])
      ]
    }).andThen({
      perform: [
        updateState("swap the elements back", [
          "one", "two", "three", "four", "five", "six", "seven"
        ])
      ],
      observe: [
        childElementText("the elements are in their original order", [
          "one (0)", "two (1)", "three (2)", "four (3)", "five (4)", "six (5)", "seven (6)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("replace all items")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("p").texts()
          expect(texts, is(equalTo([
            "one (0)",
            "two (1)",
            "three (2)",
            "four (3)",
            "five (4)",
          ])))
        }),
      ]
    }).andThen({
      perform: [
        updateState("the list items are all replaced", [
          "six",
          "seven",
          "eight"
        ])
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("p").texts()
          expect(texts, is(equalTo([
            "six (0)",
            "seven (1)",
            "eight (2)"
          ])))
        }),
      ]
    }).andThen({
      perform: [
        updateState("the list items are all replaced again", [
          "12",
          "13",
          "14",
          "15",
        ])
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("p").texts()
          expect(texts, is(equalTo([
            "12 (0)",
            "13 (1)",
            "14 (2)",
            "15 (3)",
          ])))
        }),
      ]
    }),

  example(renderContext<FragmentContext>())
    .description("Reorder fragments")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: [ "one", "two", "three", "four", "five" ]})
          })
        }),
        fact("there is a list of lists", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), (item, index) => root => {
                root.subviews(() => [ "a", "b" ], (subItem, subIndex) => root => {
                  root.div(el => {
                    el.children.textNode(get => `${get(item)} at ${get(index)} => ${get(subItem)} at ${get(subIndex)}`)
                  })
                })
              })
            })
          })
        })
      ],
      observe: [
        effect("it renders the lists", async () => {
          await expect(selectElements("div").texts(), resolvesTo([
            "one at 0 => a at 0",
            "one at 0 => b at 1",
            "two at 1 => a at 0",
            "two at 1 => b at 1",
            "three at 2 => a at 0",
            "three at 2 => b at 1",
            "four at 3 => a at 0",
            "four at 3 => b at 1",
            "five at 4 => a at 0",
            "five at 4 => b at 1",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("reorder the main list", (context) => {
          context.writeTo(context.state.items, [ "five", "four", "three", "two", "one" ])
        })
      ],
      observe: [
        effect("it reorders the lists", async () => {
          await expect(selectElements("div").texts(), resolvesTo([
            "five at 0 => a at 0",
            "five at 0 => b at 1",
            "four at 1 => a at 0",
            "four at 1 => b at 1",
            "three at 2 => a at 0",
            "three at 2 => b at 1",
            "two at 3 => a at 0",
            "two at 3 => b at 1",
            "one at 4 => a at 0",
            "one at 4 => b at 1",
          ]))
        })
      ]
    })

])

interface FragmentContext {
  items: Container<Array<string>>
}