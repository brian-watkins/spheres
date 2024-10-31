import { behavior, effect, example } from "esbehavior";
import { renderContext } from "./helpers/renderContext.js";
import { expectChild, expectTotalChildren } from "helpers/index.js";
import { ListExamplesState, renderAppBasedOnState, updateState } from "helpers/listHelpers.js";

export default behavior("removing items from list", [

  example(renderContext<ListExamplesState>())
    .description("removing from the end of a list")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
        "child-3",
      ]),
      perform: [
        updateState("remove two of the children", [
          "child-1"
        ])
      ],
      observe: [
        effect("there is just one child", async () => {
          await expectTotalChildren(1)
          await expectChild(1, { atIndex: 0 })
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("removing from the beginning of a list")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
        "child-3",
        "child-4",
      ]),
      perform: [
        updateState("remove the first two childen", [
          "child-2",
          "child-3",
          "child-4"
        ])
      ],
      observe: [
        effect("there are just three children", async () => {
          await expectTotalChildren(3)
          await expectChild(2, { atIndex: 0 })
          await expectChild(3, { atIndex: 1 })
          await expectChild(4, { atIndex: 2 })
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("removing from throughout a list")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
        "child-3",
        "child-4",
        "child-5",
      ]),
      perform: [
        updateState("remove some of the children", [
          "child-1",
          "child-3",
          "child-5",
        ]),
      ],
      observe: [
        effect("there remaining children are present", async () => {
          await expectTotalChildren(3)
          await expectChild(1, { atIndex: 0 })
          await expectChild(3, { atIndex: 1 })
          await expectChild(5, { atIndex: 2 })
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("Remove all elements")
    .script({
      suppose: renderAppBasedOnState([
        "child-1",
        "child-2",
        "child-3",
      ]),
      perform: [
        updateState("reorder the elements", [
          "child-2",
          "child-3",
          "child-1",
        ]),
        updateState("remove all the elements", [])
      ],
      observe: [
        effect("there are no elements", async () => {
          await expectTotalChildren(0)
        })
      ]
    })

])
