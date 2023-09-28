import { InputElementAttributes, View, ViewElement, view } from "display-party";
import { GetState, store, write } from "state-party";
import { createRecord, deleteSelected, filterPrefix, filteredRecords, records, selectedRecord, updateSelected } from "./state.js";
import { names, useValue } from "../helpers/helpers.js";

export default function crud(): View {
  return view()
    .main(({ config, children }) => {
      config
        .class("m-4")
      children
        .view(inputView("Filter:", ({ config }) => {
          config
            .dataAttribute("filter-input")
            .on("input", useValue((val) => write(filterPrefix, val)))
        }))
        .div(({ config, children }) => {
          config
            .class(names([
              "flex",
              "gap-4",
              "my-4"
            ]))
          children
            .view(recordsView)
            .view(recordForm)
        })
        .div(({ config, children }) => {
          config
            .class("flex gap-4")
          children
            .button(({ config, children }) => {
              config
                .dataAttribute("action", "create")
                .form("record-form")
                .type("submit")
                .class(buttonClasses())
              children.text("Create")
            })
            .button(({ config, children }) => {
              config
                .dataAttribute("action", "update")
                .form("record-form")
                .type("submit")
                .disabled((get) => get(selectedRecord) === -1)
                .class(buttonClasses())
              children.text("Update")
            })
            .button(({ config, children }) => {
              config
                .dataAttribute("action", "delete")
                .disabled((get) => get(selectedRecord) === -1)
                .on("click", () => store(deleteSelected))
                .class(buttonClasses())
              children.text("Delete")
            })

        })
    })
}

function recordForm(): View {
  return view()
    .form(({ config, children }) => {
      config
        .id("record-form")
        .class(names([
          "flex",
          "flex-col",
          "gap-4"
        ]))
        .on("submit", (evt) => {
          evt.preventDefault();
          const firstName = valueFromFormElement(evt, "firstName")
          const lastName = valueFromFormElement(evt, "lastName")
          if (submissionAction(evt) === "create") {
            return write(records, createRecord({ firstName, lastName }))
          } else {
            return store(updateSelected, { firstName, lastName })
          }
        })
      children
        .view(inputView("First Name:", ({ config }) => {
          config
            .name("firstName")
            .dataAttribute("first-name-input")
        }))
        .view(inputView("Last Name:", ({ config }) => {
          config
            .name("lastName")
            .dataAttribute("last-name-input")
        }))
    })

}

function inputView(label: string, builder: (el: ViewElement<InputElementAttributes>) => void): () => View {
  return () => view()
    .label(el => {
      el.children
        .text(label)
        .input(el => {
          el.config
            .type("text")
            .required(true)
            .class(`${inputClasses()} ml-2 w-48`)
          builder(el)
        })
    })

}

function recordsView(get: GetState): View {
  const data = get(filteredRecords)

  return view()
    .select(({ config, children }) => {
      config
        .size("5")
        .dataAttribute("records")
        .on("change", (evt) => {
          console.log("Got select event!")
          return write(selectedRecord, parseInt((evt.target as HTMLOptionElement).value))
        })
        .class(`${inputClasses()} w-64`)

      children.option(({ config, children }) => {
        config.value("-1")
        children.text("")
      })

      for (const record of data) {
        children
          .option(({ config, children }) => {
            config
              .value(`${record.id}`)
            children
              .text(`${record.lastName}, ${record.firstName}`)
          })
      }
    })
}

function valueFromFormElement(evt: Event, name: string): string {
  return ((evt.target as HTMLFormElement).elements.namedItem(name) as HTMLInputElement).value
}

function submissionAction(evt: Event): string {
  return (evt as unknown as SubmitEvent).submitter?.dataset["action"] ?? ""
}

function inputClasses(): string {
  return "border-2 p-1"
}

function buttonClasses(): string {
  return names(["bg-sky-600",
    "text-slate-100",
    "font-bold",
    "text-xl",
    "px-8",
    "py-4",
    "disabled:bg-slate-400",
    "hover:bg-sky-800"
  ])
}