import { GetState, container, write } from "@spheres/store";
import { SVGView, htmlTemplate } from "@src/index";

const message = container({ initialValue: "SVG" })

export default htmlTemplate(() => root => {
  root.main(({ children }) => {
    children
      .form(({ children }) => {
        children
          .input(({ config }) => {
            config
              .type("text")
              .on("input", (evt) => write(message, (evt.target as HTMLInputElement).value))
          })
      })
      .svg(({ config, children }) => {
        config
          .width("300")
          .height("200")

        children
          .rect(({ config }) => [
            config
              .width("100%")
              .height("100%")
              .fill("red")
          ])
          .circle(({ config }) => {
            config
              .cx("150")
              .cy("100")
              .r("80")
              .fill("green")
          })
          .zone(circle)
      })
  })
})

function circle(get: GetState): SVGView {
  const text = get(message)

  return root =>
    root.text(({ config, children }) => {
      config
        .x("150")
        .y("125")
        .fontSize("60")
        .textAnchor("middle")
        .fill("white")
      children
        .textNode(text)
    })
}