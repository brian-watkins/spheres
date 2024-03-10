import { GetState, container, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";

const toggleState = container<boolean, string>({
  initialValue: false,
  reducer: (_, current) => {
    return !current
  }
})

const visibilityState = container<boolean, string>({
  initialValue: true,
  reducer: (_, current) => {
    return !current
  }
})


function multipleRootZone(root: HTMLBuilder, get: GetState) {
  if (get(toggleState)) {
    root.h1(el => {
      el.children.textNode("Big text!")
    })
  } else {
    root.p(el => {
      el.children.textNode("Regular text!")
    })
  }
}

function statefulContainer(root: HTMLBuilder, get: GetState) {
  root.div(el => {
    el.children
      .button(el => {
        el.config
          .dataAttribute("toggle")
          .on("click", () => write(toggleState, "toggle"))
        el.children
          .textNode("Click to toggle!")
      })
      .button(el => {
        el.config
          .dataAttribute("visibility")
          .on("click", () => write(visibilityState, "toggle"))
        el.children
          .textNode(get => get(visibilityState) ? "Click to hide" : "Click to show")
      })
    
      if (get(visibilityState)) {
        el.children.zoneWithState(multipleRootZone)
      }
  })
}

export default function view(root: HTMLBuilder) {
  root.zoneWithState(statefulContainer)
}