import { container, Container, derived, State, update, use } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { HTMLView } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement";
import { RenderApp, renderContext } from "helpers/renderContext";

export default behavior("conditional zone", [

  basicSelectEmptyAtFirst("client rendered", (context, view) => context.mountView(view)),
  basicSelectEmptyAtFirst("server rendered", (context, view) => context.ssrAndActivate(view)),

  example(renderContext<Container<number>>())
    .description("when no subview is matched")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view selector", (context) => {
          function evenView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode(get => `Counter is even: ${get(context.state)}`)
            })
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subviewOf(select => select
                  .when(get => get(context.state) % 2 === 0, evenView)
                )
            })
          })
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 0"))
        })
      ]
    }).andThen({
      perform: [
        step("update the state so that no view is selected", (context) => {
          context.writeTo(context.state, 3)
        })
      ],
      observe: [
        effect("the view updates to show nothing", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("update the state so that a view is selected", (context) => {
          context.writeTo(context.state, 8)
        })
      ],
      observe: [
        effect("the selected view is rendered with the latest state", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 8"))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("when multiple views match")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view selector", (context) => {
          function evenView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode(get => `Counter is even: ${get(context.state)}`)
            })
          }

          function defaultView(root: HTMLBuilder) {
            root.p(el => el.children.textNode("Just show something by default"))
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subviewOf(select => select
                  .when(get => get(context.state) % 2 === 0, evenView)
                  .when(() => true, defaultView)
                )
            })
          })
        })
      ],
      observe: [
        effect("the first matching view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 0"))
        })
      ]
    }).andThen({
      perform: [
        step("update the state so that the first view no longer matches", (context) => {
          context.writeTo(context.state, 3)
        })
      ],
      observe: [
        effect("the view updates to show the next matching view", async () => {
          await expect(selectElement("p").text(), resolvesTo("Just show something by default"))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("when a default view is specified")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view selector", (context) => {
          function evenView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode(get => `Counter is even: ${get(context.state)}`)
            })
          }

          function defaultView(root: HTMLBuilder) {
            root.p(el => el.children.textNode("Just show something by default"))
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subviewOf(select => select
                  .when(get => get(context.state) % 2 === 0, evenView)
                  .default(defaultView)
                )
            })
          })
        })
      ],
      observe: [
        effect("the first matching view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 0"))
        })
      ]
    }).andThen({
      perform: [
        step("update the state so that the first view no longer matches", (context) => {
          context.writeTo(context.state, 3)
        })
      ],
      observe: [
        effect("the default view is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("Just show something by default"))
        })
      ]
    }),

  example(renderContext<Container<boolean>>())
    .description("multiple conditional views with events")
    .script({
      suppose: [
        fact("there is some boolean state", (context) => {
          context.setState(container({ initialValue: false }))
        }),
        fact("there are multiple conditional views with events", (context) => {
          const aCounter = container({ initialValue: 0 })
          const bCounter = container({ initialValue: 0 })

          function counterView(counter: Container<number>): HTMLView {
            return root => root.div(el => {
              el.children
                .p(el => el.children.textNode(get => `Total: ${get(counter)}`))
                .button(el => {
                  el.config
                    .on("click", () => update(counter, (val) => val + 1))
                  el.children.textNode("Click me!")
                })
            })
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewOf(select => select.when(get => get(context.state), counterView(aCounter)))
                .subviewOf(select => select.when(get => get(context.state), counterView(bCounter)))
            })
          })
        })
      ],
      perform: [
        step("toggle the view", (context) => {
          context.writeTo(context.state, true)
        }),
        step("click the first button", async () => {
          await selectElements("button").at(0).click()
          await selectElements("button").at(0).click()
        }),
        step("click the second button", async () => {
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
        })
      ],
      observe: [
        effect("the events work as expected", async () => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo([
            "Total: 2",
            "Total: 3",
          ]))
        })
      ]
    }),

  nestedSiblingSelectViewExample("client rendered", (context, view) => context.mountView(view)),
  nestedSiblingSelectViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  siblingSelectViewExample("client rendered", (context, view) => context.mountView(view)),
  siblingSelectViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  multipleSelectFragmentsExample("client rendered", (context, view) => context.mountView(view)),
  multipleSelectFragmentsExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  nestedSelectorExample("client rendered", (context, view) => context.mountView(view)),
  nestedSelectorExample("server rendered", (context, view) => context.ssrAndActivate(view))

])

