import { Container, container, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { WithProps } from "@src/index";
import { SVGBuilder } from "@src/svgElements";

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children.
      svg(el => {
        el.config
          .width("500")
          .height("300")
        el.children.
          rect(el => {
            el.config
              .width("100%")
              .height("100%")
              .fill("red")
          })
          .zoneWithTemplate(circle, { id: 1, x: 100, y: 150, label: container({ initialValue: 0 }) })
          .zoneWithTemplate(circle, { id: 2, x: 250, y: 150, label: container({ initialValue: 0 }) })
          .zoneWithTemplate(circle, { id: 3, x: 400, y: 150, label: container({ initialValue: 0 }) })
      })
  })
}

interface CircleProps {
  id: number
  x: number
  y: number
  label: Container<number>
}

function circle(root: SVGBuilder, withProps: WithProps<CircleProps>) {
  root.g(el => {
    el.config
      .dataAttribute("circle-button", withProps((props) => `${props.id}`))
      .on("click", withProps((props) => use(incrementCount, props.label)))
    el.children
      .circle(el => {
        el.config
          .cx(withProps((props) => `${props.x}`))
          .cy(withProps((props) => `${props.y}`))
          .r("50")
          .fill("blue")
      })
      .text(el => {
        el.config
          .x(withProps((props) => `${props.x}`))
          .y(withProps((props) => `${props.y + 20}`))
          .fontSize("60")
          .textAnchor("middle")
          .fill("white")
        el.children
          .textNode(withProps((props, get) => `${get(props.label)}`))
      })
  })
}

const incrementCount = rule((get, counter: Container<number>) => {
  return write(counter, get(counter) + 1)
})