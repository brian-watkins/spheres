# spheres/view — API Reference

Build browser-based views as functions of application state, with fine-grained reactive updates.
Views are synchronous functions that operate on an `HTMLBuilder` or `SVGBuilder`. No components, no
props, no hooks — only functions and state tokens.

## Types

```ts
type HTMLView = (root: HTMLBuilder) => void
type SVGView = (root: SVGBuilder) => void
type Stateful<T> = (get: GetState) => T | undefined
```

An element's configuration function receives a `ConfigurableElement` with two properties:

- `config` — attribute and event setters for this element.
- `children` — a builder for child nodes. Chain element calls and
  `textNode`/`subview`/`subviews`/`subviewMatching`.

A view function isn't limited to a single root element — chain multiple calls directly on `root` to
render a **fragment**: several sibling nodes with no wrapping element. See [Fragments](#fragments)
below.

## Element functions

Builders (`HTMLBuilder`, `SVGBuilder`, `children`) expose one function per valid HTML or SVG tag
(`div`, `a`, `button`, `circle`, etc). Each takes a configuration function.

```ts
root.div((el) => {
  el.config.class("card").dataAttribute("kind", "primary")
  el.children.h1((el) => el.children.textNode("Hello")).p((el) => el.children.textNode("World"))
})
```

### element — arbitrary tag

```ts
root.element("my-custom-element", ({ config, children }) => {
  /* ... */
})
```

For custom elements or tags not directly exposed on the builder.

### textNode

```ts
textNode(value: string | Stateful<string>): this
```

Add a text node. Pass a literal or a reactive function. Only the text content is updated when the
referenced tokens change.

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
root.main((el) => {
  el.children.subview(
    svg((el) => {
      el.config.width("300").height("200")
      el.children.circle((el) => {
        el.config.cx("150").cy("100").r("80").fill("green")
      })
    }),
  )
})
```

### subviews — reactive lists

```ts
subviews<T>(
  items: (get: GetState) => ReadonlyArray<T>,
  view: (use: UseItem<T>) => HTMLView
): this
```

Render a list that updates when the array changes. `UseItem<T>` gives the view function reactive
access to a `ListItem<T>` (`{ data: T, index: number }`) and a `get`:

```ts
function itemView(useItem: UseItem<Item>): HTMLView {
  return (root) => {
    root.li((el) => {
      el.children.textNode(useItem((item, get) => `${item.data.name} at ${item.index}`))
    })
  }
}

root.ul((el) => {
  el.children.subviews((get) => get(items), itemView)
})
```

Spheres tracks list items internally and updates only the ones that actually changed.

**Item values must be unique within the list.** Spheres keys its diff on the item value itself, so
two equal values collide and the list will not render correctly. For primitive data (a list of
numbers or strings) that can repeat, map it to objects — object items are keyed by reference, so
duplicates of equal shape are fine.

### subviewMatching — reactive switch

Pick one view to render based on state. The matcher exposes two cases:

- `withUnion<T>(unionValue)` — for discriminated unions. Each `when` takes a **type predicate** that
  narrows `T` to a subtype `X`, and a view generator `(useCase: UseCase<X>) => ViewDefinition`.
  `UseCase<T>` is like `UseItem<T>` but exposes the value directly (not wrapped in a `ListItem`):
  `useCase((value, get) => ...)`. The first predicate to match wins; `default` provides a fallback.
- `withConditions()` — for plain boolean checks. Each `when` takes a stateful predicate
  `(get) => boolean` and a `ViewDefinition`. The first predicate to return `true` wins; `default`
  provides a fallback.

Union example — a `Result` is either `Loading`, `Loaded`, or `Failed`:

```ts
type Result =
  { kind: "loading" } | { kind: "loaded"; data: string } | { kind: "failed"; error: string }

const isLoading = (r: Result): r is { kind: "loading" } => r.kind === "loading"
const isLoaded = (r: Result): r is { kind: "loaded"; data: string } => r.kind === "loaded"

root.div((el) => {
  el.children.subviewMatching((matcher) => {
    matcher
      .withUnion((get) => get(result))
      .when(isLoading, () => (root) => {
        root.p((el) => el.children.textNode("Loading…"))
      })
      .when(isLoaded, (useCase) => (root) => {
        root.p((el) => el.children.textNode(useCase((r, get) => r.data)))
      })
      .default((useCase) => (root) => {
        root.p((el) => el.children.textNode(useCase((r, get) => `Error: ${(r as any).error}`)))
      })
  })
})
```

Conditions example:

```ts
root.div((el) => {
  el.children.subviewMatching((matcher) => {
    matcher
      .withConditions()
      .when((get) => get(route) === "home", homeView)
      .when((get) => get(route) === "account", accountView)
      .when((get) => get(route) === "messages", messagesView)
      .default(errorView)
  })
})
```

## Fragments

A view function doesn't have to build a single root element. Chain multiple calls directly on `root`
and each one appends another sibling node — no wrapping `div` required:

```ts
const view: HTMLView = (root) => {
  root
    .p((el) => el.children.textNode("This is the first paragraph."))
    .p((el) => el.children.textNode("This is the second paragraph."))
}
```

Anything chainable on `children` is chainable on `root` this way, including `textNode`, `subview`,
`subviews`, and `subviewMatching`:

```ts
const view: HTMLView = (root) => {
  root
    .h1((el) => el.children.textNode("This is a fragment!"))
    .p((el) => el.children.textNode((get) => `Clicks: ${get(counter)}`))
    .button((el) => {
      el.config.on("click", () => update(counter, (val) => val + 1))
      el.children.textNode("Click me!")
    })
}
```

Fragments compose naturally with the rest of the API:

- `subview(fragmentView)` splices the fragment's nodes in as ordinary siblings among whatever else
  the enclosing view renders — there's no wrapper element introduced.
- A `subviewMatching` branch (or `default`) can resolve to a fragment view; the whole set of nodes
  is swapped in when the match changes.
- A `subviews` item view can be a fragment; Spheres tracks each item's full node range so
  reordering, inserting, and removing still work per item.
- `renderToDOM` mounts directly into the container `element` you pass it, so a top-level fragment
  view just appends its nodes as children of that container — there's no extra wrapper node.

Because a fragment has no single root element, there's nowhere to hang shared `config`
(attributes/events) — configure each top-level node independently.

## Shadow DOM

### shadowRoot — attach a shadow root to an element

```ts
config.shadowRoot(builder: (el: ConfigurableElement<TemplateElementAttributes, HTMLBuilder>) => void)
```

Attach a shadow root to an element. The builder receives a `config` for the shadow root options and
a `children` builder for the shadow root's content. The element's own `children` become its light
DOM, which the shadow content can project with `slot`.

```ts
root.div((el) => {
  el.config.shadowRoot((el) => {
    el.config.shadowrootmode("open")
    el.children.p((el) => el.children.textNode((get) => `Count: ${get(counter)}`)).slot()
  })
  el.children.button((el) => {
    el.config.on("click", () => update(counter, (c) => c + 1))
    el.children.textNode("Increment")
  })
})
```

Shadow root options, set on the builder's `config`:

- `shadowrootmode("open" | "closed")` — defaults to `"open"` when omitted.
- `shadowrootdelegatesfocus(true)` — focusing the host moves focus to the first focusable element in
  the shadow root.
- `shadowrootclonable(true)`, `shadowrootserializable(true)`,
  `shadowrootcustomelementregistry(...)`.

`shadowRoot` is only available on elements that the platform allows as shadow hosts: `article`,
`aside`, `blockquote`, `body`, `div`, `footer`, `h1`–`h6`, `header`, `main`, `nav`, `p`, `section`,
`span`, and arbitrary tags created with `element(...)` (for custom elements).

How it renders:

- **Client (`renderToDOM`, list items, matched views)** — Spheres calls `attachShadow` with the
  options and renders the content into the shadow root.
- **Server (`createStringRenderer`, `createStreamRenderer`)** — the shadow root is emitted as
  declarative shadow DOM: a `<template shadowrootmode="...">` as the element's first child. The
  browser's parser turns it into a real shadow root, and `activateZone` wires up effects inside it.
  Streamed zones are mounted with `setHTMLUnsafe`, so declarative shadow roots in streamed zone
  content work too.

Shadow root content is built like any other view: stateful text and attributes and event handlers
(which return messages as usual) all work inside it. State isn't blocked by the shadow boundary, so
a button outside the shadow root can update text inside it and vice versa. Shadow roots also work
inside `subviews` item views, including items added after activation.

Caution: when server rendering, reactive content inside a **closed** shadow root is not activated
(the host's `shadowRoot` is not reachable). Use `"open"` (the default) for shadow content that has
state or events and is server rendered.

### template — static templates and hand-written declarative shadow DOM

`children.template(...)` renders a `<template>` element. Its content must be **static** — stateful
text, stateful attributes, event handlers, and lists inside a template are not supported. On the
server it renders as a normal `<template>`; on the client it is skipped (nothing is added to the
DOM), and activation skips over it.

Prefer `config.shadowRoot` for shadow DOM. Use a raw `template` with `shadowrootmode` only when
server rendering a declarative shadow root for a **custom element** that hydrates it itself:

```ts
root.element("shadow-card", (el) => {
  el.children.template((el) => {
    el.config.shadowrootmode("open")
    el.children.p((el) => el.children.textNode("In the shadows!"))
  })
})
```

A hand-written declarative shadow root only takes effect in server-rendered HTML, where the
browser's parser handles it. When the same view renders on the client (or as a list item added
later), Spheres renders nothing for the template. So the custom element must attach its own shadow
root when it's missing, typically by checking `this.attachInternals().shadowRoot` in its constructor
and calling `attachShadow` if it's `null`.

## Stateful attributes

Every attribute function accepts a literal or a `Stateful<T>`. Only the specific attribute is
updated when the read tokens change — no parent re-render.

```ts
el.config.class((get) => (get(isError) ? "error" : "ok"))
```

### Special `config` functions

```ts
config.elementIdentifier(id: ElementIdentifier<El>)
```

Associate this element with an identifier so a command manager can resolve the actual DOM element
later. See [Working with DOM elements](#working-with-dom-elements).

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

The handler **must return a `StoreMessage`**. Spheres dispatches it to the store associated with the
view. Do not call `store.dispatch` from inside the handler — just return the message.

```ts
el.config.on("click", () => update(clickCount, (c) => c + 1))
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

Mount a view into a DOM element. `element` is replaced by the rendered view. Returns the root node
and an `unmount` function.

A single application may have multiple stores and multiple `renderToDOM` calls — each view
dispatches to the store it was mounted with.

## Working with DOM elements

Views never hand you a DOM node, and there are no refs. When app logic genuinely needs a real
element — focus, `showPopover`, measuring geometry, handing a node to a third-party library like
floating-ui — you _identify_ the element in the view and _resolve_ the identifier inside a command
manager.

```ts
function elementIdentifier<T extends Element = Element>(): ElementIdentifier<T>

type GetElement = <T extends Element>(id: ElementIdentifier<T>) => T

interface DomCommandActions extends CommandActions {
  getElement: GetElement
}
interface DomCommandManager<M> {
  exec(message: M, actions: DomCommandActions): void
}

function withDomActions<M>(manager: DomCommandManager<M>): CommandManager<M>
```

Three steps:

1. Create an identifier with `elementIdentifier<T>()`. The type parameter is what `getElement`
   returns, so use the specific element type (`HTMLInputElement`, `SVGCircleElement`, …).
2. Attach it in the view with `config.elementIdentifier(id)`.
3. Write a `DomCommandManager` and register it with
   `useCommand(store, someCommand, withDomActions(manager))`. `withDomActions` decorates a normal
   `CommandManager`, adding `getElement` to the usual `CommandActions` (`get`, `supply`,
   `dispatch`).

```ts
import { elementIdentifier, withDomActions, DomCommandActions } from "spheres/view"
import { command, exec, useCommand } from "spheres/store"

const focusField = command<{ field: ElementIdentifier<HTMLInputElement> }>()

useCommand(
  store,
  focusField,
  withDomActions({
    exec(message, actions: DomCommandActions) {
      actions.getElement(message.field).focus()
    },
  }),
)

const nameField = elementIdentifier<HTMLInputElement>()

function form(root: HTMLBuilder) {
  root.form((el) => {
    el.children
      .input((el) => {
        el.config.elementIdentifier(nameField).type("text")
      })
      .button((el) => {
        el.config.on("click", () => exec(focusField, { field: nameField }))
        el.children.textNode("Focus the name field")
      })
  })
}
```

Notes:

- Identifiers are values, so pass them around freely — put them in a command message (as above) to
  make one manager work over many elements.
- An identifier declared **inside a `subviews` item view is scoped to that item**, exactly like a
  token declared there (see [View-local state](#view-local-state)). Every rendered item gets its own
  identifier binding, so `getElement` inside a command dispatched from an item resolves that item's
  element.
- Resolving an identifier that was never attached to a rendered element **throws**. Guard by only
  dispatching from views where the element exists.
- `getElement` is only available inside a manager wrapped with `withDomActions` — there's no way to
  reach a DOM node from a view function, `Stateful` callback, or event handler.
- Server rendering ignores `elementIdentifier` (there's no DOM). The identifier is bound when the
  markup is activated on the client with `activateZone` — see `ssr.md`.

## Patterns

### Share state across views

Declare tokens at module scope and import them wherever needed. Tokens are just handles — the same
token used in two different views backed by the same store will reflect the same value.

### View-local state

It's also fine to declare a token _inside_ a view function. A view function is evaluated once — when
the view is rendered — not on every update, so the token is created once:

```ts
function counter(root: HTMLBuilder) {
  const count = container({ initialValue: 0 })

  root.button((el) => {
    el.config.on("click", () => update(count, (c) => c + 1))
    el.children.textNode((get) => `Clicks: ${get(count)}`)
  })
}
```

What to avoid is creating tokens in code that _re-runs_ — a `Stateful` callback, an event handler,
or a container's `update` function — since that produces a new, unrelated token every time.

### Parameterizing views

Since there are no props, "props" are simply function arguments. A helper that produces an
`HTMLView`:

```ts
function labeledButton(label: string, onClick: () => StoreMessage<any>): HTMLView {
  return (root) => {
    root.button((el) => {
      el.config.on("click", onClick)
      el.children.textNode(label)
    })
  }
}

// usage
root.div((el) => {
  el.children.subview(labeledButton("Save", () => write(saving, true)))
})
```

### Deriving computed view values

Prefer a `derived` token over recomputing in every `Stateful` callback when the value is shared:

```ts
const unreadCount = derived((get) => get(messages).filter((m) => !m.read).length)

root.span((el) => {
  el.children.textNode((get) => `(${get(unreadCount)})`)
})
```

### Forms

Event handlers return messages built from the event:

```ts
root.input((el) => {
  el.config
    .type("text")
    .value((get) => get(name))
    .on("input", (e) => write(name, (e.target as HTMLInputElement).value))
})
```

## Things to get right

- Handlers **return** messages — they don't dispatch.
- `textNode`, attributes, and view selectors accept `Stateful` functions; use them freely for
  fine-grained updates.
- Declare tokens at module scope, in setup code, or inside a view function (which runs once) — never
  inside a `Stateful` callback or event handler, which re-run.
- Don't read tokens outside a reactive context — `get` is only available where spheres passes it in.
- `subviews` and `subviewMatching` update structure reactively; use them instead of conditional
  imperative logic.
- `innerHTML` and `children` are mutually exclusive.
- There are no refs — to touch a real DOM node, use `elementIdentifier` plus a command manager
  wrapped in `withDomActions`.
- A view can render a fragment (multiple sibling nodes chained on `root`) instead of a single root
  element; there's no shared `config` across a fragment's top-level nodes.
- For shadow DOM, use `config.shadowRoot(...)`, not a hand-written `template`. It works on both
  client and server. Keep `template` content static.
