import { behavior, effect, example, fact, step } from "best-behavior";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { selectElement } from "./helpers/displayElement";
import { expect, objectWithProperty, resolvesTo, stringContaining, throws } from "great-expectations";
import { container, Container, exec } from "@store/index";
import { domAction, domEffect, elementIdentifier, ElementIdentifier, UseItem } from "@view/index";
import { HTMLView } from "@view/htmlElements";

interface ElementContext {
  identifier: ElementIdentifier<HTMLInputElement>
}

interface ListElementContext {
  items: Container<Array<string>>
}

export default behavior("element", [

  example(renderContext<ElementContext>())
    .description("resolve identifier that has not been associated with an element")
    .script({
      suppose: [
        fact("there is an identifier", (app) => {
          app.setState({
            identifier: elementIdentifier()
          })
        }),
        fact("there is a view with no identified element", (app) => {
          app.mountView((root) => {
            root.main(el => {
              el.children
                .h1(el => el.children.textNode("This is a form"))
            })
          })
        })
      ],
      observe: [
        effect("an error is thrown when the identifier is resolved", (app) => {
          expect(() => {
            app.store.dispatch(exec(
              domAction,
              domEffect((getEl) => getEl(app.state.identifier).focus())
            ))
          }, throws(objectWithProperty("message", stringContaining("unknown element identifier"))))
        })
      ],
    }),

  elementCommandExample("client rendered", (context, view) => context.mountView(view)),
  elementCommandExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  listElementCommandExample("client rendered", (context, view) => context.mountView(view)),
  listElementCommandExample("server rendered", (context, view) => context.ssrAndActivate(view))

])

function listElementCommandExample(name: string, render: (context: RenderApp<ListElementContext>, view: HTMLView) => void) {
  return example(renderContext<ListElementContext>())
    .description(`operating on a dom element in a list item view (${name})`)
    .script({
      suppose: [
        fact("there is a list of items", (app) => {
          app.setState({
            items: container({ initialValue: ["item-1", "item-2", "item-3"] })
          })
        }),
        fact("there is a list view with an input field and a focus button for each item", (app) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const inputIdentifier = elementIdentifier<HTMLInputElement>()

            return (root) => {
              root.li(el => {
                el.children
                  .input(el => {
                    el.config
                      .elementIdentifier(inputIdentifier)
                      .type("text")
                      .dataAttribute("item-input", stateful(item => item.data))
                  })
                  .button(el => {
                    el.config.dataAttribute("focus-button", stateful(item => item.data))
                    el.config.on("click", () => exec(
                      domAction,
                      domEffect((getEl) => getEl(inputIdentifier).focus())
                    ))
                    el.children.textNode("Focus")
                  })
              })
            }
          }

          render(app, (root) => {
            root.ul(el => {
              el.children.subviews(get => get(app.state.items), itemView)
            })
          })
        })
      ],
      perform: [
        step("click the focus button for the second item", async () => {
          await selectElement("[data-focus-button='item-2']").click()
        })
      ],
      observe: [
        effect("the input field for the second item is focused", async () => {
          await expect(
            selectElement("input[data-item-input='item-2']").isFocused(),
            resolvesTo(true)
          )
        }),
        effect("the input fields for the other items are not focused", async () => {
          await expect(
            selectElement("input[data-item-input='item-1']").isFocused(),
            resolvesTo(false)
          )
          await expect(
            selectElement("input[data-item-input='item-3']").isFocused(),
            resolvesTo(false)
          )
        })
      ]
    })
}

function elementCommandExample(name: string, render: (context: RenderApp<ElementContext>, view: HTMLView) => void) {
  return example(renderContext<ElementContext>())
    .description(`operating on a dom element (${name})`)
    .script({
      suppose: [
        fact("there is an identifier", (app) => {
          app.setState({
            identifier: elementIdentifier()
          })
        }),
        fact("there is a view with an identified input field", (app) => {
          render(app, (root) => {
            root.main(el => {
              el.children
                .h1(el => el.children.textNode("This is a form"))
                .label(el => {
                  el.children.textNode("Name")
                    .input(el => {
                      el.config
                        .elementIdentifier(app.state.identifier)
                        .type("text")
                        .name("thing-name")
                    })
                })
            })
          })
        })
      ],
      observe: [
        effect("the input field is not focused", async () => {
          await expect(
            selectElement("input[name='thing-name']").isFocused(),
            resolvesTo(false)
          )
        })
      ]
    }).andThen({
      perform: [
        step("dispatch a dom command to focus the field", async (app) => {
          app.store.dispatch(exec(
            domAction,
            domEffect((getEl) => getEl(app.state.identifier).focus())
          ))
        })
      ],
      observe: [
        effect("the input field is now focused", async () => {
          await expect(
            selectElement("input[name='thing-name']").isFocused(),
            resolvesTo(true)
          )
        })
      ]
    })
}
