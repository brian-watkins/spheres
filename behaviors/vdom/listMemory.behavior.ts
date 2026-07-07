import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { ListExamplesState } from "./helpers/listHelpers";
import { container, derived } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { expect, is } from "great-expectations";
import { requestGC } from "./helpers/memoryHelpers";
import { UseItem } from "@view/index";


const externalToken = container({ initialValue: 0 })
const nestedListToken = container({ initialValue: ["a", "b", "c"] })

export default behavior("list memory", [

  example(renderContext<ListExamplesState>())
    .description("external token is referenced in list item effect")
    .script({
      suppose: [
        fact("there is a list", (context) => {
          context.setState({
            listContainer: container({ initialValue: ["a", "b", "c", "d", "e", "f"] })
          })
        }),
        fact("there is a view for the list", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            return (root) => {
              root.div(el => {
                el.config.dataAttribute("list-item")
                el.children.textNode(stateful((item, get) => `${item.data} (${get(externalToken) + item.index})`))
              })
            }
          }

          context.mountView((root) => {
            root.main(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      perform: [
        step("update the external token", (context) => {
          context.writeTo(externalToken, 17)
        })
      ],
      observe: [
        effect("the list is rendered with the external token", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "b (18)",
            "c (19)",
            "d (20)",
            "e (21)",
            "f (22)",
          ]))
        }),
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the second element", () => {
          const el = document.querySelectorAll("div[data-list-item]")
          window.__element_ref = new WeakRef(el.item(1))
        }),
        step("remove the second item", (context) => {
          context.writeTo(context.state.listContainer, ["a", "c", "d", "e", "f"])
        })
      ],
      observe: [
        effect("the list view updates", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "c (18)",
            "d (19)",
            "e (20)",
            "f (21)",
          ]))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the third element", () => {
          const el = document.querySelectorAll("div[data-list-item]")
          window.__element_ref = new WeakRef(el.item(2))
        }),
        step("replace the third element", (context) => {
          context.writeTo(context.state.listContainer, ["a", "c", "h", "e", "f"])
        })
      ],
      observe: [
        effect("the list view updates", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "c (18)",
            "h (19)",
            "e (20)",
            "f (21)",
          ]))
        }),
        effect("the replaced dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the second to last element", () => {
          const el = document.querySelectorAll("div[data-list-item]")
          window.__element_ref = new WeakRef(el.item(3))
        }),
        step("remove the everything after the second item", (context) => {
          context.writeTo(context.state.listContainer, ["a", "c"])
        })
      ],
      observe: [
        effect("the list view updates", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "c (18)",
          ]))
        }),
        effect("the removed dom element at the end is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    })
    .andThen({
      perform: [
        step("store weak reference", () => {
          const el = document.querySelector("div[data-list-item]")!
          window.__element_ref = new WeakRef(el)
        }),
        step("clear the list", (context) => {
          context.writeTo(context.state.listContainer, [])
        }),
      ],
      observe: [
        effect("the list view updates", () => {
          expect(document.querySelectorAll("div[data-list-item]").length, is(0))
        }),
        effect("the dom elements are garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("nested list items use local container state")
    .script({
      suppose: [
        fact("there is a list", (context) => {
          context.setState({
            listContainer: container({ initialValue: ["group"] })
          })
        }),
        fact("there is a view with a nested list whose items have local state", (context) => {
          function nestedItemView(stateful: UseItem<string>): HTMLView {
            return (root) => {
              const localState = container({ initialValue: 0 })

              root.div(el => {
                el.config.dataAttribute("nested-item")
                el.children.textNode(stateful((item, get) => `${item.data} (${get(localState)})`))
              })
            }
          }

          function groupView(stateful: UseItem<string>): HTMLView {
            return (root) => {
              root.section(el => {
                el.config.dataAttribute("group", stateful(item => item.data))
                el.children.subviews(get => get(nestedListToken), nestedItemView)
              })
            }
          }

          context.mountView((root) => {
            root.main(el => {
              el.children.subviews(get => get(context.state.listContainer), groupView)
            })
          })
        })
      ],
      observe: [
        effect("the nested list is rendered", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-nested-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (0)",
            "b (0)",
            "c (0)",
          ]))
        }),
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the second nested element", () => {
          const el = document.querySelectorAll("div[data-nested-item]")
          window.__element_ref = new WeakRef(el.item(1))
        }),
        step("remove the second nested item", (context) => {
          context.writeTo(nestedListToken, ["a", "c"])
        })
      ],
      observe: [
        effect("the nested list view updates", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-nested-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (0)",
            "c (0)",
          ]))
        }),
        effect("the removed nested dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("external token is referenced in a list item token")
    .script({
      suppose: [
        fact("there is a list", (context) => {
          context.setState({
            listContainer: container({ initialValue: ["a", "b", "c"] })
          })
        }),
        fact("there is a view for the list", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            return (root) => {
              const label = derived(stateful((item, get) => `${item.data} (${get(externalToken) + item.index})`))

              root.div(el => {
                el.config.dataAttribute("list-item")
                el.children.textNode(get => get(label))
              })
            }
          }

          context.mountView((root) => {
            root.main(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      perform: [
        step("update the external token", (context) => {
          context.writeTo(externalToken, 17)
        })
      ],
      observe: [
        effect("the list is rendered with the external token", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "b (18)",
            "c (19)",
          ]))
        }),
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the second element", () => {
          const el = document.querySelectorAll("div[data-list-item]")
          window.__element_ref = new WeakRef(el.item(1))
        }),
        step("remove the second item", (context) => {
          context.writeTo(context.state.listContainer, ["a", "c"])
        })
      ],
      observe: [
        effect("the list view updates", () => {
          const elements: Array<HTMLElement> = Array.from(document.querySelectorAll("div[data-list-item]"))
          expect(elements.map(el => el.innerText), is([
            "a (17)",
            "c (18)",
          ]))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    })
    .andThen({
      perform: [
        step("store weak reference", () => {
          const el = document.querySelector("div[data-list-item]")!
          window.__element_ref = new WeakRef(el)
        }),
        step("clear the list", (context) => {
          context.writeTo(context.state.listContainer, [])
        }),
      ],
      observe: [
        effect("the list view updates", () => {
          expect(document.querySelectorAll("div[data-list-item]").length, is(0))
        }),
        effect("the dom elements are garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    }),

])

