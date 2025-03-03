import { createStringRenderer } from "spheres/server"
import { createStore } from "spheres/store";
import { HTMLBuilder } from "spheres/view";

const renderToString = createStringRenderer(pageView)

export function render(): string {
  return renderToString(createStore())
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