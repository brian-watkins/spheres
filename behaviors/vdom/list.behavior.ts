import { Collection, collection, container, Container, derived, reset, State, update, use, write } from "@store/index.js";
import { HTMLView } from "@view/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayContaining, equalTo, expect, is, objectWithProperty, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "./helpers/displayElement";
import { RenderApp, renderContext } from "./helpers/renderContext";

interface ListContext {
  items: Container<Array<string>>
  dependency?: Container<number>
}

interface BooleanListContext {
  items: Container<Array<boolean>>
}

interface ContainerListContext {
  items: Container<Array<Container<string>>>
  containerA: Container<string>
  containerB: Container<string>
  containerC: Container<string>
}

interface ListItem {
  id: string
  name: string
}

interface ListItemContext {
  items: Container<Array<ListItem>>
  values: Container<Array<string>>
}

export default behavior("list effects", [

  example(renderContext<ListContext>())
    .description("an empty list")
    .script({
      suppose: [
        fact("there is empty list state", (context) => {
          context.setState({
            items: container<Array<string>>({ initialValue: [] })
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

  example(renderContext<BooleanListContext>())
    .description("list with boolean attributes")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: [false, true, false] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          context.mountView((root) => {
            root.form(el => {
              el.children.select(el => {
                el.children.subviews(get => get(context.state.items), (item, index) => root => {
                  root.option(el => {
                    el.config
                      .disabled(false)
                      .inert(true)
                      .selected(get => get(item))
                    el.children
                      .textNode(get => `Item ${get(index) + 1}`)
                  })
                })
              })
            })
          })
        })
      ],
      observe: [
        effect("the false static boolean attributes are not rendered", async () => {
          await expect(selectElements("[disabled]").count(), resolvesTo(0))
        }),
        effect("the true static boolean attributes are rendered", async () => {
          await expect(selectElements("[inert]").count(), resolvesTo(3))
        }),
        effect("the reactive boolean attribute is rendered when true", async () => {
          await expect(selectElements("[selected]").texts(), resolvesTo([
            "Item 2"
          ]))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("list with aria attributes")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["cat", "elephant"] })
          })
        }),
        fact("a list is displayed", (context) => {
          function itemView(item: State<string>): HTMLView {
            return root => {
              root.div(el => {
                el.config
                  .aria("label", get => get(item))
                  .aria("disabled", "false")
                el.children.textNode(get => `Hello: ${get(item)}`)
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the aria attributes are displayed", async () => {
          await expect(selectElements("DIV").map(el => el.attribute("aria-label")), resolvesTo([
            "cat", "elephant"
          ]))
          await expect(selectElements("DIV").map(el => el.attribute("aria-disabled")), resolvesTo([
            "false", "false"
          ]))
        })
      ]
    }),

  example(renderContext<ListItemContext>())
    .description("list data update")
    .script({
      suppose: [
        fact("there is state with an id defined", (context) => {
          context.setState({
            items: container({
              initialValue: [
                { id: "1", name: "Awesome" },
                { id: "2", name: "Fun" },
                { id: "3", name: "Cool" },
              ]
            }),
            values: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("a list is displayed with the data", (context) => {
          function itemView(item: State<ListItem>): HTMLView {
            return root => {
              root.li(el => {
                el.children.textNode(get => get(item).name)
              })
            }
          }

          function valueView(item: State<string>): HTMLView {
            return root => {
              root.li(el => {
                el.children.textNode(get => get(item))
              })
            }
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .ul(el => {
                  el.config.dataAttribute("list-type", "items")
                  el.children.subviews(get => get(context.state.items), itemView)
                })
                .hr()
                .ul(el => {
                  el.config.dataAttribute("list-type", "values")
                  el.children.subviews(get => get(context.state.values), valueView)
                })
            })
          })
        }),
      ],
      observe: [
        effect("the items are displayed", async () => {
          await expect(selectElements("LI").texts(), resolvesTo([
            "Awesome", "Fun", "Cool", "one", "two", "three"
          ]))
        })
      ]
    }).andThen({
      suppose: [
        fact("observe changes on items", (context) => {
          context.observe("UL[data-list-type='items']")
        }),
      ],
      perform: [
        step("update the data without changing the id", (context) => {
          context.writeTo(context.state.items, [
            { id: "1", name: "Awesome" },
            { id: "2", name: "Amazing!" },
            { id: "3", name: "Cool" },
          ])
        })
      ],
      observe: [
        effect("the item is updated", async () => {
          await expect(selectElements("UL[data-list-type='items'] LI").texts(), resolvesTo([
            "Awesome", "Amazing!", "Cool"
          ]))
        }),
        effect("the rows are not replaced, only updated", context => {
          expect(context.changeRecords, is(arrayContaining(
            objectWithProperty("type", equalTo("structure")), { times: 0 }
          )))
        })
      ]
    }).andThen({
      suppose: [
        fact("observe changes on values", (context) => {
          context.observe("UL[data-list-type='values']")
        }),
      ],
      perform: [
        step("update the values", (context) => {
          context.writeTo(context.state.values, [
            "one", "six", "three"
          ])
        })
      ],
      observe: [
        effect("the values are updated", async () => {
          await expect(selectElements("UL[data-list-type='values'] LI").texts(), resolvesTo([
            "one", "six", "three"
          ]))
        }),
        effect("the row is replaced", (context) => {
          expect(context.changeRecords, is(arrayContaining(
            objectWithProperty("type", equalTo("structure")), { times: 1 }
          )))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("list with sibling inner html")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["cat", "elephant"] })
          })
        }),
        fact("a list is displayed", (context) => {
          function itemView(item: State<string>): HTMLView {
            return root => {
              root.section(el => {
                el.children
                  .h3(el => el.config.innerHTML("<b>Fun Stuff!</b>"))
                  .div(el => {
                    el.config
                      .innerHTML(get => `<p>${get(item)}</p>`)
                  })
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the inner html is displayed", async () => {
          await expect(selectElements("SECTION H3 B").texts(), resolvesTo([
            "Fun Stuff!", "Fun Stuff!"
          ]))
          await expect(selectElements("SECTION DIV P").texts(), resolvesTo([
            "cat", "elephant"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the state", context => {
          context.writeTo(context.state.items, ["awesome", "cool", "fun"])
        })
      ],
      observe: [
        effect("the inner html updates", async () => {
          await expect(selectElements("SECTION DIV P").texts(), resolvesTo([
            "awesome", "cool", "fun"
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
          await expect(selectElement("li").property("className"), resolvesTo("style-cat"))
        }),
        effect("static properties are also rendered", async () => {
          await expect(selectElement("span").property("className"), resolvesTo("special-text"))
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
          await expect(selectElement("li").property("className"), resolvesTo("style-dog"))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("list with subviews")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: ["cat", "mouse"] })
          })
        }),
        fact("a list is displayed based on the state", (context) => {
          function decorativeText(text: State<string>): HTMLView {
            return root => {
              root.b(el => {
                el.children.textNode(get => get(text))
              })
            }
          }

          function itemView(item: State<string>): HTMLView {
            return root => {
              root.li(li => {
                li.children.subview(decorativeText(item))
              })
            }
          }

          context.mountView((root) => {
            root.ul(el => {
              el.children.subviews(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("the subviews are rendered", async () => {
          await expect(selectElements("b").texts(), resolvesTo([
            "cat", "mouse"
          ]))
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

  example(renderContext<ContainerListContext>())
    .description("list item view that defines derived state used in event")
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
          function itemView(item: State<Container<string>>, index: State<number>): HTMLView {
            const length = derived({ name: "derived-fun", query: (get) => get(get(item)).length })
            const innerContainer = container({ name: "fun-stuff", initialValue: 0 })

            return root => {
              root.div(el => {
                el.config
                  .dataAttribute("el", get => `${get(index)}`)
                el.children
                  .div(el => {
                    el.config.dataAttribute("revealed-value")
                    el.children.textNode(get => `Revealed: ${get(innerContainer)}`)
                  })
                  .button(el => {
                    el.config
                      .on("click", () => use(get => write(innerContainer, get(length))))
                    el.children.textNode("Click me")
                  })
              })
            }
          }

          context.mountView(root => {
            root.subviews(get => get(context.state.items), itemView)
          })
        })
      ],
      observe: [
        effect("the initial value is displayed", async () => {
          await expect(selectElements("[data-revealed-value]").texts(), resolvesTo([
            "Revealed: 0",
            "Revealed: 0",
            "Revealed: 0"
          ]))
        }),
      ]
    }).andThen({
      perform: [
        step("trigger an event", async () => {
          await selectElement("[data-el='1'] button").click()
        })
      ],
      observe: [
        effect("the event is processed with the correct derived state", async () => {
          await expect(selectElements("[data-revealed-value]").texts(), resolvesTo([
            "Revealed: 0",
            "Revealed: 4",
            "Revealed: 0"
          ]))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("list items with buttons that reference external container")
    .script({
      suppose: [
        fact("there is a list of strings and an external counter container", (context) => {
          context.setState({
            items: container({ initialValue: ["apple", "banana", "pear"] }),
            dependency: container({ initialValue: 0 })
          })
        }),
        fact("there is a view with a counter and list where items have increment and reset buttons", (context) => {
          const externalDerivation = derived(get => `[${get(context.state.dependency!)}]`)

          function itemView(item: State<string>): HTMLView {
            return root => {
              root.li(el => {
                el.config.dataAttribute("item")
                el.children
                  .div(el => {
                    el.config.dataAttribute("title")
                    el.children.textNode(get => `${get(item)} (${get(context.state.dependency!)}) ${get(externalDerivation)}`)
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("increment-btn")
                      .on("click", () => update(context.state.dependency!, (val) => val + 1))
                    el.children.textNode("Increment")
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("reset-btn")
                      .on("click", () => reset(context.state.dependency!))
                    el.children.textNode("Reset")
                  })
              })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .h1(el => {
                  el.config.dataAttribute("counter")
                  el.children.textNode(get => `Count: ${get(context.state.dependency!)}`)
                })
                .ul(el => {
                  el.children.subviews(get => get(context.state.items), itemView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the view is rendered with count at 0", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo("Count: 0"))
        }),
        effect("the list items are rendered", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "apple (0) [0]",
            "banana (0) [0]",
            "pear (0) [0]"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click increment on items", async () => {
          await selectElements("[data-item] [data-increment-btn]").at(0).click()
          await selectElements("[data-item] [data-increment-btn]").at(1).click()
          await selectElements("[data-item] [data-increment-btn]").at(1).click()
        })
      ],
      observe: [
        effect("the main count increases", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo("Count: 3"))
        }),
        effect("the list items are updated", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "apple (3) [3]",
            "banana (3) [3]",
            "pear (3) [3]"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click reset on third item", async () => {
          await selectElements("[data-item] [data-reset-btn]").at(2).click()
        })
      ],
      observe: [
        effect("the main count resets to 0", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo("Count: 0"))
        }),
        effect("the list items are reset", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "apple (0) [0]",
            "banana (0) [0]",
            "pear (0) [0]"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click increment on first item again", async () => {
          await selectElements("[data-item] [data-increment-btn]").at(0).click()
        })
      ],
      observe: [
        effect("the main count increases from 0 to 1", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo("Count: 1"))
        }),
        effect("the list items are updated", async () => {
          await expect(selectElements("[data-title]").texts(), resolvesTo([
            "apple (1) [1]",
            "banana (1) [1]",
            "pear (1) [1]"
          ]))
        })
      ]
    }),

  listOfSwitchExample("client rendered", (context, view) => context.mountView(view)),
  listOfSwitchExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  listOfSwitchWithDerivedStateExample("client rendered", (context, view) => context.mountView(view)),
  listOfSwitchWithDerivedStateExample("server rendered", (context, view) => context.ssrAndActivate(view))

])

interface ToggleableListContext {
  toggle: Collection<string, boolean>
  items: Container<Array<string>>
  dependency?: Container<number>
}

function listOfSwitchExample(name: string, renderer: (context: RenderApp<ListContext>, view: HTMLView) => void) {
  return example(renderContext<ToggleableListContext>())
    .description(`list with conditional views at root (${name})`)
    .script({
      suppose: [
        fact("there is a list of strings", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] }),
            toggle: collection({ initialValues: () => true })
          })
        }),
        fact("there is a view with a list where items are conditional views", (context) => {
          function itemView(item: State<string>, index: State<number>): HTMLView {
            return root => {
              root.subviewFrom(select => select.withConditions()
                .when(get => get(context.state.toggle.at(get(item))), root => {
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
  return example(renderContext<ToggleableListContext>())
    .description(`list item view with derived state used in conditional view (${name})`)
    .script({
      suppose: [
        fact("there is a list of strings", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] }),
            toggle: collection({ initialValues: () => true })
          })
        }),
        fact("there is a view with a list where items define derived state used in a conditional view", (context) => {
          function itemView(item: State<string>, index: State<number>): HTMLView {
            const reverseItemToggle = derived({
              query: get => !get(context.state.toggle.at(`${get(index)}`))
            })

            return root => {
              root.subviewFrom(select => select.withConditions()
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
          context.store.dispatch(write(context.state.toggle.at("0"), false))
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