function basicSelectEmptyAtFirst(name: string, renderer: (context: RenderApp<Container<boolean>>, view: HTMLView) => void) {
  return example(renderContext<Container<boolean>>())
    .description(`start hidden, then show (${name})`)
    .script({
      suppose: [
        fact("there is boolean state", (context) => {
          context.setState(container({ initialValue: false }))
        }),
        fact("there is a view that is conditional", (context) => {
          function conditionalView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode("I am visible now!")
            })
          }

          renderer(context, root => {
            root.div(el => {
              el.children
                .subviewOf(select => select.when(get => get(context.state), conditionalView))
            })
          })
        })
      ],
      observe: [
        effect("the view is not visible", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("the state changes to show the view", (context) => {
          context.writeTo(context.state, true)
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("I am visible now!"))
        })
      ]
    }).andThen({
      perform: [
        step("the state changes to hide the view", (context) => {
          context.writeTo(context.state, false)
        })
      ],
      observe: [
        effect("the view is no longer visible", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    })
}

interface MultipleSelectFragmentContext {
  items: Container<Array<string>>
}

function multipleSelectFragmentsExample(name: string, renderer: (context: RenderApp<MultipleSelectFragmentContext>, view: HTMLView) => void) {
  return example(renderContext<MultipleSelectFragmentContext>())
    .description(`multiple select views with fragments (${name})`)
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("there is a view with multiple selects that contain fragments", (context) => {
          const toggle = container({ initialValue: true })

          function fragmentView(name: string): HTMLView {
            return root =>
              root.zones(get => get(context.state.items), item => root => {
                root.div(el => {
                  el.config.dataAttribute("item-text")
                  el.children.textNode(get => `${name} => ${get(item)}`)
                })
              })
          }

          renderer(context, root => {
            root.main(el => {
              el.children.subviewOf(select => select.default(root => {
                root.div(el => {
                  el.children
                    .subviewOf(select => select.when(get => get(toggle), fragmentView("A")))
                    .subviewOf(select => select.when(get => get(toggle), fragmentView("B")))
                    .hr()
                    .h3(el => {
                      el.children.textNode(get => `Views are visible: ${get(toggle)}`)
                    })
                    .button(el => {
                      el.config.on("click", () => update(toggle, val => !val))
                      el.children.textNode("Toggle Views!")
                    })
                  })
                })
              )
            })
          })
        })
      ],
      observe: [
        effect("the select fragments are rendered", async () => {
          const texts = await selectElements("[data-item-text]").map(el => el.text())
          expect(texts, is([
            "A => one",
            "A => two",
            "A => three",
            "B => one",
            "B => two",
            "B => three"
          ]))
        }),
        effect("text effect works", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Views are visible: true"))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the views", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the views are no longer visible", async () => {
          await expect(selectElements("[data-item-text]").count(), resolvesTo(0))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the views", async () => {
          await selectElement("button").click()
        }),
        step("update the list state", (context) => {
          context.writeTo(context.state.items, ["four", "three", "two", "one"])
        })
      ],
      observe: [
        effect("the select fragments are updated", async () => {
          const texts = await selectElements("[data-item-text]").map(el => el.text())
          expect(texts, is([
            "A => four",
            "A => three",
            "A => two",
            "A => one",
            "B => four",
            "B => three",
            "B => two",
            "B => one"
          ]))
        }),
      ]
    })
}

