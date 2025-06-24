import { HTMLBuilder } from "spheres/view";

export function page(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children
          .link(el => {
            el.config
              .rel("icon")
              .href("data:,")
          })
      })
      .body(el => {
        el.children.subview(main)
      })
  })
}

export function main(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .div(el => {
        el.config.dataAttribute("zone", "one")
        el.children.subview(loadingView)
      })
      .hr()
      .div(el => {
        el.config.dataAttribute("zone", "two")
        el.children.subview(loadingView)
      })
      .hr()
      .div(el => {
        el.config.dataAttribute("zone", "three")
        el.children.subview(loadingView)
      })
  })
}

function loadingView(root: HTMLBuilder) {
  root.h2(el => {
    el.children.textNode("Loading ...")
  })
}