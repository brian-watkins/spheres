import { batch, write, use, update, Stateful, exec } from "spheres/store";
import { Circle, CircleContainer, addCircleRule, adjustRadius, canRedo, canUndo, circleData, closeDialogRule, deselectCircle, dialog, redoRule, selectCircle, undoRule } from "./state";
import { useValue } from "../helpers/helpers";
import { elementIdentifier, HTMLBuilder, svg, SVGView, UseItem } from "spheres/view";
import { showPopover } from "./popover";

const canvasId = elementIdentifier()

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
          .elementIdentifier(canvasId)
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

function useCircle(useData: UseItem<CircleContainer>): <S>(handler: (circle: Circle) => S) => Stateful<S> {
  return (handler) => useData((circleContainer, get) => handler(get(circleContainer.data)))
}

function circleView(useItem: UseItem<CircleContainer>): SVGView {
  const withCircle = useCircle(useItem)

  const circleId = elementIdentifier()

  return root => {
    root.circle(el => {
      el.config
        .elementIdentifier(circleId)
        .fill(withCircle((circle) => circle.selected ? "#333333" : "transparent"))
        .stroke("#555555")
        .strokeWidth("3")
        .cx(withCircle(circle => `${circle.center.x}`))
        .cy(withCircle(circle => `${circle.center.y}`))
        .r(withCircle(circle => `${circle.radius}`))
        .on("mouseover", () => use(useItem((circle) => write(circle.data, selectCircle()))))
        .on("click", (evt) => {
          evt.stopPropagation()
          return batch([
            use(useItem((circle, get) => write(dialog, {
              circle: circle.data,
              originalRadius: get(circle.data).radius,
              showDiameterSlider: false,
            }))),
            exec(showPopover, {
              reference: circleId,
              popover: optionsViewId,
              arrow: arrowIdentifier,
              boundary: canvasId
            })
          ])
        })
        .on("mouseout", () => use(useItem((circle, get) => {
          if (get(dialog)?.circle !== circle.data) {
            return write(circle.data, deselectCircle())
          } else {
            return undefined
          }
        })))
    })
  }
}

const optionsViewId = elementIdentifier<HTMLElement>()
const arrowIdentifier = elementIdentifier<HTMLElement>()

function optionsView(root: HTMLBuilder) {
  root.div(({ config, children }) => {
    config
      .elementIdentifier(optionsViewId)
      .dataAttribute("circle-options")
      .popover("auto")
      .class("fixed inset-auto m-0 overflow-visible p-8 shadow-lg bg-slate-100 hover:text-sky-800 font-bold text-sky-600 rounded")
      .on("click", () => update(dialog, d => d && ({ ...d, showDiameterSlider: true })))
      .on("toggle", (evt) => {
        return (evt as ToggleEvent).newState === "closed" ? use(closeDialogRule) : batch([])
      })
    children
      .subviewMatching(matcher => matcher.withConditions()
        .when(get => get(dialog)?.showDiameterSlider ?? false, adjustRadiusView)
        .default(adjustmentMessage)
      )
      .div(el => {
        el.config.elementIdentifier(arrowIdentifier)
          .class("absolute rounded size-4 rotate-45 bg-slate-100")
      })
  })
}

function adjustRadiusView(root: HTMLBuilder) {
  root.div(({ children }) => {
    children
      .div(({ config, children }) => {
        config
          .class("text-sky-600 mb-4")
        children
          .subview(adjustmentMessage)
      })
      .input(({ config }) => {
        config
          .class("w-full accent-sky-600")
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
