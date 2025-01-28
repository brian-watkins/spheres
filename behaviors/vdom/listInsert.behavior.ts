import { behavior, effect, example } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { selectElements } from "helpers/displayElement.js";
import { ListExamplesState, childElementText, renderAppBasedOnState, updateState } from "helpers/listHelpers";
import { renderContext } from "helpers/renderContext.js";

export default behavior("insert items into list", [
  example(renderContext<ListExamplesState>())
    .description("insert at end")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
      ]),
      perform: [
        updateState("some elements are added to the end", [
          "child-1",
          "child-2",
          "child-3",
          "child-4",
          "child-5",
        ])
      ],
      observe: [
        effect("the elements are all in the list", async () => {
          const texts = await selectElements("[data-child]").texts()
          expect(texts, is(equalTo([
            "child-1 (0)",
            "child-2 (1)",
            "child-3 (2)",
            "child-4 (3)",
            "child-5 (4)",
          ])))
        })
      ]
    }).andThen({
      perform: [
        updateState("more elements are inserted at the end", [
          "child-1",
          "child-2",
          "child-3",
          "child-4",
          "child-5",
          "child-6",
          "child-7",
        ])
      ],
      observe: [
        childElementText("the elements are all in the list", [
          "child-1 (0)",
          "child-2 (1)",
          "child-3 (2)",
          "child-4 (3)",
          "child-5 (4)",
          "child-6 (5)",
          "child-7 (6)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("insert at beginning")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
      ]),
      perform: [
        updateState("add elements at the beginning", [
          "child-3",
          "child-4",
          "child-5",
          "child-1",
          "child-2",
        ])
      ],
      observe: [
        childElementText("the children are all present", [
          "child-3 (0)",
          "child-4 (1)",
          "child-5 (2)",
          "child-1 (3)",
          "child-2 (4)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("insert new elements throughout")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2"
      ]),
      perform: [
        updateState("new elements are inserted", [
          "child-8",
          "child-1",
          "child-3",
          "child-4",
          "child-2",
          "child-5",
          "child-6",
        ])
      ],
      observe: [
        effect("the elements are all in the right order", async () => {
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child-8 (0)",
            "child-1 (1)",
            "child-3 (2)",
            "child-4 (3)",
            "child-2 (4)",
            "child-5 (5)",
            "child-6 (6)",
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("insert throughout after removing and updating element after the first")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
        "child-3",
        "child-4"
      ]),
      perform: [
        updateState("an item is updated", [
          "child-1",
          "child-6",
        ]),
        updateState("more elements are inserted", [
          "child-1",
          "child-2",
          "child-6",
          "child-3",
          "child-7"
        ])
      ],
      observe: [
        effect("the elements are all in the right order", async () => {
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child-1 (0)",
            "child-2 (1)",
            "child-6 (2)",
            "child-3 (3)",
            "child-7 (4)"
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("insert new item in the middle")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered", [
          "one", "six", "two", "three", "four", "five"
        ]),
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "one (0)", "six (1)", "two (2)", "three (3)", "four (4)", "five (5)"
        ])
      ]
    }),


])