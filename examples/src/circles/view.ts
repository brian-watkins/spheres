import { View, htmlView, svgView } from "display-party";
import { GetState, batch, write, run, container, store } from "state-party";
import { CircleContainer, addCircleSelection, adjustRadius, adjustRadiusSelection, adjustableCircle, canRedo, canUndo, circleData, deselectCircle, redoSelection, selectCircle, undoSelection } from "./state";
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
              // return write(circleData, addCircleAt({ x: mouseEvent.offsetX, y: mouseEvent.offsetY }, true))
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
            console.log("Adjusting circle", circleContainer.toString(), get(circleContainer).radius)
            return batch([
              write(showDiameterSlider, false),
              write(adjustableCircle, circleContainer),
              write(originalRadius, get(circleContainer).radius),
              run(() => {
                document.querySelector("dialog")?.showModal()
              })
            ])
          })
      })
  }
}

const originalRadius = container({ initialValue: 0 })

const showDiameterSlider = container({ initialValue: false })

function optionsView(get: GetState): View {
  const adjustable = get(adjustableCircle)

  if (adjustable === undefined) {
    return htmlView().dialog()
  }

  // Note that to get the ability to close by clicking outside the
  // dialog, we need to add a click handler to the dialog and check
  // to make sure the target is the dialog itself.

  const circle = get(adjustable)

  return htmlView()
    .dialog(({ config, children }) => {
      config
        .on("click", (evt) => {
          const target = evt.target as HTMLElement
          console.log("tag name", target.tagName)
          if (target.tagName === "DIALOG") {
            return run(() => (target as HTMLDialogElement).close())
          } else {
            return batch([])
          }
        })
        .on("close", () => {
          console.log("Original radius", get(originalRadius))
          return store(adjustRadiusSelection, { circle: get(adjustableCircle)!, originalRadius: get(originalRadius) })
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
                  // .value(get => `${get(get(adjustableCircle)!).radius}`)
                  .on("input", useValue(value => write(adjustable, adjustRadius(Number(value)))))
                  // Note that this is creating a significant (undoable) event on every change
                  // We should only send the adjust radius selection message when the
                  // dialog box is closed
                  // and there are two cases for that: when you hit escape and when you
                  // click outside the dialog ... I think ...
                  // .on("input", useValue(value => store(adjustRadiusSelection, { circle: adjustable, radius: Number(value) })))
                  
              })
          } else {
            // Note that for some reason this was not getting the correct
            // circle data ... maybe it wasn't getting patched correctly when the
            // other parts got patched? And it just had a reference to the initial
            // container?
            children
              .textNode(`Adjust Diameter of circle at (${circle.center.x}, ${circle.center.y})`)
          }
        })
    })
}