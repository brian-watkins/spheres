import { behavior, effect, example } from "esbehavior"
import { renderContext } from "./helpers/renderContext.js";
import { selectElements } from "helpers/displayElement.js";
import { equalTo, expect, is } from "great-expectations";
import { ListExamplesState, childElementText, renderAppBasedOnState, updateState } from "helpers/listHelpers.js";

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
    })

])