function nestedSiblingSelectViewExample(name: string, renderer: (context: RenderApp<NestedSelectViewContext>, view: HTMLView) => void) {
  return example(renderContext<NestedSelectViewContext>())
    .description(`multiple select views inside a list item (${name})`)
    .script({
      suppose: [
        fact("there is some state for a list", (context) => {
          context.setState({
            listItems: container({ initialValue: ["a", "b", "c"] })
          })
        }),
        fact("there are multiple conditional views with events in each list item", (context) => {
          function itemCounter(id: string): Container<number> {
            return container({ initialValue: 0, id: `counter-${id}` })
          }

          function counterView(name: string, index: State<number>): HTMLView {
            return root => root.div(el => {
              el.children
                .p(el => {
                  el.config
                    .class(get => `counter-style-${name}-${get(index)}-${get(itemCounter(`${name}-${get(index)}`))}`)
                    .dataAttribute("counter-text", get => `${name}-${get(index)}`)
                  el.children
                    .textNode(get => `${name} total: ${get(itemCounter(`${name}-${get(index)}`))}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("counter-button", get => `${name}-${get(index)}`)
                    .on("click", () => use(get => update(itemCounter(`${name}-${get(index)}`), (val) => val + 1)))
                  el.children.textNode("Click me!")
                })
            })
          }

          function basicView(name: string, index: State<number>): HTMLView {
            return root =>
              root.h3(el => {
                el.config.dataAttribute("hidden-view", get => `${name}-${get(index)}`)
                el.children.textNode(`Just wait and see! (${name})`)
              })
          }

          function itemView(item: State<string>, index: State<number>): HTMLView {
            return (root) => {
              root.div(el => {
                el.children
                  .h1(el => el.children.textNode(get => get(item)))
                  .subviewOf(select => select
                    .when(get => get(itemToggle(`first-${get(index)}`)), counterView("first", index))
                    .default(basicView("first", index))
                  )
                  .subviewOf(select => select
                    .when(get => get(itemToggle(`second-${get(index)}`)), counterView("second", index))
                    .default(basicView("second", index))
                  )
                  .hr()
              })
            }
          }

          renderer(context, root => {
            root.main(el => {
              el.children
                .zones((get) => get(context.state.listItems), itemView)
            })
          })
        })
      ],
      perform: [
        step("update two counters in the same list item", async () => {
          await selectElement("[data-counter-button='first-1']").click()
          await selectElement("[data-counter-button='first-1']").click()
          await selectElement("[data-counter-button='second-1']").click()
          await selectElement("[data-counter-button='second-1']").click()
          await selectElement("[data-counter-button='second-1']").click()
        })
      ],
      observe: [
        effect("the counters both updated", async () => {
          await expect(selectElement("[data-counter-text='first-1']").text(),
            resolvesTo("first total: 2"))
          await expect(selectElement("[data-counter-text='second-1']").text(),
            resolvesTo("second total: 3"))
        }),
        effect("the class property updated", async () => {
          await expect(selectElement("[data-counter-text='first-1']").property("className"),
            resolvesTo("counter-style-first-1-2"))
        })
      ]
    }).andThen({
      perform: [
        step("toggle one of the views", (context) => {
          context.writeTo(itemToggle("second-1"), false)
        })
      ],
      observe: [
        effect("the other select view in the list item remains visible", async () => {
          await expect(selectElement("[data-counter-text='first-1']").text(),
            resolvesTo("first total: 2"))
        }),
        effect("the hidden view is shown", async () => {
          await expect(selectElement("[data-hidden-view='second-1']").exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view again", (context) => {
          context.writeTo(itemToggle("second-1"), true)
        }),
        step("update the counter", async () => {
          await selectElement("[data-counter-button='second-1']").click()
          await selectElement("[data-counter-button='second-1']").click()
        })
      ],
      observe: [
        effect("the counters are both visible with the correct state", async () => {
          await expect(selectElement("[data-counter-text='first-1']").text(),
            resolvesTo("first total: 2"))
          await expect(selectElement("[data-counter-text='second-1']").text(),
            resolvesTo("second total: 5"))
        }),
        effect("the clicked counter updates as expected", async () => {
          await expect(selectElement("[data-counter-text='second-1']").property("className"),
            resolvesTo("counter-style-second-1-5"))
        })
      ]
    })
}

function siblingSelectViewExample(name: string, renderer: (context: RenderApp<NestedSelectViewContext>, view: HTMLView) => void) {
  return example(renderContext<NestedSelectViewContext>())
    .description(`multiple select views as siblings (${name})`)
    .script({
      suppose: [
        fact("there are sibling conditional views", (context) => {
          function itemCounter(id: string): Container<number> {
            return container({ initialValue: 0, id: `counter-${id}` })
          }

          function counterView(name: string): HTMLView {
            return root => root.div(el => {
              el.children
                .p(el => {
                  el.config
                    .dataAttribute("counter-text", name)
                  el.children
                    .textNode(get => `${name} total: ${get(itemCounter(name))}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("counter-button", name)
                    .on("click", () => update(itemCounter(name), (val) => val + 1))
                  el.children.textNode("Click me!")
                })
            })
          }

          function basicView(name: string): HTMLView {
            return root =>
              root.h3(el => {
                el.config.dataAttribute("hidden-view", name)
                el.children.textNode(`Just wait and see! (${name})`)
              })
          }

          renderer(context, (root) => {
            root.div(el => {
              el.children
                .h1(el => el.children.textNode("Hello!"))
                .subviewOf(select => select
                  .when(get => get(itemToggle("first")), counterView("first"))
                  .default(basicView("first"))
                )
                .subviewOf(select => select
                  .when(get => get(itemToggle("second")), counterView("second"))
                  .default(basicView("second"))
                )
                .hr()
            })
          })
        })
      ],
      perform: [
        step("update each conditional view", async () => {
          await selectElement("[data-counter-button='first']").click()
          await selectElement("[data-counter-button='first']").click()
          await selectElement("[data-counter-button='second']").click()
          await selectElement("[data-counter-button='second']").click()
          await selectElement("[data-counter-button='second']").click()
        })
      ],
      observe: [
        effect("the counters both updated", async () => {
          await expect(selectElement("[data-counter-text='first']").text(),
            resolvesTo("first total: 2"))
          await expect(selectElement("[data-counter-text='second']").text(),
            resolvesTo("second total: 3"))
        })
      ]
    }).andThen({
      perform: [
        step("toggle one of the views", (context) => {
          context.writeTo(itemToggle("second"), false)
        })
      ],
      observe: [
        effect("the other conditional view in the list item remains visible", async () => {
          await expect(selectElement("[data-counter-text='first']").text(),
            resolvesTo("first total: 2"))
        }),
        effect("the hidden view is shown", async () => {
          await expect(selectElement("[data-hidden-view='second']").exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view again", (context) => {
          context.writeTo(itemToggle("second"), true)
        }),
        step("update the counter", async () => {
          await selectElement("[data-counter-button='second']").click()
          await selectElement("[data-counter-button='second']").click()
        })
      ],
      observe: [
        effect("the counters are both visible with the correct state", async () => {
          await expect(selectElement("[data-counter-text='first']").text(),
            resolvesTo("first total: 2"))
          await expect(selectElement("[data-counter-text='second']").text(),
            resolvesTo("second total: 5"))
        })
      ]
    })
}

type SelectOptions = "fruit" | "fruits" | "sport" | "sports" | "book" | "books"

interface NestedSelectorContext {
  items: Container<Array<SelectOptions>>
  modifier: Container<string>
}

function nestedSelectorExample(name: string, renderer: (context: RenderApp<NestedSelectorContext>, view: HTMLView) => void) {
  return example(renderContext<NestedSelectorContext>())
    .description(`nested conditional view with selector that uses parent args (${name})`)
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            items: container({ initialValue: [ "fruit", "sport", "book" ]}),
            modifier: container({ initialValue: "" })
          })
        }),
        fact("there is a nested conditional view selector that uses parent args", (context) => {
          function singleItemDescription(name: string): HTMLView {
            return root => root.div(el => el.children.textNode(`This is a ${name}!`))
          }

          function pluralItemDescription(name: string): HTMLView {
            return root => root.div(el => el.children.textNode(`These are ${name}!`))
          }

          function itemView(item: State<SelectOptions>): HTMLView {
            return root => {
              root.subviewOf(select => select
                .when(get => `${get(item)}${get(context.state.modifier)}` === "fruit", singleItemDescription("fruit"))
                .when(get => `${get(item)}${get(context.state.modifier)}` === "fruits", pluralItemDescription("fruits"))
                .when(get => `${get(item)}${get(context.state.modifier)}` === "sport", singleItemDescription("sport"))
                .when(get => `${get(item)}${get(context.state.modifier)}` === "sports", pluralItemDescription("sports"))
                .when(get => `${get(item)}${get(context.state.modifier)}` === "book", singleItemDescription("book"))
                .when(get => `${get(item)}${get(context.state.modifier)}` === "books", pluralItemDescription("books"))
              )
            }
          }

          renderer(context, root => {
            root.main(el => {
              el.children.zones(get => get(context.state.items), itemView)
            })
          })
        })
      ],
      observe: [
        effect("it renders the default values", async () => {
          await expect(selectElements("div").texts(), resolvesTo([
            "This is a fruit!",
            "This is a sport!",
            "This is a book!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update a conditional view", (context) => {
          context.writeTo(context.state.modifier, "s")
        })
      ],
      observe: [
        effect("it updates the conditional views", async () => {
          await expect(selectElements("div").texts(), resolvesTo([
            "These are fruits!",
            "These are sports!",
            "These are books!"
          ]))
        })
      ]
    })
}

function itemToggle(id: string): Container<boolean> {
  return container({ initialValue: true, id: `toggle-${id}` })
}

interface NestedSelectViewContext {
  listItems: Container<Array<string>>
}
