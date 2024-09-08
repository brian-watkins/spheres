import { batch, write, run, StoreMessage, State, use } from "spheres/store";
import { CircleContainer, addCircleRule, adjustRadius, adjustRadiusRule, canRedo, canUndo, circleData, deselectCircle, dialog, redoRule, selectCircle, undoRule } from "./state";
import { useValue } from "../helpers/helpers";
import { HTMLBuilder, SVGView } from "../../../src/view";

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
      .svg(({ config, children }) => {
        config
          .dataAttribute("canvas")
          .width("100%")
          .height("400")
          .class("bg-slate-300 rounded")
          .on("click", (evt) => use(addCircleRule({ x: evt.offsetX, y: evt.offsetY })))
        children
          .zones(get => get(circleData), circleView)
      })
      .zone(optionsView)
  })
}

function circleView(circle: State<CircleContainer>): SVGView {
  return root => {
    root.circle(el => {
      el.config
        .fill(get => get(get(circle)).selected ? "#333333" : "transparent")
        .stroke("#555555")
        .strokeWidth("3")
        .cx(get => `${get(get(circle)).center.x}`)
        .cy(get => `${get(get(circle)).center.y}`)
        .r(get => `${get(get(circle)).radius}`)
        .on("mouseover", () => use(get => write(get(circle), selectCircle())))
        .on("click", (evt) => {
          evt.stopPropagation()
          return batch([
            use(get => write(dialog, {
              circle: get(circle),
              originalRadius: get(get(circle)).radius,
              showDiameterSlider: false,
            })),
            run(() => {
              document.querySelector("dialog")?.showModal()
            })
          ])
        })
        .on("mouseout", () => use(get => {
          if (get(dialog)?.circle !== get(circle)) {
            return write(get(circle), deselectCircle())
          } else {
            return undefined
          }
        }))
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
          use(get => write(get(dialog)!.circle, deselectCircle())),
          write(dialog, undefined),
        ])
      })
    children
      .div(({ config, children }) => {
        config
          .class("w-96 m-8 bg-slate-100 hover:text-sky-600 font-bold text-sky-800")
          .on("click", () => use(get => write(dialog, { ...get(dialog)!, showDiameterSlider: true })))
        children
          .zoneWhich(get => get(dialog)?.showDiameterSlider ? "adjustRadius" : "message", {
            adjustRadius: adjustRadiusView,
            message: adjustmentMessage
          })
      })
  })
}

function closeDialog(evt: Event): StoreMessage<any> {
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
          .zone(adjustmentMessage)
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