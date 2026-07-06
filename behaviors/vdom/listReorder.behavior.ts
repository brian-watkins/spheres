import { behavior, effect, example, fact, step } from "best-behavior"
import { renderContext } from "./helpers/renderContext.js";
import { selectElement, selectElements } from "./helpers/displayElement.js";
import { arrayContaining, equalTo, expect, is, resolvesTo, satisfying } from "great-expectations";
import { ListExamplesState, childElementText, renderAppBasedOnState, ssrAndActivateBasedOnState, updateState } from "./helpers/listHelpers.js";
import { Container, container, update } from "@store/index.js";
import { HTMLView, UseItem } from "@view/index";
import { nodeAddedRecord, nodeRemovedRecord, nodeReplacedRecord } from "./helpers/changeRecords.js";

export default behavior("reorder list", [

  example(renderContext<ListExamplesState>())
    .description("reorder from front to back")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        step("observe changes on items", (context) => {
          context.observe("DIV")
        }),
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
        ]),
        effect("the list is reordered in four moves", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 4 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 4 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move a block of items from the front to the back")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        step("observe changes on items", (context) => {
          context.observe("DIV")
        }),
        updateState("the first two items move to the end", [
          "three", "four", "five", "one", "two"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "three (0)",
          "four (1)",
          "five (2)",
          "one (3)",
          "two (4)",
        ]),
        effect("only the two displaced items result in dom changes", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 2 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 2 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder element from earlier to later")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered", [
          "two", "one", "three", "four", "five"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "two (0)",
          "one (1)",
          "three (2)",
          "four (3)",
          "five (4)",
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
    .description("reverse a run of items while keeping the tail in place")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four"]),
      perform: [
        updateState("the first three items are reversed and the last stays put", [
          "three", "two", "one", "four"
        ])
      ],
      observe: [
        childElementText("the elements are in the reversed order with the tail unchanged", [
          "three (0)", "two (1)", "one (2)", "four (3)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move so the end is replaced")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        step("observe changes on items", (context) => {
          context.observe("DIV")
        }),
        updateState("the list is reordered", [
          "two", "three", "four", "one", "five"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "two (0)", "three (1)", "four (2)", "one (3)", "five (4)"
        ]),
        effect("the list is reordered in one move", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move the last to the front")
    .script({
      suppose: [
        ...renderAppBasedOnState(["one", "two", "three", "four", "five"]),
        fact("dom changes to the list are observed", (context) => {
          context.observe("div")
        })
      ],
      perform: [
        updateState("the list is reordered", [
          "five", "one", "two", "three", "four"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "five (0)", "one (1)", "two (2)", "three (3)", "four (4)"
        ]),
        effect("only the moved element results in a dom change", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move the first to the end")
    .script({
      suppose: [
        ...renderAppBasedOnState(["one", "two", "three", "four", "five"]),
        fact("dom changes to the list are observed", (context) => {
          context.observe("div")
        })
      ],
      perform: [
        updateState("the list is reordered", [
          "two", "three", "four", "five", "one"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "two (0)", "three (1)", "four (2)", "five (3)", "one (4)"
        ]),
        effect("only the moved element results in a dom change", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move the last to the middle")
    .script({
      suppose: [
        ...renderAppBasedOnState(["one", "two", "three", "four", "five"]),
        fact("dom changes to the list are observed", (context) => {
          context.observe("div")
        })
      ],
      perform: [
        updateState("the list is reordered", [
          "one", "five", "two", "three", "four"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "one (0)", "five (1)", "two (2)", "three (3)", "four (4)"
        ]),
        effect("only the moved element results in a dom change", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder in a browser without moveBefore support")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        step("the list is reordered while moveBefore is unavailable", (context) => {
          const moveBefore = (Element.prototype as any).moveBefore
          delete (Element.prototype as any).moveBefore
          try {
            context.writeTo(context.state.listContainer, [
              "five", "one", "two", "three", "four"
            ])
          } finally {
            (Element.prototype as any).moveBefore = moveBefore
          }
        })
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "five (0)",
          "one (1)",
          "two (2)",
          "three (3)",
          "four (4)",
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move so the end is earlier and the list truncated")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        step("observe changes on items", (context) => {
          context.observe("DIV")
        }),
        updateState("the list is reordered", [
          "five", "two", "three"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "five (0)", "two (1)", "three (2)"
        ]),
        effect("the reorder involves replacing one node then deleting one", (context) => {
          expect(context.changeRecords, is(satisfying([
            arrayContaining(
              equalTo(nodeAddedRecord()), { times: 1 }
            ),
            arrayContaining(
              equalTo(nodeRemovedRecord()), { times: 3 }
            ),
            arrayContaining(
              equalTo(nodeReplacedRecord()), { times: 0 }
            )
          ])))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder again after a moved item replaces the first item")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered so the last moves to the front and the list is truncated", [
          "five", "two", "three"
        ]),
        updateState("the list is reordered again", [
          "two", "five", "three"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order after the second reorder", [
          "two (0)", "five (1)", "three (2)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder again after the first item is deleted")
    .script({
      suppose: renderAppBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the first item is deleted", [
          "two", "three", "four", "five"
        ]),
        updateState("the list is reordered again", [
          "three", "two", "four", "five"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order after the second reorder", [
          "three (0)", "two (1)", "four (2)", "five (3)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder again after a new item is inserted at the front")
    .script({
      suppose: renderAppBasedOnState(["two", "three", "four", "five"]),
      perform: [
        updateState("a new item is inserted at the front", [
          "one", "two", "three", "four", "five"
        ]),
        updateState("the list is reordered again", [
          "two", "one", "three", "four", "five"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order after the second reorder", [
          "two (0)", "one (1)", "three (2)", "four (3)", "five (4)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("reorder again after a new item replaces the first item")
    .script({
      suppose: renderAppBasedOnState(["one", "two"]),
      perform: [
        updateState("a new item replaces the first item", [
          "nine", "two"
        ]),
        updateState("the list is reordered again", [
          "two", "nine"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order after the second reorder", [
          "two (0)", "nine (1)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("move last toward the front after activating ssr")
    .script({
      suppose: ssrAndActivateBasedOnState(["one", "two", "three", "four", "five"]),
      perform: [
        updateState("the list is reordered", [
          "one", "five", "two", "three", "four"
        ])
      ],
      observe: [
        childElementText("the elements are in the expected order", [
          "one (0)", "five (1)", "two (2)", "three (3)", "four (4)"
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
    }).andThen({
      perform: [
        updateState("swap the elements again", [
          "one", "six", "three", "four", "five", "two", "seven"
        ])
      ],
      observe: [
        childElementText("the elements are swapped", [
          "one (0)", "six (1)", "three (2)", "four (3)", "five (4)", "two (5)", "seven (6)"
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
    .description("Reorder list of lists")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three", "four", "five"] })
          })
        }),
        fact("there is a list of lists", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), (stateful) => root => {
                root.subviews(() => ["a", "b"], (subStateful) => root => {
                  root.div(el => {
                    el.children.textNode(subStateful((subItem, get) => {
                      return stateful((item) => `${item.data} at ${item.index} => ${subItem.data} at ${subItem.index}`)(get)
                    }))
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
          context.writeTo(context.state.items, ["five", "four", "three", "two", "one"])
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
    }),

  example(renderContext<FragmentContext>())
    .description("reorder list where each item has its own counter")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("there is a list where each item view defines its own counter", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const counter = container({ initialValue: 0 })

            return root => {
              root.div(el => {
                el.config.dataAttribute("item", stateful(item => item.data))
                el.children
                  .p(el => {
                    el.config.dataAttribute("count")
                    el.children.textNode(stateful((item, get) => `${item.data}: ${get(counter)}`))
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("increment")
                      .on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Increment")
                  })
              })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("each item's counter starts at zero", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 0",
            "two: 0",
            "three: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the counters are incremented for various items", async () => {
          await selectElements("[data-increment]").at(0).click()
          await selectElements("[data-increment]").at(0).click()
          await selectElements("[data-increment]").at(1).click()
          await selectElements("[data-increment]").at(2).click()
          await selectElements("[data-increment]").at(2).click()
          await selectElements("[data-increment]").at(2).click()
        })
      ],
      observe: [
        effect("each item maintains its own distinct count", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 2",
            "two: 1",
            "three: 3"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the list is reordered", (context) => {
          context.writeTo(context.state.items, ["three", "one", "two"])
        })
      ],
      observe: [
        effect("each item's count moves with the item", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "three: 3",
            "one: 2",
            "two: 1"
          ]))
        })
      ]
    }),

  example(renderContext<FragmentContext>())
    .description("reorder list where each item is a fragment with its own counter")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three", "four"] })
          })
        }),
        fact("there is a list where each item view is a fragment that defines its own counter", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const counter = container({ initialValue: 0 })

            return root => {
              root
                .h3(el => {
                  el.config.dataAttribute("title", stateful(item => item.data))
                  el.children.textNode(stateful(item => item.data))
                })
                .p(el => {
                  el.config.dataAttribute("count")
                  el.children.textNode(stateful((item, get) => `${item.data}: ${get(counter)}`))
                })
                .button(el => {
                  el.config
                    .dataAttribute("increment", stateful(item => item.data))
                    .on("click", () => update(counter, val => val + 1))
                  el.children.textNode("Increment")
                })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("each item's counter starts at zero", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 0", "two: 0", "three: 0", "four: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the counters are incremented to distinct values", async () => {
          await selectElement("[data-increment='one']").click()
          await selectElement("[data-increment='two']").click()
          await selectElement("[data-increment='two']").click()
          for (let i = 0; i < 3; i++) await selectElement("[data-increment='three']").click()
          for (let i = 0; i < 4; i++) await selectElement("[data-increment='four']").click()
        })
      ],
      observe: [
        effect("each fragment maintains its own distinct count", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 1", "two: 2", "three: 3", "four: 4"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("an item is moved toward the front", (context) => {
          context.writeTo(context.state.items, ["three", "one", "two", "four"])
        })
      ],
      observe: [
        effect("the fragments reorder and counts move with each item", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "three", "one", "two", "four"
          ]))
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "three: 3", "one: 1", "two: 2", "four: 4"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a moved fragment's counter is incremented after the reorder", async () => {
          await selectElement("[data-increment='one']").click()
          await selectElement("[data-increment='one']").click()
        })
      ],
      observe: [
        effect("the moved fragment's events still target its own counter", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "three: 3", "one: 3", "two: 2", "four: 4"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the list is fully reversed", (context) => {
          context.writeTo(context.state.items, ["four", "two", "one", "three"])
        })
      ],
      observe: [
        effect("every fragment's count follows it through the reversal", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "four", "two", "one", "three"
          ]))
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "four: 4", "two: 2", "one: 3", "three: 3"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the list is restored to its original order", (context) => {
          context.writeTo(context.state.items, ["one", "two", "three", "four"])
        })
      ],
      observe: [
        effect("every fragment's count is preserved in the original order", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "one", "two", "three", "four"
          ]))
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 3", "two: 2", "three: 3", "four: 4"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a new item is inserted before a stateful item", (context) => {
          context.writeTo(context.state.items, ["one", "two", "five", "three", "four"])
        })
      ],
      observe: [
        effect("the new item starts fresh while the others keep their counts", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "one", "two", "five", "three", "four"
          ]))
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 3", "two: 2", "five: 0", "three: 3", "four: 4"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a new item is appended to the end of the list", (context) => {
          context.writeTo(context.state.items, ["one", "two", "five", "three", "four", "six"])
        })
      ],
      observe: [
        effect("the appended fragment renders at the end with a fresh counter while the others keep their counts", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "one", "two", "five", "three", "four", "six"
          ]))
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 3", "two: 2", "five: 0", "three: 3", "four: 4", "six: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the appended fragment's counter is incremented", async () => {
          for (let i = 0; i < 4; i++) await selectElement("[data-increment='six']").click()
        })
      ],
      observe: [
        effect("the appended fragment's events target its own counter", async () => {
          await expect(selectElements("[data-count]").texts(), resolvesTo([
            "one: 3", "two: 2", "five: 0", "three: 3", "four: 4", "six: 4"
          ]))
        })
      ]
    })

])

interface FragmentContext {
  items: Container<Array<string>>
}