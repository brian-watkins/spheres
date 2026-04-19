# spheres/view — API Reference

Build browser-based views as functions of application state, with fine-grained reactive updates. Views are synchronous functions that operate on an `HTMLBuilder` or `SVGBuilder`. No components, no props, no hooks — only functions and state tokens.

## Types

```ts
type HTMLView = (root: HTMLBuilder) => void
type SVGView = (root: SVGBuilder) => void
type Stateful<T> = (get: GetState) => T | undefined
```

An element's configuration function receives a `ConfigurableElement` with two properties:
- `config` — attribute and event setters for this element.
- `children` — a builder for child nodes. Chain element calls and `textNode`/`subview`/`subviews`/`subviewOf`.

## Element functions

Builders (`HTMLBuilder`, `SVGBuilder`, `children`) expose one function per valid HTML or SVG tag (`div`, `a`, `button`, `circle`, etc). Each takes a configuration function.

```ts
root.div(el => {
  el.config
    .class("card")
    .dataAttribute("kind", "primary")
  el.children
    .h1(el => el.children.textNode("Hello"))
    .p(el => el.children.textNode("World"))
})
```

### element — arbitrary tag

```ts
root.element("my-custom-element", ({ config, children }) => { /* ... */ })
```

For custom elements or tags not directly exposed on the builder.

### textNode

```ts
textNode(value: string | Stateful<string>): this
```

Add a text node. Pass a literal or a reactive function. Only the text content is updated when the referenced tokens change.

```ts
el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
```

### subview

Inline another view function into this one.

```ts
el.children.subview(headerView)
```

Accepts an `HTMLView` on `HTMLBuilder`, an `SVGView` on `SVGBuilder`.

### svg

Embed SVG inside HTML via `subview`.

```ts
root.main(el => {
  el.children.subview(svg(el => {
    el.config.width("300").height("200")
    el.children.circle(el => {
      el.config.cx("150").cy("100").r("80").fill("green")
    })
  }))
})
```

### subviews — reactive lists

```ts
subviews<T>(
  items: (get: GetState) => Array<T>,
  view: (use: UseData<T>) => HTMLView
): this
```

Render a list that updates when the array changes. `UseData<T>` gives the view function reactive access to the item, a `get`, and an index token:

```ts
function itemView(useItem: UseData<Item>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(useItem((item, get, index) =>
        `${item.name} at ${get(index)}`
      ))
    })
  }
}

root.ul(el => {
  el.children.subviews(get => get(items), itemView)
})
```

Spheres tracks list items internally and updates only the ones that actually changed.

### subviewOf — reactive switch

Pick one view to render based on state. `when` takes a stateful predicate and a view; the first predicate to return `true` wins. `default` provides a fallback.

```ts
root.div(el => {
  el.children.subviewOf(selector => {
    selector
      .when(get => get(route) === "home", homeView)
      .when(get => get(route) === "account", accountView)
      .when(get => get(route) === "messages", messagesView)
      .default(errorView)
  })
})
```

## Stateful attributes

Every attribute function accepts a literal or a `Stateful<T>`. Only the specific attribute is updated when the read tokens change — no parent re-render.

```ts
el.config.class(get => get(isError) ? "error" : "ok")
```

### Special `config` functions

```ts
config.attribute(name: string, value: string | Stateful<string>)
```
Arbitrary attribute by name.

```ts
config.dataAttribute(name: string, value?: string | Stateful<string>)
```
`data-*` attribute. Call without a value to emit a boolean-style attribute.

```ts
config.aria(name: string, value: string | Stateful<string>)
```
`aria-*` attribute.

```ts
config.innerHTML(html: string | Stateful<string>)
```
Set raw HTML content. Children defined on the element are ignored if `innerHTML` is set.

### on — event handlers

```ts
config.on(event: string, handler: (e: Event) => StoreMessage<any>)
```

The handler **must return a `StoreMessage`**. Spheres dispatches it to the store associated with the view. Do not call `store.dispatch` from inside the handler — just return the message.

```ts
el.config.on("click", () => update(clickCount, c => c + 1))
el.config.on("submit", (e) => {
  e.preventDefault()
  return write(formState, readFormData(e.target))
})
```

For multiple dispatches in response to one event, return a `batch([...])`.

## Rendering

### renderToDOM

```ts
interface RenderResult {
  root: Node
  unmount: () => void
}
function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult
```

Mount a view into a DOM element. `element` is replaced by the rendered view. Returns the root node and an `unmount` function.

A single application may have multiple stores and multiple `renderToDOM` calls — each view dispatches to the store it was mounted with.

## Patterns

### Share state across views

Declare tokens at module scope and import them wherever needed. Tokens are just handles — the same token used in two different views backed by the same store will reflect the same value.

### Parameterizing views

Since there are no props, "props" are simply function arguments. A helper that produces an `HTMLView`:

```ts
function labeledButton(label: string, onClick: () => StoreMessage<any>): HTMLView {
  return (root) => {
    root.button(el => {
      el.config.on("click", onClick)
      el.children.textNode(label)
    })
  }
}

// usage
root.div(el => {
  el.children.subview(labeledButton("Save", () => write(saving, true)))
})
```

### Deriving computed view values

Prefer a `derived` token over recomputing in every `Stateful` callback when the value is shared:

```ts
const unreadCount = derived(get => get(messages).filter(m => !m.read).length)

root.span(el => {
  el.children.textNode(get => `(${get(unreadCount)})`)
})
```

### Forms

Event handlers return messages built from the event:

```ts
root.input(el => {
  el.config
    .type("text")
    .value(get => get(name))
    .on("input", (e) => write(name, (e.target as HTMLInputElement).value))
})
```

## Things to get right

- Handlers **return** messages — they don't dispatch.
- `textNode`, attributes, and view selectors accept `Stateful` functions; use them freely for fine-grained updates.
- Declare tokens at module scope (or setup code), not inside view functions.
- Don't read tokens outside a reactive context — `get` is only available where spheres passes it in.
- `subviews` and `subviewOf` update structure reactively; use them instead of conditional imperative logic.
- `innerHTML` and `children` are mutually exclusive.
