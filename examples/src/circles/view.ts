import { GetState, batch, write, run, container, StoreMessage, use, rule } from "spheres/store";
import { Circle, CircleContainer, addCircleRule, adjustRadius, adjustRadiusRule, canRedo, canUndo, circleData, deselectCircle, redoRule, selectCircle, undoRule } from "./state";
import { useValue } from "../helpers/helpers";
import { HTMLView, SVGView, WithArgs, htmlTemplate } from "spheres/view";

export const circles = htmlTemplate(() => root =>
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
          .on("click", (evt) => use(addCircleRule, { x: evt.offsetX, y: evt.offsetY }))
        children
          .zone(circleViews)
      })
      .zone(optionsView)
  }))

function circleViews(get: GetState): SVGView {
  const data = get(circleData)

  return root => {
    root.g(({ children }) => {
      for (const circle of data) {
        children.zone(circleView(circle))
      }
    })
  }
}

function circleView(circleContainer: CircleContainer): (get: GetState) => SVGView {
  return (get: GetState) => {
    const circle = get(circleContainer)
    return root => root.circle(({ config }) => {
      config
        .fill(circle.selected ? "#333333" : "transparent")
        .stroke("#555555")
        .strokeWidth("3")
        .cx(`${circle.center.x}`)
        .cy(`${circle.center.y}`)
        .r(`${circle.radius}`)
        .on("mouseover", () => write(circleContainer, selectCircle()))
        .on("click", (evt) => {
          evt.stopPropagation()
          return batch([
            write(dialog, {
              circle: circleContainer,
              originalRadius: circle.radius,
              showDiameterSlider: false,
            }),
            run(() => {
              document.querySelector("dialog")?.showModal()
            })
          ])
        })

      if (get(dialog)?.circle !== circleContainer) {
        config.on("mouseout", () => write(circleContainer, deselectCircle()))
      }
    })
  }
}

// local state for dialog

interface DialogContents {
  circle: CircleContainer
  originalRadius: number
  showDiameterSlider: boolean
}

const dialog = container<DialogContents | undefined>({
  initialValue: undefined
})

function optionsView(get: GetState): HTMLView {
  const dialogData = get(dialog)

  if (dialogData === undefined) {
    return root => root.dialog()
  }

  const circle = get(dialogData.circle)

  return root => {
    root.dialog(({ config, children }) => {
      config
        .class("backdrop:bg-gray-500/50 bg-slate-100 shadow-lg rounded")
        .on("click", closeDialog)
        .on("close", () => {
          return batch([
            use(adjustRadiusRule, {
              circle: dialogData.circle,
              originalRadius: dialogData.originalRadius
            }),
            write(dialogData.circle, deselectCircle()),
            write(dialog, undefined),
          ])
        })
      children
        .div(({ config, children }) => {
          config
            .class("w-96 m-8 bg-slate-100 hover:text-sky-600 font-bold text-sky-800")
            .on("click", () => write(dialog, { ...dialogData, showDiameterSlider: true }))

          if (dialogData.showDiameterSlider) {
            children
              .zone(adjustRadiusView(dialogData.circle))
          } else {
            children
              .textNode(adjustmentMessage(circle))
          }
        })
    })
  }
}

function closeDialog(evt: Event): StoreMessage<any> {
  const target = evt.target as HTMLElement
  return target.tagName === "DIALOG" ?
    run(() => (target as HTMLDialogElement).close()) :
    batch([])
}

const adjustRadiusView = htmlTemplate((withCircle: WithArgs<CircleContainer>) => root =>
  root.div(({ config, children }) => {
    config
      .class("w-96")
    children
      .div(({ config, children }) => {
        config
          .class("text-sky-800 mb-4")
        children
          .textNode(withCircle((circle, get) => adjustmentMessage(get(circle))))
      })
      .input(({ config }) => {
        config
          .class("w-full")
          .name("radius")
          .type("range")
          .max("75")
          .min("2")
          .step("1")
          .value(withCircle((circle, get) => `${get(circle).radius}`))
          .on("input", useValue(value => {
            return use(rule(withCircle(circle => write(circle, adjustRadius(Number(value))))))
          }))
      })
  }))

function adjustmentMessage(circle: Circle): string {
  return `Adjust Diameter of circle at (${circle.center.x}, ${circle.center.y})`
}

const buttonStyle = "disabled:bg-slate-400 hover:bg-sky-800 px-8 py-4 bg-sky-600 text-slate-100 text-xl font-bold"