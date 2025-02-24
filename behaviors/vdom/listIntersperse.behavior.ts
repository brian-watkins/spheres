import { collection, Container, container, derived, State, StateCollection, use, write } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "./helpers/displayElement";
import { ListExamplesState, childElementText, containerWithList, itemView, otherItemView, updateState } from "./helpers/listHelpers";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { HTMLView } from "@view/index";

export default behavior("lists interspersed among other children", [

  example(renderContext<ListExamplesState>())
    .description("when there are other children before the list")
    .script({
      suppose: [
        containerWithList(["list-child-1", "list-child-2", "list-child-3"]),
        fact("there is a view with other children", (context) => {
          context.mountView((root) => {
            root.main(el => {
              el.children
                .h1(el => {
                  el.config.dataAttribute("child", "-2")
                  el.children.textNode("Some title")
                })
                .p(el => {
                  el.config.dataAttribute("child", "-1")
                  el.children.textNode("Some text")
                })
                .subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      observe: [
        childElementText("all the children are displayed in order", [
          "Some title",
          "Some text",
          "list-child-1 (0)",
          "list-child-2 (1)",
          "list-child-3 (2)"
        ])
      ]
    }).andThen({
      perform: [
        updateState("remove some elements from the list", [
          "list-child-3"
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "Some title",
          "Some text",
          "list-child-3 (0)"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add more items to the list", [
          "list-child-1",
          "list-child-2",
          "list-child-3",
          "list-child-4",
          "list-child-5",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "Some title",
          "Some text",
          "list-child-1 (0)",
          "list-child-2 (1)",
          "list-child-3 (2)",
          "list-child-4 (3)",
          "list-child-5 (4)"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("when there are children after the list")
    .script({
      suppose: [
        containerWithList(["list-child-1", "list-child-2", "list-child-3"]),
        fact("there is a view with other children after the list", (context) => {
          context.mountView((root) => {
            root.main(el => {
              el.children
                .subviews(get => get(context.state.listContainer), itemView)
                .p(el => {
                  el.config.dataAttribute("child", "-1")
                  el.children.textNode("Some text")
                })
                .h1(el => {
                  el.config.dataAttribute("child", "-2")
                  el.children.textNode("Some footer")
                })
            })
          })
        })
      ],
      observe: [
        childElementText("all the children are displayed in order", [
          "list-child-1 (0)",
          "list-child-2 (1)",
          "list-child-3 (2)",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("remove some items from the list", [
          "list-child-2"
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-2 (0)",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add items at the beginning and the end of the list", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1 (0)",
          "list-child-2 (1)",
          "list-child-6 (2)",
          "list-child-7 (3)",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add more items at the end", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1 (0)",
          "list-child-2 (1)",
          "list-child-6 (2)",
          "list-child-7 (3)",
          "list-child-8 (4)",
          "list-child-9 (5)",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("rearrange item to the end", [
          "list-child-1",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
          "list-child-2",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1 (0)",
          "list-child-6 (1)",
          "list-child-7 (2)",
          "list-child-8 (3)",
          "list-child-9 (4)",
          "list-child-2 (5)",
          "Some text",
          "Some footer"
        ])
      ]
    }),

  siblingListsExample("client rendered", (context, view) => context.mountView(view)),
  siblingListsExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  nestedListsExample("client rendered", (context, view) => context.mountView(view)),
  nestedListsExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  listOfListExample("client rendered", (context, view) => context.mountView(view)),
  listOfListExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  listOfListWithDerivedStateExample("client rendered", (context, view) => context.mountView(view)),

  nestedListSelectorExample("client rendered", (context, view) => context.mountView(view)),
  nestedListSelectorExample("server rendered", (context, view) => context.ssrAndActivate(view))

])

function nestedListsExample(name: string, renderer: (context: RenderApp<NestedListExamplesState>, view: HTMLView) => void) {
  return example(renderContext<NestedListExamplesState>())
    .description(`nested lists (${name})`)
    .script({
      suppose: [
        fact("there is stateful list data", (context) => {
          context.setState({
            mainList: container({ initialValue: ["one", "two", "three"] }),
            secondaryList: container({ initialValue: ["a", "b", "c"] })
          })
        }),
        fact("there is a view with nested lists", (context) => {
          const message = container({ initialValue: "Nothing" })
          renderer(context, (root) => {
            root.main(el => {
              el.children
                .subviews(get => get(context.state.mainList), (item, index) => {
                  return (root) => {
                    root.div(el => {
                      el.children
                        .h3(el => el.children.textNode(get => get(item)))
                        .ul(el => {
                          el.config
                            .dataAttribute("sub-list", get => `${get(index)}`)
                          el.children
                            .subviews(get => get(context.state.secondaryList), liView(message, item))
                            .subviews(get => get(context.state.secondaryList), anotherLiView(item))
                            .hr()
                            .h3(el => el.children.textNode(get => `There are ${get(context.state.secondaryList).length} subItems`))
                        })
                    })
                  }
                })
                .hr()
                .div(el => {
                  el.config.dataAttribute("message")
                  el.children.textNode(get => get(message))
                })
            })
          })
        })
      ],
      observe: [
        effect("the lists are rendered", async () => {
          const texts = await selectElements("[data-sub-list='1'] li p").map(el => el.text())
          expect(texts, is([
            "two => a", "two => b", "two => c",
            "Also two => a", "Also two => b", "Also two => c"
          ]))
        }),
        effect("the text effect after the list is rendered", async () => {
          await expect(selectElement("[data-sub-list='1'] h3").text(), resolvesTo("There are 3 subItems"))
        })
      ]
    }).andThen({
      perform: [
        step("update the nested lists", (context) => {
          context.writeTo(context.state.secondaryList, [
            "a", "c", "b", "f"
          ])
        })
      ],
      observe: [
        effect("the nested lists update", async () => {
          const texts = await selectElements("[data-sub-list='2'] li p").map(el => el.text())
          expect(texts, is([
            "three => a", "three => c", "three => b", "three => f",
            "Also three => a", "Also three => c", "Also three => b", "Also three => f"
          ]))
        }),
        effect("the text effect after the list is updated", async () => {
          await expect(selectElement("[data-sub-list='2'] h3").text(), resolvesTo("There are 4 subItems"))
        })
      ]
    }).andThen({
      perform: [
        step("click an item", async () => {
          await selectElements("[data-sub-list='1'] button").at(1).click()
        })
      ],
      observe: [
        effect("the message is updated", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo("Clicked: two, c"))
        })
      ]
    })
}

interface NestedListSelectorState {
  mainList: Container<Array<string>>
  nestedData: StateCollection<Container<Array<string>>>
}

function nestedListData(context: RenderApp<NestedListSelectorState>, id: string): Container<Array<string>> {
  return context.state.nestedData.get(id)
}

function nestedListSelectorExample(name: string, renderer: (context: RenderApp<NestedListSelectorState>, view: HTMLView) => void) {
  return example(renderContext<NestedListSelectorState>())
    .description(`nested lists selector (${name})`)
    .script({
      suppose: [
        fact("there is stateful list data", (context) => {
          context.setState({
            mainList: container({ initialValue: ["one", "two", "three"] }),
            nestedData: collection(() => container<Array<string>>({ initialValue: [] }))
          })
        }),
        fact("for each main list item there is a sub list", (context) => {
          context.writeTo(nestedListData(context, "sub-one"), ["apple", "airline", "autumn"])
          context.writeTo(nestedListData(context, "sub-two"), ["basket", "beet", "berry"])
          context.writeTo(nestedListData(context, "sub-three"), ["cat", "column", "cataract"])
        }),
        fact("there is a view with nested list and nested selector", (context) => {
          function simpleView(item: State<string>): (subItem: State<string>) => HTMLView {
            return (subItem) => root => {
              root.li(el => el.children.textNode(get => `${get(item)} => ${get(subItem)}`))
            }
          }
          renderer(context, (root) => {
            root.subviews(get => get(context.state.mainList), (item, index) => {
              return (root) => {
                root.div(el => {
                  el.children
                    .h3(el => el.children.textNode(get => get(item)))
                    .ul(el => {
                      el.config
                        .dataAttribute("sub-list", get => `${get(index)}`)
                      el.children
                        .subviews(get => get(nestedListData(context, `sub-${get(item)}`)), simpleView(item))
                    })
                })
              }
            })
          })
        })
      ],
      observe: [
        effect("the lists are rendered", async () => {
          const texts = await selectElements("li").map(el => el.text())
          expect(texts, is([
            "one => apple", "one => airline", "one => autumn",
            "two => basket", "two => beet", "two => berry",
            "three => cat", "three => column", "three => cataract"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update a sublist state", (context) => {
          context.writeTo(nestedListData(context, "sub-two"), ["funny", "fair", "fabulous", "fascinating"])
        })
      ],
      observe: [
        effect("the sublist updates as expected", async () => {
          const texts = await selectElements("li").map(el => el.text())
          expect(texts, is([
            "one => apple", "one => airline", "one => autumn",
            "two => funny", "two => fair", "two => fabulous", "two => fascinating",
            "three => cat", "three => column", "three => cataract"
          ]))
        })
      ]
    })
}

function siblingListsExample(name: string, renderer: (context: RenderApp<ListExamplesState>, view: HTMLView) => void) {
  return example(renderContext<ListExamplesState>())
    .description(`multiple lists (${name})`)
    .script({
      suppose: [
        containerWithList(["child-1", "child-2"]),
        fact("there is a view with two lists", (context) => {
          renderer(context, (root) => {
            root.main(el => {
              el.children
                .subviews(get => get(context.state.listContainer), itemView)
                .subviews(get => get(context.state.listContainer), otherItemView)
                .hr()
                .h3(el => {
                  el.children.textNode(get => `There are ${get(context.state.listContainer).length} items!`)
                })
            })
          })
        })
      ],
      observe: [
        childElementText("both lists are displayed", [
          "child-1 (0)",
          "child-2 (1)",
          "Other child-1 (0)",
          "Other child-2 (1)",
        ]),
        effect("the text effect in the message is displayed", async () => {
          await expect(selectElement("h3").text(), resolvesTo("There are 2 items!"))
        })
      ]
    }).andThen({
      perform: [
        updateState("add to the end of the list", [
          "child-1",
          "child-2",
          "child-3",
        ])
      ],
      observe: [
        childElementText("both lists are updated", [
          "child-1 (0)",
          "child-2 (1)",
          "child-3 (2)",
          "Other child-1 (0)",
          "Other child-2 (1)",
          "Other child-3 (2)",
        ]),
        effect("the text effect in the message is updated", async () => {
          await expect(selectElement("h3").text(), resolvesTo("There are 3 items!"))
        })
      ]
    })
}

function listOfListExample(name: string, renderer: (context: RenderApp<NestedListExamplesState>, view: HTMLView) => void) {
  return example(renderContext<NestedListExamplesState>())
    .description(`list as root of list item (${name})`)
    .script({
      suppose: [
        fact("there is stateful list data", (context) => {
          context.setState({
            mainList: container({ initialValue: ["one", "two", "three"] }),
            secondaryList: container({ initialValue: ["a", "b", "c"] })
          })
        }),
        fact("there is a list where each item is a list", (context) => {
          renderer(context, (root) => {
            root.subviews(get => get(context.state.mainList), (item, index) => {
              return (root) => {
                root.subviews(get => get(context.state.secondaryList), divView(item, index))
              }
            })
          })
        })
      ],
      observe: [
        effect("the lists are rendered", async () => {
          const texts = await selectElements("div[data-sub-list='1']").map(el => el.text())
          expect(texts, is([
            "two => a", "two => b", "two => c",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the nested lists", (context) => {
          context.writeTo(context.state.secondaryList, [
            "a", "c", "b", "f"
          ])
        })
      ],
      observe: [
        effect("the nested lists update", async () => {
          const texts = await selectElements("div[data-sub-list='2']").map(el => el.text())
          expect(texts, is([
            "three => a", "three => c", "three => b", "three => f",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the main list", (context) => {
          context.writeTo(context.state.mainList, [
            "one", "three", "two", "four"
          ])
        })
      ],
      observe: [
        effect("the list items are in the correct order", async () => {
          const order = await selectElements("div[data-sub-list]").map(el => el.attribute("data-sub-list"))
          expect(order.filter(s => s !== undefined), is([
            "0", "0", "0", "0",
            "1", "1", "1", "1",
            "2", "2", "2", "2",
            "3", "3", "3", "3",
          ]))
        }),
        effect("the first nested list remains the same", async () => {
          const texts = await selectElements("div[data-sub-list='0']").map(el => el.text())
          expect(texts, is([
            "one => a", "one => c", "one => b", "one => f",
          ]))
        }),
        effect("the second nested list is now the previous third", async () => {
          const texts = await selectElements("div[data-sub-list='1']").map(el => el.text())
          expect(texts, is([
            "three => a", "three => c", "three => b", "three => f",
          ]))
        }),
        effect("the third nested list is now the previous second", async () => {
          const texts = await selectElements("div[data-sub-list='2']").map(el => el.text())
          expect(texts, is([
            "two => a", "two => c", "two => b", "two => f",
          ]))
        }),
        effect("a new nested list is added", async () => {
          const texts = await selectElements("div[data-sub-list='3']").map(el => el.text())
          expect(texts, is([
            "four => a", "four => c", "four => b", "four => f",
          ]))
        })
      ]
    })
}

interface NestedListDerivedStateContext {
  updateable: Container<string>
  other: Container<string>
  mainList: Container<Array<Container<string>>>
}

function listOfListWithDerivedStateExample(name: string, renderer: (context: RenderApp<NestedListDerivedStateContext>, view: HTMLView) => void) {
  return example(renderContext<NestedListDerivedStateContext>())
    .description(`list as root of list item that defines derived state used in list (${name})`)
    .script({
      suppose: [
        fact("there is stateful list data", (context) => {
          const updateable = container({ initialValue: "one" })
          const other = container({ initialValue: "three" })
          context.setState({
            updateable,
            other,
            mainList: container({ initialValue: [
              updateable,
              container({ initialValue: "four" }),
              other,
            ]}),
          })
        }),
        fact("there is a list where each item is a list that defined derived state", (context) => {
          renderer(context, (root) => {
            root.subviews(get => get(context.state.mainList), (item) => {
              const modifiedItem = derived({ query: get => `${get(get(item)).length}` })
              return (root) => {
                root.subviews(get => [`${get(modifiedItem)}-sub-a`, `${get(modifiedItem)}-sub-b`], (subItem) => (root) => {
                  root.div(el => {
                    el.config.dataAttribute("sub-list")
                    el.children.textNode(get => `${get(subItem)}!!`)
                  })
                })
              }
            })
          })
        })
      ],
      observe: [
        effect("the lists are rendered", async () => {
          const texts = await selectElements("div[data-sub-list]").map(el => el.text())
          expect(texts, is([
            "3-sub-a!!", "3-sub-b!!",
            "4-sub-a!!", "4-sub-b!!",
            "5-sub-a!!", "5-sub-b!!",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the nested derived state", (context) => {
          context.writeTo(context.state.mainList, [
            context.state.updateable,
            container({ initialValue: "something else" }),
            context.state.other
          ])
        }),
      ],
      observe: [
        effect("the nested lists update", async () => {
          const texts = await selectElements("div[data-sub-list]").map(el => el.text())
          expect(texts, is([
            "3-sub-a!!", "3-sub-b!!",
            "14-sub-a!!", "14-sub-b!!",
            "5-sub-a!!", "5-sub-b!!",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update", (context) => {
          context.writeTo(context.state.updateable, "hello?")
        })
      ],
      observe: [
        effect("the nested lists update", async () => {
          const texts = await selectElements("div[data-sub-list]").map(el => el.text())
          expect(texts, is([
            "6-sub-a!!", "6-sub-b!!",
            "14-sub-a!!", "14-sub-b!!",
            "5-sub-a!!", "5-sub-b!!",
          ]))
        })
      ]
    })
}

interface NestedListExamplesState {
  mainList: Container<Array<string>>
  secondaryList: Container<Array<string>>
}

function divView(item: State<string>, index: State<number>): (subItem: State<string>) => HTMLView {
  return (subItem) => (root) => {
    root.div(el => {
      el.config.dataAttribute("sub-list", get => `${get(index)}`)
      el.children.textNode(get => `${get(item)} => ${get(subItem)}`)
    })
  }
}

function liView(message: Container<string>, item: State<string>): (subItem: State<string>) => HTMLView {
  return (subItem) => (root) => {
    root.li(el => {
      el.children
        .p(el => el.children.textNode(get => `${get(item)} => ${get(subItem)}`))
        .button(el => {
          el.config.on("click", () => use(get => write(message, `Clicked: ${get(item)}, ${get(subItem)}`)))
          el.children.textNode("Click!")
        })
    })
  }
}

function anotherLiView(item: State<string>): (subItem: State<string>) => HTMLView {
  return (subItem) => (root) => {
    root.li(el => {
      el.children.p(el => {
        el.children.textNode(get => `Also ${get(item)} => ${get(subItem)}`)
      })
    })
  }
}
