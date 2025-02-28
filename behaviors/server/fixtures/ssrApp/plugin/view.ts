import { HTMLBuilder } from "spheres/view";
import "./moreStyles.css"
import "./viewStyles.css"
import { superList } from "./helperView";

export function funView(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => {
        el.children.textNode("YO YO YO!!")
      })
      .hr()
      .subview(superList)
  })
}