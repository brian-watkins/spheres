import { behavior, effect, example } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { selectElements } from "./helpers/displayElement.js";
import { ListExamplesState, childElementText, renderAppBasedOnState, updateState } from "./helpers/listHelpers";
import { renderContext } from "./helpers/renderContext.js";

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

  example(renderContext<ListExamplesState>())
    .description("a new item replaces the first while a later item moves up")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three"]),
      perform: [
        updateState("the first item is replaced and the last item moves up", [
          "new",
          "three",
        ])
      ],
      observe: [
        childElementText("the new item leads and the surviving item follows", [
          "new (0)",
          "three (1)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("a new item is appended after the leading items are reordered")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four"]),
      perform: [
        updateState("the first two swap, the third is dropped, and a new item is appended", [
          "two",
          "one",
          "four",
          "new",
        ])
      ],
      observe: [
        childElementText("the new item ends up last", [
          "two (0)",
          "one (1)",
          "four (2)",
          "new (3)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("a new item replaces the head while two later items are kept in order")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four"]),
      perform: [
        updateState("the first two are replaced by a new head and the last two are kept", [
          "new",
          "three",
          "four",
        ])
      ],
      observe: [
        childElementText("the kept items stay in their original relative order", [
          "new (0)",
          "three (1)",
          "four (2)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("a new head is added while the rest of the list is reordered around it")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("a new head is added and the survivors are reordered", [
          "new",
          "three",
          "four",
          "two",
          "five",
          "one",
        ])
      ],
      observe: [
        childElementText("every surviving item keeps its intended position", [
          "new (0)",
          "three (1)",
          "four (2)",
          "two (3)",
          "five (4)",
          "one (5)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("multiple new items are inserted before the only existing item")
    .script({
      suppose: renderAppBasedOnState(["one"]),
      perform: [
        updateState("two new items are inserted at the front", [
          "two",
          "three",
          "one",
        ])
      ],
      observe: [
        childElementText("the existing item moves to the end after the new items", [
          "two (0)",
          "three (1)",
          "one (2)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("a new tail is added while the rest of the list is truncated")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four"]),
      perform: [
        updateState("a new head is added and the survivors are reordered", [
          "three",
          "new",
        ])
      ],
      observe: [
        childElementText("every surviving item keeps its intended position", [
          "three (0)",
          "new (1)",
        ])
      ]
    }),

])