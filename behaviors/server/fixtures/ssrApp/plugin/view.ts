import { HTMLBuilder } from "@view/index.js";

export function funView(root: HTMLBuilder) {
  root.h1(el => {
    el.children.textNode("YO YO YO!!")
  })
}