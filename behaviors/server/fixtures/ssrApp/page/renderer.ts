import { renderToString } from "spheres/server"
import { createStore } from "spheres/store";
import { HTMLBuilder } from "spheres/view";

export function render(): string {
  return renderToString(createStore(), pageView)
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