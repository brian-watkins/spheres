import { GetState, container, write } from "@spheres/store";
import { HTMLView, htmlTemplate } from "@src/index";

const toggleState = container<boolean, string>({
  initialValue: false,
  update: (_, current) => {
    return { value: !current }
  }
})

const visibilityState = container<boolean, string>({
  initialValue: true,
  update: (_, current) => {
    return { value: !current }
  }
})


function multipleRootZone(get: GetState): HTMLView {
  if (get(toggleState)) {
    return root => root.h1(el => {
      el.children.textNode("Big text!")
    })
  } else {
    return root => root.p(el => {
      el.children.textNode("Regular text!")
    })
  }
}

function statefulContainer(get: GetState): HTMLView {
  return root =>
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
        el.children.zone(multipleRootZone)
      }
    })
}

export default htmlTemplate(() => root => {
  root.zone(statefulContainer)
})