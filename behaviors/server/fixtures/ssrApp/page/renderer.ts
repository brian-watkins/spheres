import { renderToString } from "@server/index";
import { createStore } from "@store/store";
import { HTMLBuilder } from "@view/htmlElements";
import { context } from "virtual:spheres/vite"

export function render(): string {
  return renderToString(createStore(), pageView, context)
}

function pageView(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children.script(el => el.config.type("module").src("/src/index.ts"))
      })
      .body(el => {
        el.children.h1(el => el.children.textNode("Hello!"))
      })
  })
}