import { GetState, use, write } from "@spheres/store";
import { createRecord, deleteSelected, filterPrefix, filteredRecords, records, selectedRecord, updateSelected } from "./state.js";
import { names, useValue } from "../helpers/helpers.js";
import { HTMLView, WithArgs, htmlTemplate } from "@spheres/view";

export const crud = htmlTemplate(() => root => {
  root.main(({ config, children }) => {
    config
      .class("m-4")
    children
      .zone(filterInputView())
      .div(({ config, children }) => {
        config
          .class(names([
            "flex",
            "gap-4",
            "my-4"
          ]))
        children
          .zone(recordsView)
          .zone(recordForm())
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
            children.textNode("Create")
          })
          .button(({ config, children }) => {
            config
              .dataAttribute("action", "update")
              .form("record-form")
              .type("submit")
              .disabled((get) => get(selectedRecord) === -1)
              .class(buttonClasses())
            children.textNode("Update")
          })
          .button(({ config, children }) => {
            config
              .dataAttribute("action", "delete")
              .disabled((get) => get(selectedRecord) === -1)
              .on("click", () => use(deleteSelected))
              .class(buttonClasses())
            children.textNode("Delete")
          })
      })
  })
})


const recordForm = htmlTemplate(() => root => {
  root.form(({ config, children }) => {
    config
      .id("record-form")
      .class(names([
        "flex",
        "flex-col",
        "gap-4"
      ]))
      .on("submit", (evt) => {
        evt.preventDefault();
        const data = new FormData(evt.target as HTMLFormElement)
        const firstName = data.get("firstName")!.toString()
        const lastName = data.get("lastName")!.toString()
        if (submissionAction(evt) === "create") {
          return write(records, createRecord({ firstName, lastName }))
        } else {
          return use(updateSelected, { firstName, lastName })
        }
      })
    children
      .zone(inputView({
        label: "First Name:",
        name: "firstName"
      }))
      .zone(inputView({
        label: "Last Name:",
        name: "lastName"
      }))
  })
})

interface InputViewAttributes {
  label: string
  name: string
}

const inputView = htmlTemplate((withArgs: WithArgs<InputViewAttributes>) => root =>
  root.label(el => {
    el.children
      .textNode(withArgs(props => props.label))
      .input(el => {
        el.config
          .type("text")
          .required(true)
          .class(`${inputClasses()} ml-2 w-48`)
          .name(withArgs(props => props.name))
      })
  }))

const filterInputView = htmlTemplate(() => root =>
  root.label(el => {
    el.children
      .textNode("Filter:")
      .input(el => {
        el.config
          .type("text")
          .required(true)
          .class(`${inputClasses()} ml-2 w-48`)
          .dataAttribute("filter-input")
          .on("input", useValue((val) => write(filterPrefix, val)))
      })
  }))


function recordsView(get: GetState): HTMLView {
  const data = get(filteredRecords)

  return root => {
    root.select(({ config, children }) => {
      config
        .size("5")
        .dataAttribute("records")
        .on("change", useValue((value) => write(selectedRecord, parseInt(value))))
        .class(`${inputClasses()} w-64`)

      children.option(({ config, children }) => {
        config.value("-1")
        children.textNode("")
      })

      for (const record of data) {
        children
          .option(({ config, children }) => {
            config
              .value(`${record.id}`)
            children
              .textNode(`${record.lastName}, ${record.firstName}`)
          })
      }
    })
  }
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