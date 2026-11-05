import { container, Container, State, update } from "@store/index.js"
import { split } from "@store/util/split.js"
import { HTMLView, UseItem } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElement, selectElements } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface Task {
  id: string
  label: string
}

interface SplitStateContext {
  items: Container<Array<string>>
}

export default behavior("splitState", [
  example(renderContext<SplitStateContext>())
    .description("updating split state declared in a list item view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["job 1", "job 2"] }),
          })
        }),
        fact(
          "there is a list view where each item declares a list container and splits it",
          (context) => {
            context.mountView((root) => {
              root.main((el) => {
                el.children.subviews((get) => get(context.state.items), jobView)
              })
            })
          },
        ),
      ],
      perform: [
        step("complete the tasks for the second item", async () => {
          await selectElement("div[data-job='job 2'] button[data-mark-done]").click()
        }),
      ],
      observe: [
        effect("the first item's tasks are not updated", async () => {
          await expect(
            selectElements("div[data-job='job 1'] li").texts(),
            resolvesTo(["task a", "task b"]),
          )
        }),
        effect("the second item's tasks are updated", async () => {
          await expect(
            selectElements("div[data-job='job 2'] li").texts(),
            resolvesTo(["task a done", "task b done"]),
          )
        }),
      ],
    }),

  example(renderContext<SplitStateContext>())
    .description("adding to split state declared in a list item view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["job 1", "job 2"] }),
          })
        }),
        fact(
          "there is a list view where each item declares a list container and splits it",
          (context) => {
            context.mountView((root) => {
              root.main((el) => {
                el.children.subviews((get) => get(context.state.items), jobView)
              })
            })
          },
        ),
      ],
      perform: [
        step("add a task to the second item", async () => {
          await selectElement("div[data-job='job 2'] button[data-add-task]").click()
        }),
      ],
      observe: [
        effect("the first item's tasks are unchanged", async () => {
          await expect(
            selectElements("div[data-job='job 1'] li").texts(),
            resolvesTo(["task a", "task b"]),
          )
        }),
        effect("the second item shows the new task", async () => {
          await expect(
            selectElements("div[data-job='job 2'] li").texts(),
            resolvesTo(["task a", "task b", "task c"]),
          )
        }),
      ],
    }),
])

function taskView(useItem: UseItem<State<Task>>): HTMLView {
  return (root) => {
    root.li((el) => {
      el.children.textNode(useItem((item, get) => get(item.data).label))
    })
  }
}

function jobView(useItem: UseItem<string>): HTMLView {
  const tasks = container<Array<Task>>({
    initialValue: [
      { id: "a", label: "task a" },
      { id: "b", label: "task b" },
    ],
  })
  const taskStates = split(tasks, (task) => task.id)

  return (root) => {
    root.div((el) => {
      el.config.dataAttribute(
        "job",
        useItem((item) => item.data),
      )
      el.children
        .h3((el) => {
          el.children.textNode(useItem((item) => item.data))
        })
        .button((el) => {
          el.config.dataAttribute("mark-done")
          el.config.on("click", () =>
            update(tasks, (current) =>
              current.map((task) => ({ ...task, label: `${task.label} done` })),
            ),
          )
          el.children.textNode("Complete")
        })
        .button((el) => {
          el.config.dataAttribute("add-task")
          el.config.on("click", () =>
            update(tasks, (current) => [...current, { id: "c", label: "task c" }]),
          )
          el.children.textNode("Add task")
        })
        .ul((el) => {
          el.children.subviews((get) => get(taskStates), taskView)
        })
    })
  }
}
