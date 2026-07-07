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
- `children` — a builder for child nodes. Chain element calls and `textNode`/`subview`/`subviews`/`subviewMatching`.

A view function isn't limited to a single root element — chain multiple calls directly on `root` to render a **fragment**: several sibling nodes with no wrapping element. See [Fragments](#fragments) below.

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
  view: (use: UseItem<T>) => HTMLView
): this
```

Render a list that updates when the array changes. `UseItem<T>` gives the view function reactive access to a `ListItem<T>` (`{ data: T, index: number }`) and a `get`:

```ts
function itemView(useItem: UseItem<Item>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(useItem((item, get) =>
        `${item.data.name} at ${item.index}`
      ))
    })
  }
}

root.ul(el => {
  el.children.subviews(get => get(items), itemView)
})
```

Spheres tracks list items internally and updates only the ones that actually changed.

### subviewMatching — reactive switch

Pick one view to render based on state. The matcher exposes two cases:

- `withUnion<T>(unionValue)` — for discriminated unions. Each `when` takes a **type predicate** that narrows `T` to a subtype `X`, and a view generator `(useCase: UseCase<X>) => ViewDefinition`. `UseCase<T>` is like `UseItem<T>` but exposes the value directly (not wrapped in a `ListItem`): `useCase((value, get) => ...)`. The first predicate to match wins; `default` provides a fallback.
- `withConditions()` — for plain boolean checks. Each `when` takes a stateful predicate `(get) => boolean` and a `ViewDefinition`. The first predicate to return `true` wins; `default` provides a fallback.

Union example — a `Result` is either `Loading`, `Loaded`, or `Failed`:

```ts
type Result =
  | { kind: "loading" }
  | { kind: "loaded", data: string }
  | { kind: "failed", error: string }

const isLoading = (r: Result): r is { kind: "loading" } => r.kind === "loading"
const isLoaded = (r: Result): r is { kind: "loaded", data: string } => r.kind === "loaded"

root.div(el => {
  el.children.subviewMatching(matcher => {
    matcher
      .withUnion(get => get(result))
      .when(isLoading, () => (root) => {
        root.p(el => el.children.textNode("Loading…"))
      })
      .when(isLoaded, useCase => (root) => {
        root.p(el => el.children.textNode(useCase((r, get) => r.data)))
      })
      .default(useCase => (root) => {
        root.p(el => el.children.textNode(useCase((r, get) => `Error: ${(r as any).error}`)))
      })
  })
})
```

Conditions example:

```ts
root.div(el => {
  el.children.subviewMatching(matcher => {
    matcher
      .withConditions()
      .when(get => get(route) === "home", homeView)
      .when(get => get(route) === "account", accountView)
      .when(get => get(route) === "messages", messagesView)
      .default(errorView)
  })
})
```

## Fragments

A view function doesn't have to build a single root element. Chain multiple calls directly on `root` and each one appends another sibling node — no wrapping `div` required:

```ts
const view: HTMLView = (root) => {
  root
    .p(el => el.children.textNode("This is the first paragraph."))
    .p(el => el.children.textNode("This is the second paragraph."))
}
```

Anything chainable on `children` is chainable on `root` this way, including `textNode`, `subview`, `subviews`, and `subviewMatching`:

```ts
const view: HTMLView = (root) => {
  root
    .h1(el => el.children.textNode("This is a fragment!"))
    .p(el => el.children.textNode(get => `Clicks: ${get(counter)}`))
    .button(el => {
      el.config.on("click", () => update(counter, val => val + 1))
      el.children.textNode("Click me!")
    })
}
```

Fragments compose naturally with the rest of the API:
- `subview(fragmentView)` splices the fragment's nodes in as ordinary siblings among whatever else the enclosing view renders — there's no wrapper element introduced.
- A `subviewMatching` branch (or `default`) can resolve to a fragment view; the whole set of nodes is swapped in when the match changes.
- A `subviews` item view can be a fragment; Spheres tracks each item's full node range so reordering, inserting, and removing still work per item.
- `renderToDOM` mounts directly into the container `element` you pass it, so a top-level fragment view just appends its nodes as children of that container — there's no extra wrapper node.

Because a fragment has no single root element, there's nowhere to hang shared `config` (attributes/events) — configure each top-level node independently.

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
- `subviews` and `subviewMatching` update structure reactively; use them instead of conditional imperative logic.
- `innerHTML` and `children` are mutually exclusive.
- A view can render a fragment (multiple sibling nodes chained on `root`) instead of a single root element; there's no shared `config` across a fragment's top-level nodes.
