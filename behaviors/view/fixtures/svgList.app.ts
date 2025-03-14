import { State, container, use, write } from "@store/index.js";
import { HTMLBuilder, svg, SVGView } from "@view/index.js";

interface Circle {
  label: string
}

interface ListUpdate {
  type: "reorder"
  index: number
}

function putFirst(index: number): ListUpdate {
  return { type: "reorder", index }
}

const circleData = container<Array<Circle>, ListUpdate>({
  initialValue: [
    { label: "apple" },
    { label: "grapes" },
    { label: "pizza" },
  ],
  update(message, current) {
    return {
      value: [ current[message.index], ...current.filter((_, i) => message.index != i) ]
    }
  },
})

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children.
      subview(svg(el => {
        el.config
          .width("500")
          .height("300")
        el.children
          .rect(el => {
            el.config
              .width("100%")
              .height("100%")
              .fill("red")
          })
          .subviews(get => get(circleData), circleView)
      }))
  })
}

function circleView(data: State<Circle>, index: State<number>): SVGView {
  return root =>
    root.g(el => {
      el.config
        .dataAttribute("circle-button", (get) => `${get(index)}`)
        .on("click", () => use(get => write(circleData, putFirst(get(index)))))
      el.children
        .circle(el => {
          el.config
            .cx((get) => `${get(index) * 150 + 100}`)
            .cy("150")
            .r("50")
            .fill("blue")
        })
        .text(el => {
          el.config
            .x((get) => `${get(index) * 150 + 100}`)
            .y("158")
            .fontSize("30")
            .textAnchor("middle")
            .fill("white")
          el.children
            .textNode((get) => `${get(data).label}`)
        })
    })
}
