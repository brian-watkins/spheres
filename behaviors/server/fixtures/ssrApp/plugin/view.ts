import { HTMLBuilder } from "@view/index.js";
import "./moreStyles.css"

export function funView(root: HTMLBuilder) {
  root.h1(el => {
    el.children.textNode("YO YO YO!!")
  })
}