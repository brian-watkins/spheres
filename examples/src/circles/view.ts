import { batch, write, run, StoreMessage, use, update, Stateful } from "spheres/store";
import { Circle, CircleContainer, addCircleRule, adjustRadius, adjustRadiusRule, canRedo, canUndo, circleData, deselectCircle, dialog, redoRule, selectCircle, undoRule } from "./state";
import { useValue } from "../helpers/helpers";
import { HTMLBuilder, svg, SVGView, UseData } from "../../../src/view";

export function circles(root: HTMLBuilder) {
  root.main(({ children }) => {
    children
      .div(({ config, children }) => {
        config
          .class("flex gap-4 bg-slate-100 mb-4")
        children
          .button(({ config, children }) => {
            config
              .class(`${buttonStyle} grow`)
              .disabled(get => !get(canUndo))
              .on("click", () => use(undoRule))
            children
              .textNode("Undo")
          })
          .button(({ config, children }) => {
            config
              .class(`${buttonStyle} grow`)
              .disabled(get => !get(canRedo))
              .on("click", () => use(redoRule))
            children
              .textNode("Redo")
          })
      })
      .subview(svg(({ config, children }) => {
        config
          .dataAttribute("canvas")
          .width("100%")
          .height("400")
          .class("bg-slate-300 rounded")
          .on("click", (evt) => use(addCircleRule({ x: evt.offsetX, y: evt.offsetY })))
        children
          .subviews(get => get(circleData), circleView)
      }))
      .subview(optionsView)
  })
}

function useCircle(useData: UseData<CircleContainer>): <S>(handler: (circle: Circle) => S) => Stateful<S> {
  return (handler) => useData((circleContainer, get) => handler(get(circleContainer)))
}

function circleView(useData: UseData<CircleContainer>): SVGView {
  const withCircle = useCircle(useData)

  return root => {
    root.circle(el => {
      el.config
        .fill(withCircle((circle) => circle.selected ? "#333333" : "transparent"))
        .stroke("#555555")
        .strokeWidth("3")
        .cx(withCircle(circle => `${circle.center.x}`))
        .cy(withCircle(circle => `${circle.center.y}`))
        .r(withCircle(circle => `${circle.radius}`))
        .on("mouseover", () => use(useData((circle) => write(circle, selectCircle()))))
        .on("click", (evt) => {
          evt.stopPropagation()
          return batch([
            use(useData((circle, get) => write(dialog, {
              circle: circle,
              originalRadius: get(circle).radius,
              showDiameterSlider: false,
            }))),
            run(() => {
              document.querySelector("dialog")?.showModal()
            })
          ])
        })
        .on("mouseout", () => use(useData((circle, get) => {
          if (get(dialog)?.circle !== circle) {
            return write(circle, deselectCircle())
          } else {
            return undefined
          }
        })))
    })
  }
}


function optionsView(root: HTMLBuilder) {
  root.dialog(({ config, children }) => {
    config
      .class("backdrop:bg-gray-500/50 bg-slate-100 shadow-lg rounded")
      .on("click", closeDialog)
      .on("close", () => {
        return batch([
          use(adjustRadiusRule),
          use(get => write(get(dialog)!.circle, deselectCircle()))
        ])
      })
    children
      .div(({ config, children }) => {
        config
          .class("w-96 m-8 bg-slate-100 hover:text-sky-600 font-bold text-sky-800")
          .on("click", () => update(dialog, d => d && ({ ...d, showDiameterSlider: true })))
        children
          .subviewFrom(select => select.withConditions()
            .when(get => get(dialog)?.showDiameterSlider ?? false, adjustRadiusView)
            .default(adjustmentMessage)
          )
      })
  })
}

function closeDialog(evt: Event): StoreMessage {
  const target = evt.target as HTMLElement
  return target.tagName === "DIALOG" ?
    run(() => (target as HTMLDialogElement).close()) :
    batch([])
}

function adjustRadiusView(root: HTMLBuilder) {
  root.div(({ config, children }) => {
    config
      .class("w-96")
    children
      .div(({ config, children }) => {
        config
          .class("text-sky-800 mb-4")
        children
          .subview(adjustmentMessage)
      })
      .input(({ config }) => {
        config
          .class("w-full")
          .name("radius")
          .type("range")
          .max("75")
          .min("2")
          .step("1")
          .value(get => `${get(get(dialog)!.circle).radius}`)
          .on("input", useValue(value => {
            return use(get => write(get(dialog)!.circle, adjustRadius(Number(value))))
          }))
      })
  })
}

function adjustmentMessage(root: HTMLBuilder) {
  root.textNode(get => {
    const dialogData = get(dialog)
    if (dialogData === undefined) {
      return ""
    } else {
      const circle = get(dialogData.circle)
      return `Adjust Diameter of circle at (${circle.center.x}, ${circle.center.y})`
    }
  })
}

const buttonStyle = "disabled:bg-slate-400 hover:bg-sky-800 px-8 py-4 bg-sky-600 text-slate-100 text-xl font-bold"
