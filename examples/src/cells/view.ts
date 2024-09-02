import { Container, StoreMessage, batch, container, rule, run, use, write } from "spheres/store";
import { cellContainer } from "./state.js";
import { CellErrorType } from "./formula.js";
import { HTMLBuilder, HTMLView } from "../../../src/view/index.js";

const editableCell = container<Container<boolean> | undefined>({ initialValue: undefined })

const makeEditable = rule((get, id: string) => {
  const editState = get(cellContainer(id)).editable
  const currentEditState = get(editableCell)

  let messages: Array<StoreMessage<any>> = [
    write(editState, true)
  ]
  if (currentEditState !== undefined) {
    messages.push(write(currentEditState, false))
  }
  messages.push(write(editableCell, editState))

  return batch(messages)
})

const startLetter = 65
const totalColumns = 26
const totalRows = 50

export function cells(root: HTMLBuilder) {
  root.main(({ config, children }) => {
    config
      .class("absolute bottom-0 top-32 left-0 right-0 overflow-auto")
    children
      .div(({ config, children }) => {
        config
          .class("flex w-fit sticky top-0 z-50")
        children
          .div(({ config }) => {
            config.class("shrink-0 w-16 h-8 bg-slate-700 sticky left-0")
          })
        for (let col = startLetter; col < startLetter + totalColumns; col++) {
          children
            .div(({ config, children }) => {
              config
                .class("shrink-0 w-40 h-8 bg-slate-700 text-slate-200 text-center py-1")
              children.textNode(String.fromCharCode(col))
            })
        }
      })
    for (let row = 1; row <= totalRows; row++) {
      children
        .div(({ config, children }) => {
          config
            .class("flex h-8 w-fit divide-x divide-x-reverse divide-y divide-y-reverse divide-slate-800")
          children
            .div(({ config, children }) => {
              config
                .class("shrink-0 bg-slate-700 w-16 h-8 text-slate-200 text-center sticky left-0 z-20 py-1")
              children.textNode(`${row}`)
            })
          for (let col = startLetter; col < startLetter + totalColumns; col++) {
            children
              .zone(cell(`${String.fromCharCode(col)}${row}`))
          }
        })
    }
  })
}

function cell(id: string): HTMLView {
  return root => {
    root.div(({ config, children }) => {
      config
        .dataAttribute("cell", id)
        .class(get => {
          const cellDetails = get(cellContainer(id))
          if (get(cellDetails.cellValue).isErr) {
            return "shrink-0 h-8 w-40 bg-fuchsia-300 relative italic"
          } else {
            return `shrink-0 h-8 w-40 ${get(cellDetails.editable) ? "bg-slate-100" : "bg-slate-200"} relative`
          }
        })
        .on("click", () => batch([
          use(makeEditable, id),
          run(() => (document.querySelector(`input[name='${id}']`) as HTMLInputElement)?.focus())
        ]))
      children
        .div(({ config, children }) => {
          config
            .class("px-1 py-1")
            .hidden(get => get(get(cellContainer(id)).editable) ? "hidden" : undefined)
          children
            .textNode(get => {
              const cellValue = get(get(cellContainer(id)).cellValue)
              return cellValue.resolve({
                ok: (val) => val,
                err: (error) => {
                  switch (error.type) {
                    case CellErrorType.ParseFailure:
                      return error.value
                    case CellErrorType.UnableToCalculate:
                      return "NaN"
                  }
                }
              })
            })
        })
        .form(({ config, children }) => {
          config
            .class("absolute top-1 left-0")
            .hidden(get => get(get(cellContainer(id)).editable) ? undefined : "hidden")
            .on("submit", (evt) => {
              evt.preventDefault()
              return use(rule(get => {
                const cellDefinition = ((evt.target as HTMLFormElement).elements.namedItem(id) as HTMLInputElement).value
                return batch([
                  write(editableCell, undefined),
                  write(get(cellContainer(id)).editable, false),
                  write(cellContainer(id), cellDefinition)
                ])
              }))
            })
          children
            .input(({ config }) => {
              config
                .name(id)
                .type("text")
                .class("w-full px-1 bg-slate-100 outline-none")
            })
        })
    })
  }
}
