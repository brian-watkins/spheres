import { container, write } from "@spheres/store";
import { HTMLBuilder, SVGBuilder } from "@src/index";

enum Shape {
  None = "none",
  Square = "square",
  Circle = "circle",
  Rectangle = "rectangle"
}

const currentShape = container({ initialValue: Shape.None })

function squareView(root: SVGBuilder) {
  root.rect(el => {
    el.config
      .dataAttribute("shape", "square")
      .x("100")
      .y("100")
      .width("50")
      .height("50")
      .fill("blue")
  })
}

function circleView(root: SVGBuilder) {
  root.circle(el => {
    el.config
      .dataAttribute("shape", "circle")
      .cx("125")
      .cy("125")
      .r("25")
      .fill("blue")
  })
}

function rectangleView(root: SVGBuilder) {
  root.rect(el => {
    el.config
      .dataAttribute("shape", "rectangle")
      .x("100")
      .y("100")
      .width("100")
      .height("50")
      .fill("blue")
  })
}

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => el.children.textNode("Hello!"))
      .select(el => {
        el.config
          .name("shape")
          .on("change", (evt) => {
            const shape = (evt.target as HTMLSelectElement).value as unknown as Shape
            return write(currentShape, shape)
          })
        el.children
          .option(el => {
            el.config
              .value(Shape.None)
              .selected(true)
            el.children.textNode("Select a Shape")
          })
          .option(el => {
            el.config.value(Shape.Square)
            el.children.textNode("Square")
          })
          .option(el => {
            el.config.value(Shape.Circle)
            el.children.textNode("Circle")
          })
          .option(el => {
            el.config.value(Shape.Rectangle)
            el.children.textNode("Rectangle")
          })
      })
      .hr()
      .svg(el => {
        el.config
          .width("300")
          .height("200")
        el.children.subviewOf(select => select
          .when(get => get(currentShape) === "square", squareView)
          .when(get => get(currentShape) === "circle", circleView)
          .when(get => get(currentShape) === "rectangle", rectangleView)
        )
      })
  })
}
