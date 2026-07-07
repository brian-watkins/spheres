import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";
import { update } from "@store/message";
import { container, Container } from "@store/index";
import { HTMLBuilder, HTMLView, UseItem } from "@view/index";

interface FragmentListContext {
  items: Container<Array<string>>
}

export default behavior("fragment", [

  example(renderContext())
    .description("rendering a fragment")
    .script({
      suppose: [
        fact("a fragment is rendered", (context) => {
          context.mountView(root => {
            root
              .p(el => {
                el.children.textNode("This is the first paragraph.")
              })
              .p(el => {
                el.children.textNode("This is the second paragraph.")
              })
          })
        })
      ],
      observe: [
        effect("it displays both paragraphs", async () => {
          await expect(selectElements("p").texts(), resolvesTo([
            "This is the first paragraph.",
            "This is the second paragraph.",
          ]))
        })
      ]
    }),

  example(renderContext())
    .description("rendering a fragment with an event")
    .script({
      suppose: [
        fact("a fragment with an event is rendered", (context) => {
          const counter = container({ initialValue: 0 })

          context.mountView(root => {
            root
              .h1(el => el.children.textNode("This is a fragment!"))
              .p(el => {
                el.children.textNode(get => `Clicks: ${get(counter)}`)
              })
              .button(el => {
                el.config.on("click", () => update(counter, val => val + 1))
                el.children.textNode("Click me!")
              })
          })
        })
      ],
      observe: [
        effect("it displays the initial counter text", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Clicks: 0"
          ))
        })
      ]
    }).andThen({
      perform: [
        step("click the button", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("it updates the counter text", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Clicks: 3"
          ))
        })
      ]
    }),

  example(renderContext())
    .description("rendering a select view with fragments")
    .script({
      suppose: [
        fact("a select view displays fragments", (context) => {
          const flag = container({ initialValue: false })

          function otherView(root: HTMLBuilder) {
            root
              .p(el => el.children.textNode("Other view!"))
              .p(el => el.children.textNode("Other view also!"))
          }

          function defaultView(root: HTMLBuilder) {
            root
              .p(el => el.children.textNode("Default view!"))
              .p(el => el.children.textNode("Default view also!"))
          }

          context.mountView(root => {
            root
              .button(el => {
                el.config.on("click", () => update(flag, val => !val))
                el.children.textNode("Click me!")
              })
              .subviewMatching(selector => {
                selector.withConditions()
                  .when(get => get(flag), otherView)
                  .default(defaultView)
              })
          })
        })
      ],
      observe: [
        effect("it displays the initial fragment view", async () => {
          await expect(selectElements("p").texts(), resolvesTo([
            "Default view!",
            "Default view also!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click the button", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("it displays the other fragment view", async () => {
          await expect(selectElements("p").texts(), resolvesTo([
            "Other view!",
            "Other view also!"
          ]))
        })
      ]
    }),

  example(renderContext())
    .description("nested select views rendering a fragment")
    .script({
      suppose: [
        fact("nested select views with fragments are rendered", (context) => {
          function outerDefault(root: HTMLBuilder) {
            root
              .p(el => el.children.textNode("Outer default view!"))
              .h1(el => el.children.textNode("Hello from outer view!"))
              .subviewMatching(selector => {
                selector.withConditions()
                  .default(root => root.h3(el => el.children.textNode("Inner view!")))
              })
          }

          context.mountView(root => {
            root
              .subviewMatching(selector => {
                selector.withConditions()
                  .default(outerDefault)
              })
          })
        })
      ],
      observe: [
        effect("it displays the fragments of the outer view", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Outer default view!"
          ))
          await expect(selectElement("h1").text(), resolvesTo(
            "Hello from outer view!"
          ))
        }),
        effect("it displays the inner default view", async () => {
          await expect(selectElement("h3").text(), resolvesTo(
            "Inner view!"
          ))
        })
      ]
    }),

  example(renderContext())
    .description("nested select views where the inner one renders a stateful fragment")
    .script({
      suppose: [
        fact("nested toggleable select views are rendered", (context) => {
          const showOuter = container({ initialValue: false })
          const showInner = container({ initialValue: false })
          const message = container({ initialValue: "Stateful text!" })

          function innerFragment(root: HTMLBuilder) {
            root
              .h3(el => {
                el.children.textNode("Inner fragment heading")
              })
              .p(el => {
                el.children.textNode(get => get(message))
              })
          }

          function innerDefault(root: HTMLBuilder) {
            root.p(el => el.children.textNode("Inner default view!"))
          }

          function outerView(root: HTMLBuilder) {
            root
              .button(el => {
                el.config.dataAttribute("toggle", "inner")
                el.config.on("click", () => update(showInner, val => !val))
                el.children.textNode("Toggle inner!")
              })
              .h1(el => {
                el.children.textNode("Hello from outer view!")
              })
              .subviewMatching(selector => {
                selector.withConditions()
                  .when(get => get(showInner), innerFragment)
                  .default(innerDefault)
              })
          }

          function outerDefault(root: HTMLBuilder) {
            root.p(el => el.children.textNode("Outer default view!"))
          }

          context.mountView(root => {
            root
              .button(el => {
                el.config.dataAttribute("toggle", "outer")
                el.config.on("click", () => update(showOuter, val => !val))
                el.children.textNode("Toggle outer!")
              })
              .subviewMatching(selector => {
                selector.withConditions()
                  .when(get => get(showOuter), outerView)
                  .default(outerDefault)
              })
          })
        })
      ],
      observe: [
        effect("it displays the outer default view", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Outer default view!"
          ))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the outer view", async () => {
          await selectElement("button[data-toggle='outer']").click()
        })
      ],
      observe: [
        effect("it displays fragment elements from the outer view", async () => {
          await expect(selectElement("h1").text(), resolvesTo(
            "Hello from outer view!"
          ))
        }),
        effect("it displays the inner default view", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Inner default view!"
          ))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the inner view", async () => {
          await selectElement("button[data-toggle='inner']").click()
        })
      ],
      observe: [
        effect("it displays the inner fragment heading", async () => {
          await expect(selectElement("h3").text(), resolvesTo(
            "Inner fragment heading"
          ))
        }),
        effect("it displays the stateful text from the inner fragment", async () => {
          await expect(selectElement("p").text(), resolvesTo(
            "Stateful text!"
          ))
        })
      ]
    }),

  example(renderContext<FragmentListContext>())
    .description("a list where each list item view is a fragment with its own counter")
    .script({
      suppose: [
        fact("there is list state", (context) => {
          context.setState({
            items: container({ initialValue: ["Apple", "Banana", "Cherry"] })
          })
        }),
        fact("a list is displayed where each item view is a fragment with its own counter", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const counter = container({ initialValue: 0 })

            return root => {
              root
                .h3(el => {
                  el.config.dataAttribute("item-title")
                  el.children.textNode(stateful(item => item.data))
                })
                .p(el => {
                  el.config.dataAttribute("item-count")
                  el.children.textNode(get => `Count: ${get(counter)}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("item-increment")
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
        effect("it displays the fragment for each item in order", async () => {
          await expect(selectElements("[data-item-title]").texts(), resolvesTo([
            "Apple",
            "Banana",
            "Cherry"
          ]))
        }),
        effect("each item's counter starts at zero", async () => {
          await expect(selectElements("[data-item-count]").texts(), resolvesTo([
            "Count: 0",
            "Count: 0",
            "Count: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the counters are incremented for various items", async () => {
          await selectElements("[data-item-increment]").at(0).click()
          await selectElements("[data-item-increment]").at(0).click()
          await selectElements("[data-item-increment]").at(2).click()
        })
      ],
      observe: [
        effect("each item maintains its own distinct count", async () => {
          await expect(selectElements("[data-item-count]").texts(), resolvesTo([
            "Count: 2",
            "Count: 0",
            "Count: 1"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the list is reordered", (context) => {
          context.writeTo(context.state.items, ["Cherry", "Apple", "Banana"])
        })
      ],
      observe: [
        effect("it displays the fragments in the new order", async () => {
          await expect(selectElements("[data-item-title]").texts(), resolvesTo([
            "Cherry",
            "Apple",
            "Banana"
          ]))
        }),
        effect("each item's count moves with the item through the reorder", async () => {
          await expect(selectElements("[data-item-count]").texts(), resolvesTo([
            "Count: 1",
            "Count: 2",
            "Count: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("Bannana is increments", async () => {
          await selectElements("[data-item-increment]").at(2).click()
        }),
        step("a new item is added in the middle of the list", (context) => {
          context.writeTo(context.state.items, ["Cherry", "Apple", "Date", "Banana"])
        })
      ],
      observe: [
        effect("it displays the fragment for the new item in the middle", async () => {
          await expect(selectElements("[data-item-title]").texts(), resolvesTo([
            "Cherry",
            "Apple",
            "Date",
            "Banana"
          ]))
        }),
        effect("each item's count moves with the item through the reorder", async () => {
          await expect(selectElements("[data-item-count]").texts(), resolvesTo([
            "Count: 1",
            "Count: 2",
            "Count: 0",
            "Count: 1",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("all items are removed", (context) => {
          context.writeTo(context.state.items, [])
        })
      ],
      observe: [
        effect("it displays no fragments", async () => {
          await expect(selectElements("[data-item-title]").count(), resolvesTo(0))
          await expect(selectElements("[data-item-count]").count(), resolvesTo(0))
        })
      ]
    }),

  example(renderContext())
    .description("activating a server-rendered select-view fragment with effects in each top-level node")
    .script({
      suppose: [
        fact("a server-rendered select view whose branch is a fragment with a counter in each top-level node is activated", (context) => {
          const counterOne = container({ initialValue: 0 })
          const counterTwo = container({ initialValue: 0 })
          const counterThree = container({ initialValue: 0 })

          function fragmentView(root: HTMLBuilder) {
            root
              .div(el => {
                el.children
                  .p(el => el.children.textNode(get => `Count one: ${get(counterOne)}`))
                  .button(el => {
                    el.config
                      .dataAttribute("increment", "one")
                      .on("click", () => update(counterOne, val => val + 1))
                    el.children.textNode("Increment one")
                  })
              })
              .div(el => {
                el.children
                  .p(el => el.children.textNode(get => `Count two: ${get(counterTwo)}`))
                  .button(el => {
                    el.config
                      .dataAttribute("increment", "two")
                      .on("click", () => update(counterTwo, val => val + 1))
                    el.children.textNode("Increment two")
                  })
              })
              .div(el => {
                el.children
                  .p(el => el.children.textNode(get => `Count three: ${get(counterThree)}`))
                  .button(el => {
                    el.config
                      .dataAttribute("increment", "three")
                      .on("click", () => update(counterThree, val => val + 1))
                    el.children.textNode("Increment three")
                  })
              })
          }

          context.ssrAndActivate(root => {
            root.subviewMatching(selector => {
              selector.withConditions()
                .default(fragmentView)
            })
          })
        })
      ],
      observe: [
        effect("it displays the initial count in each top-level node", async () => {
          await expect(selectElements("p").texts(), resolvesTo([
            "Count one: 0",
            "Count two: 0",
            "Count three: 0"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the counter in each top-level node is incremented", async () => {
          await selectElement("[data-increment='one']").click()
          await selectElement("[data-increment='two']").click()
          await selectElement("[data-increment='two']").click()
          await selectElement("[data-increment='three']").click()
          await selectElement("[data-increment='three']").click()
          await selectElement("[data-increment='three']").click()
        })
      ],
      observe: [
        effect("the counter in each top-level node updates", async () => {
          await expect(selectElements("p").texts(), resolvesTo([
            "Count one: 1",
            "Count two: 2",
            "Count three: 3"
          ]))
        })
      ]
    }),

  (m) => m.pick() && example(renderContext<FragmentListContext>())
    .description("activating a server-rendered switch fragment with a list followed by a sibling that has an event")
    .script({
      suppose: [
        fact("there is list state", (context) => {
          context.setState({
            items: container({ initialValue: ["Apple", "Banana", "Cherry"] })
          })
        }),
        fact("a server-rendered select-view fragment with a populated list and a trailing counter is activated", (context) => {
          const counter = container({ initialValue: 0 })

          function fragmentView(root: HTMLBuilder) {
            root
              .subviews(
                get => get(context.state.items),
                (item) => root => root.p(el => {
                  el.config.dataAttribute("item")
                  el.children.textNode(item(value => value.data))
                })
              )
              .div(el => {
                el.children
                  .p(el => {
                    el.config.dataAttribute("count")
                    el.children.textNode(get => `Count: ${get(counter)}`)
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("increment")
                      .on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Increment")
                  })
              })
          }

          context.ssrAndActivate(root => {
            root.subviewMatching(selector => {
              selector.withConditions()
                .default(fragmentView)
            })
          })
        })
      ],
      observe: [
        effect("it displays the list items", async () => {
          await expect(selectElements("[data-item]").texts(), resolvesTo([
            "Apple",
            "Banana",
            "Cherry"
          ]))
        }),
        effect("it displays the initial count in the trailing sibling node", async () => {
          await expect(selectElement("[data-count]").text(), resolvesTo(
            "Count: 0"
          ))
        })
      ]
    }).andThen({
      perform: [
        step("the counter in the trailing sibling node is incremented", async () => {
          await selectElement("[data-increment]").click()
          await selectElement("[data-increment]").click()
        })
      ],
      observe: [
        effect("the counter in the trailing sibling node updates", async () => {
          await expect(selectElement("[data-count]").text(), resolvesTo(
            "Count: 2"
          ))
        })
      ]
    }),

  example(renderContext())
    .description("activating a server-rendered switch fragment with a switch view followed by a sibling that has an event")
    .script({
      suppose: [
        fact("a server-rendered select-view fragment with an embedded switch view and a trailing counter is activated", (context) => {
          const counter = container({ initialValue: 0 })

          function innerFragment(root: HTMLBuilder) {
            root
              .p(el => {
                el.config.dataAttribute("inner")
                el.children.textNode("Inner fragment one!")
              })
              .p(el => {
                el.config.dataAttribute("inner")
                el.children.textNode("Inner fragment two!")
              })
          }

          function fragmentView(root: HTMLBuilder) {
            root
              .subviewMatching(selector => {
                selector.withConditions()
                  .default(innerFragment)
              })
              .div(el => {
                el.children
                  .p(el => {
                    el.config.dataAttribute("count")
                    el.children.textNode(get => `Count: ${get(counter)}`)
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("increment")
                      .on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Increment")
                  })
              })
          }

          context.ssrAndActivate(root => {
            root.subviewMatching(selector => {
              selector.withConditions()
                .default(fragmentView)
            })
          })
        })
      ],
      observe: [
        effect("it displays the embedded switch view fragment", async () => {
          await expect(selectElements("[data-inner]").texts(), resolvesTo([
            "Inner fragment one!",
            "Inner fragment two!"
          ]))
        }),
        effect("it displays the initial count in the trailing sibling node", async () => {
          await expect(selectElement("[data-count]").text(), resolvesTo(
            "Count: 0"
          ))
        })
      ]
    }).andThen({
      perform: [
        step("the counter in the trailing sibling node is incremented", async () => {
          await selectElement("[data-increment]").click()
          await selectElement("[data-increment]").click()
        })
      ],
      observe: [
        effect("the counter in the trailing sibling node updates", async () => {
          await expect(selectElement("[data-count]").text(), resolvesTo(
            "Count: 2"
          ))
        })
      ]
    })

])