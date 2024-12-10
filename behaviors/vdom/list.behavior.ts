import { container, Container, derived, State } from "@spheres/store";
import { HTMLView } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement";
import { RenderApp, renderContext } from "helpers/renderContext";

interface ListContext {
  items: Container<Array<string>>
  dependency?: Container<number>
}

interface ContainerListContext {
  items: Container<Array<Container<string>>>
  containerA: Container<string>
  containerB: Container<string>
  containerC: Container<string>
}

export default behavior("list effects", [

  example(renderContext<ListContext>())
    .description("an empty list")
    .script({
      suppose: [
        fact("there is empty list state", (context) => {
          context.setState({
            items: container({ initialValue: [] })
          })
        }),
        fact("a list of elements is displayed based on the state", (context) => {
          function itemView(item: State<string>): HTMLView {
            return root => {
              root.p(el => {
                el.config.dataAttribute("item")
                el.children.textNode(get => get(item))
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
        effect("nothing is rendered", async () => {
          await expect(selectElements("p[data-item]").count(), resolvesTo(0))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("some list with text nodes for the view")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["1", "2", "3"] })
          })
        }),
        fact("a list of text nodes is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.div(el => {
              el.children.subviews(get => get(context.state.items), (item) => {
                return root => root.textNode(get => get(item))
              })
            })
          })
        })
      ],
      observe: [
        effect("the text nodes are rendered", async () => {
          const text = await selectElement("div").text()
          expect(text, is("123"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.items, ["1", "2", "A", "B"])
        })
      ],
      observe: [
        effect("the text nodes are updated", async () => {
          const text = await selectElement("div").text()
          expect(text, is("12AB"))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("simple list with text")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["1", "2", "3"] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.ul(el => {
              el.children.subviews(get => get(context.state.items), liView)
            })
          })
        })
      ],
      observe: [
        effect("the view is rendered", async () => {
          const text = await selectElements("li").map(el => el.text())
          expect(text, is([
            "Item 1",
            "Item 2",
            "Item 3"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.items, ["1", "2", "A", "B"])
        })
      ],
      observe: [
        effect("the view is rendered", async () => {
          const text = await selectElements("li").map(el => el.text())
          expect(text, is([
            "Item 1",
            "Item 2",
            "Item A",
            "Item B",
          ]))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("simple list with properties")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["cat"] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.ul(el => {
              el.children.subviews(get => get(context.state.items), liStyledView)
            })
          })
        })
      ],
      observe: [
        effect("the view is rendered with the stateful property", async () => {
          const className = await selectElement("li").property("className")
          expect(className, is("style-cat"))
        }),
        effect("static properties are also rendered", async () => {
          const className = await selectElement("span").property("className")
          expect(className, is("special-text"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.items, ["dog"])
        })
      ],
      observe: [
        effect("the view is rendered with the correct property", async () => {
          const className = await selectElement("li").property("className")
          expect(className, is("style-dog"))
        })
      ]
    }),

  example(renderContext<ContainerListContext>())
    .description("list item view that defines derived state used in reactive attribute")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          const containerA = container({ name: "a", initialValue: "one" })
          const containerB = container({ name: "orig-b", initialValue: "four" })
          const containerC = container({ name: "c", initialValue: "seven" })

          context.setState({
            items: container({
              initialValue: [
                containerA,
                containerB,
                containerC,
              ]
            }),
            containerA,
            containerB,
            containerC,
          })
        }),
        fact("there is a list view that uses derived state based on the list item", (context) => {
          function itemView(item: State<Container<string>>): HTMLView {
            const length = derived({ query: (get) => get(get(item)).length })

            return root => {
              root.h1(el => {
                el.config.dataAttribute("length", get => `${get(length)}`)
                el.children.textNode("YO YO YO!")
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the data attribute is updated for each view based on the derived state", async () => {
          await expect(selectElements("H1").map(el => el.attribute("data-length")), resolvesTo([
            "3",
            "4",
            "5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("update the items", (context) => {
          context.writeTo(context.state.items, [
            context.state.containerA,
            container({ name: "b", initialValue: "aa" }),
            context.state.containerC
          ])
        })
      ],
      observe: [
        effect("only the data attribute for the changed list view updates", async () => {
          await expect(selectElements("H1").map(el => el.attribute("data-length")), resolvesTo([
            "3",
            "2",
            "5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fourteen")
        })
      ],
      observe: [
        effect("the list item view attribute updates", async () => {
          await expect(selectElements("H1").map(el => el.attribute("data-length")), resolvesTo([
            "8",
            "2",
            "5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fifteen")
        })
      ],
      observe: [
        effect("the list item view attribute updates", async () => {
          await expect(selectElements("H1").map(el => el.attribute("data-length")), resolvesTo([
            "7",
            "2",
            "5"
          ]))
        }),
      ]
    }),

  example(renderContext<ContainerListContext>())
    .description("list item view that defines derived state used in reactive text")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          const containerA = container({ name: "a", initialValue: "one" })
          const containerB = container({ name: "orig-b", initialValue: "four" })
          const containerC = container({ name: "c", initialValue: "seven" })

          context.setState({
            items: container({
              initialValue: [
                containerA,
                containerB,
                containerC,
              ]
            }),
            containerA,
            containerB,
            containerC,
          })
        }),
        fact("there is a list view that uses derived state based on the list item", (context) => {
          function itemView(item: State<Container<string>>): HTMLView {
            const length = derived({ query: (get) => get(get(item)).length })

            return root => {
              root.h1(el => {
                el.children.textNode(get => `You have ${get(length)} letters`)
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the list view renders each derived state", async () => {
          await expect(selectElements("H1").texts(), resolvesTo([
            "You have 3 letters",
            "You have 4 letters",
            "You have 5 letters",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the items", (context) => {
          context.writeTo(context.state.items, [
            context.state.containerA,
            container({ name: "b", initialValue: "aa" }),
            context.state.containerC
          ])
        })
      ],
      observe: [
        effect("only the changed list view updates", async () => {
          await expect(selectElements("H1").texts(), resolvesTo([
            "You have 3 letters",
            "You have 2 letters",
            "You have 5 letters",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fourteen")
        })
      ],
      observe: [
        effect("the list items update", async () => {
          await expect(selectElements("H1").texts(), resolvesTo([
            "You have 8 letters",
            "You have 2 letters",
            "You have 5 letters",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fifteen")
        })
      ],
      observe: [
        effect("the list items update", async () => {
          await expect(selectElements("H1").texts(), resolvesTo([
            "You have 7 letters",
            "You have 2 letters",
            "You have 5 letters",
          ]))
        })
      ]
    }),

  example(renderContext<ContainerListContext>())
    .description("list item view that defines derived state used in reactive property")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          const containerA = container({ name: "a", initialValue: "one" })
          const containerB = container({ name: "orig-b", initialValue: "four" })
          const containerC = container({ name: "c", initialValue: "seven" })

          context.setState({
            items: container({
              initialValue: [
                containerA,
                containerB,
                containerC,
              ]
            }),
            containerA,
            containerB,
            containerC,
          })
        }),
        fact("there is a list view that uses derived state based on the list item", (context) => {
          function itemView(item: State<Container<string>>): HTMLView {
            const length = derived({ query: (get) => get(get(item)).length })

            return root => {
              root.h1(el => {
                el.config.class(get => `length-${get(length)}`)
                el.children.textNode("YO YO YO!")
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the property is updated for each view based on the derived state", async () => {
          await expect(selectElements("H1").map(el => el.property("className")), resolvesTo([
            "length-3",
            "length-4",
            "length-5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("update the items", (context) => {
          context.writeTo(context.state.items, [
            context.state.containerA,
            container({ name: "b", initialValue: "aa" }),
            context.state.containerC
          ])
        })
      ],
      observe: [
        effect("the property is updated for each view based on the derived state", async () => {
          await expect(selectElements("H1").map(el => el.property("className")), resolvesTo([
            "length-3",
            "length-2",
            "length-5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fourteen")
        })
      ],
      observe: [
        effect("the property is updated for each view based on the derived state", async () => {
          await expect(selectElements("H1").map(el => el.property("className")), resolvesTo([
            "length-8",
            "length-2",
            "length-5"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("the dependent state updates", (context) => {
          context.writeTo(context.state.containerA, "fifteen")
        })
      ],
      observe: [
        effect("the property is updated for each view based on the derived state", async () => {
          await expect(selectElements("H1").map(el => el.property("className")), resolvesTo([
            "length-7",
            "length-2",
            "length-5"
          ]))
        }),
      ]
    }),

  listOfSwitchExample("client rendered", (context, view) => context.mountView(view)),
  listOfSwitchExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  listOfSwitchWithDerivedStateExample("client rendered", (context, view) => context.mountView(view)),

])

function itemToggle(id: number): Container<boolean> {
  return container({ initialValue: true, id: `toggle-${id}` })
}

function listOfSwitchExample(name: string, renderer: (context: RenderApp<ListContext>, view: HTMLView) => void) {
  return example(renderContext<ListContext>())
    .description(`list with conditional views at root (${name})`)
    .script({
      suppose: [
        fact("there is a list of strings", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("there is a view with a list where items are conditional views", (context) => {
          function itemView(item: State<string>, index: State<number>): HTMLView {
            return root => {
              root.subviewOf(select => select
                .when(get => get(itemToggle(get(index))), root => {
                  root.div(el => {
                    el.children
                      .h4(el => {
                        el.children.textNode(get => `${get(item)} (${get(index)})`)
                      })
                  })
                })
              )
            }
          }

          renderer(context, root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("it renders the list", async () => {
          await expect(selectElements("h4").map(el => el.text()), resolvesTo([
            "one (0)",
            "two (1)",
            "three (2)",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("items are removed from the end", (context) => {
          context.writeTo(context.state.items, ["one"])
        })
      ],
      observe: [
        effect("it renders the updated list", async () => {
          await expect(selectElements("h4").map(el => el.text()), resolvesTo([
            "one (0)"
          ]))
        })
      ]
    })
}

function listOfSwitchWithDerivedStateExample(name: string, renderer: (context: RenderApp<ListContext>, view: HTMLView) => void) {
  return example(renderContext<ListContext>())
    .description(`list item view with derived state used in conditional view (${name})`)
    .script({
      suppose: [
        fact("there is a list of strings", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("there is a view with a list where items define derived state used in a conditional view", (context) => {
          function itemView(item: State<string>, index: State<number>): HTMLView {
            const reverseItemToggle = derived({ query: get => !get(itemToggle(get(index))) })

            return root => {
              root.subviewOf(select => select
                .when(get => !get(reverseItemToggle), root => {
                  root.div(el => {
                    el.children
                      .h4(el => {
                        el.children.textNode(get => `${get(item)} (${get(index)})`)
                      })
                  })
                })
              )
            }
          }

          renderer(context, root => {
            root.main(el => {
              el.children.subviews(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("it renders the list", async () => {
          await expect(selectElements("h4").map(el => el.text()), resolvesTo([
            "one (0)",
            "two (1)",
            "three (2)",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the derived state is updated for an item", (context) => {
          context.writeTo(itemToggle(0), false)
        })
      ],
      observe: [
        effect("it renders the updated list", async () => {
          await expect(selectElements("h4").map(el => el.text()), resolvesTo([
            "two (1)",
            "three (2)",
          ]))
        })
      ]
    })
}

function liView(item: State<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children
        .textNode("Item ")
        .textNode(get => get(item))
    })
  }
}

function liStyledView(item: State<string>): HTMLView {
  return (root) => {
    root.li(el => {
      el.config
        .class(get => `style-${get(item)}`)

      el.children.span(el => {
        el.config.class("special-text")
        el.children.textNode("Some item")
      })
    })
  }
}
