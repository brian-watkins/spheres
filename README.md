# Spheres

Write browser-based web applications. Spheres features:
- state management that separates application logic from state storage details
- a declarative view framework that supports fine-grained reactive updates

Check out the [documentation](https://github.com/brian-watkins/spheres/wiki).

Here's a simple counter app:

```
import { htmlTemplate, renderToDOM } from "spheres/view";
import { container, update, Store } from "spheres/store";

const clickCount = container({ initialValue: 0 })

const counter = htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("counter-text")
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => update(clickCount, (count) => count + 1))
        el.children.textNode("Count!")
      })
  })
})

renderToDOM(new Store(), document.getElementById("app"), counter())
```

Find [more examples here](https://github.com/brian-watkins/spheres/tree/main/examples).

