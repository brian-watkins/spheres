import { View, htmlView } from "@spheres/display";
import { batch, container, run, write } from "@spheres/store";
import { cellContainer } from "./state";
import { CellErrorType } from "./formula";

const showInput = container({ initialValue: "" })

const startLetter = 65
const totalColumns = 26
const totalRows = 50

export function cells(): View {
  return htmlView(root => {
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
  })
}

function cell(identifier: string): View {
  return htmlView(root => {
    root.div(({ config, children }) => {
      config
        .dataAttribute("cell", identifier)
        .class((get) => {
          if (get(get(cellContainer(identifier))).isErr) {
            return "shrink-0 h-8 w-40 bg-fuchsia-300 relative italic"
          } else {
            return `shrink-0 h-8 w-40 ${get(showInput) === identifier ? "bg-slate-100" : "bg-slate-200"} relative`
          }
        })
        .on("click", () => batch([
          write(showInput, identifier),
          run(() => (document.querySelector(`input[name='${identifier}']`) as HTMLInputElement)?.focus())
        ]))
      children
        .div(({ config, children }) => {
          config
            .class("px-1 py-1")
            .hidden((get) => get(showInput) === identifier ? "hidden" : undefined)
          children
            .textNode((get) => {
              const cellValue = get(get(cellContainer(identifier)))
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
            .hidden(get => get(showInput) === identifier ? undefined : "hidden")
            .on("submit", (evt) => {
              evt.preventDefault()
              const cellDefinition = ((evt.target as HTMLFormElement).elements.namedItem(identifier) as HTMLInputElement).value
              return batch([
                write(showInput, ""),
                write(cellContainer(identifier), cellDefinition)
              ])
            })
          children
            .input(({ config }) => {
              config
                .name(identifier)
                .type("text")
                .class("w-full px-1 bg-slate-100 outline-none")
            })
        })
    })
  })
}