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
          "five",
          "four",
          "three",
          "two",
          "one",
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
          "four", "one", "five", "three", "two"
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
          "one", "six", "three", "four", "five", "two", "seven"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("replace all items")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("p").map(el => el.text())
          expect(texts, is(equalTo([
            "one",
            "two",
            "three",
            "four",
            "five",
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
          const texts = await selectElements("p").map(el => el.text())
          expect(texts, is(equalTo([
            "six",
            "seven",
            "eight"
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
          const texts = await selectElements("p").map(el => el.text())
          expect(texts, is(equalTo([
            "12",
            "13",
            "14",
            "15",
          ])))
        }),
      ]
    })

])