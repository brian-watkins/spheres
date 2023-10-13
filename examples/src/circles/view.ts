import { View, htmlView, svgView } from "display-party";
import { GetState, batch, write, run, store, container } from "state-party";
import { CircleContainer, addCircleSelection, adjustRadius, adjustRadiusSelection, canRedo, canUndo, circleData, deselectCircle, redoSelection, selectCircle, undoSelection } from "./state";
import { useValue } from "../helpers/helpers";

export default function circles(): View {
  return htmlView()
    .main(({ children }) => {
      children
        .div(({ config, children }) => {
          config
            .class("p-8")
          children
            .button(({ config, children }) => {
              config
                .class("disabled:text-slate-200 text-slate-500")
                .disabled(get => !get(canUndo))
                .on("click", () => store(undoSelection))
              children
                .textNode("Undo")
            })
            .button(({ config, children }) => {
              config
                .class("disabled:text-slate-200 text-slate-500")
                .disabled(get => !get(canRedo))
                .on("click", () => store(redoSelection))
              children
                .textNode("Redo")
            })
        })
        .svg(({ config, children }) => {
          config
            .dataAttribute("canvas")
            .width("600")
            .height("400")
            .class("bg-slate-300 rounded")
            .on("click", (evt) => {
              const mouseEvent = (evt as unknown as MouseEvent)
              return store(addCircleSelection, { x: mouseEvent.offsetX, y: mouseEvent.offsetY })
            })
          children
            .andThen(circleViews)
        })
        .andThen(optionsView)
    })
}

function circleViews(get: GetState): View {
  const data = get(circleData)

  return svgView()
    .g(({ children }) => {
      for (const circle of data) {
        children.andThen(circleView(circle))
      }
    })
}

function circleView(circleContainer: CircleContainer) {
  return (get: GetState) => {
    const circle = get(circleContainer)
    return svgView()
      .circle(({ config }) => {
        config
          .fill(circle.selected ? "#333333" : "transparent")
          .stroke("#555555")
          .strokeWidth("3")
          .cx(`${circle.center.x}`)
          .cy(`${circle.center.y}`)
          .r(`${circle.radius}`)
          .on("mouseover", () => write(circleContainer, selectCircle()))
          .on("mouseout", () => write(circleContainer, deselectCircle()))
          .on("click", (evt) => {
            evt.stopPropagation()
            return batch([
              write(dialog, {
                circle: circleContainer,
                originalRadius: get(circleContainer).radius,
              }),
              write(showDiameterSlider, false),
              run(() => {
                document.querySelector("dialog")?.showModal()
              })
            ])
          })
      })
  }
}

// local state for dialog

interface DialogContents {
  circle: CircleContainer
  originalRadius: number
}

const dialog = container<DialogContents | undefined>({
  initialValue: undefined
})

const showDiameterSlider = container({ initialValue: false })

function optionsView(get: GetState): View {
  const dialogData = get(dialog)

  if (dialogData === undefined) {
    return htmlView().dialog()
  }

  const circle = get(dialogData.circle)

  return htmlView()
    .dialog(({ config, children }) => {
      config
        .on("click", (evt) => {
          const target = evt.target as HTMLElement
          if (target.tagName === "DIALOG") {
            return run(() => (target as HTMLDialogElement).close())
          } else {
            return batch([])
          }
        })
        .on("close", () => {
          return store(adjustRadiusSelection, {
            circle: get(dialog)!.circle,
            originalRadius: get(dialog)!.originalRadius
          })
        })
      children
        .div(({ config, children }) => {
          config
            .class("p-8")
            .on("click", () => write(showDiameterSlider, true))

          if (get(showDiameterSlider)) {
            children
              .textNode("Adjust diameter")
              .input(({ config }) => {
                config
                  .name("radius")
                  .type("range")
                  .max("50")
                  .step("1")
                  .value(`${circle.radius}`)
                  .on("input", useValue(value => write(dialogData.circle, adjustRadius(Number(value)))))
              })
          } else {
            children
              .textNode(`Adjust Diameter of circle at (${circle.center.x}, ${circle.center.y})`)
          }
        })
    })
}