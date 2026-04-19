---
name: spheres
description: Build browser-based web applications with spheres — a TypeScript framework with fine-grained reactive views and token-based state management. TRIGGER when code imports `spheres`, `spheres/store`, `spheres/view`, or `spheres/server`; when a user asks to build, modify, or debug a spheres application; or when discussing `HTMLBuilder`/`SVGBuilder`, `container`/`derived`/`supplied`, `renderToDOM`, `createStore`, `useEffect`, `useCommand`, `useContainerHooks`, `createStringRenderer`, `createStreamRenderer`, or `activateZone`.
---

# Spheres

Spheres is a TypeScript framework for building browser-based web applications. It has two modules:

- `spheres/store` — state management separating application logic from storage.
- `spheres/view` — declarative views with fine-grained reactive updates.

Full documentation wiki at `/Users/bwatkins/workspace/spheres.wiki/` (`Home.md`, `Store.md`, `View.md`).

## Mental model

Spheres is **not** React. Internalize these differences before writing code:

- **No components, no props, no hooks.** Views are plain functions that take a builder (`HTMLBuilder` or `SVGBuilder`) and mutate it.
- **State lives in tokens, not in views.** A `container`, `derived`, or `supplied` token is just a handle — it holds nothing until registered with a `Store`. Tokens are typically declared at module scope and shared.
- **Reactivity is fine-grained and automatic.** Anywhere you pass `(get) => ...` (a `Stateful<T>`), spheres tracks which tokens you read and re-runs *just that binding* when they change. There's no virtual DOM diff, no re-rendering of parent views.
- **Event handlers return messages; they don't dispatch.** An `on("click", ...)` handler must *return* a `StoreMessage` (from `write`, `update`, `reset`, `run`, `batch`, or `use`). Spheres dispatches it to the store automatically. Calling `store.dispatch` inside a handler is almost always wrong.
- **Storage is a separate concern.** Persistence, fetching, and async I/O happen through `ContainerHooks`, `Commands`, or `useEffect` — not inside views or update functions. Application logic stays pure.

## Minimal example

```ts
import { renderToDOM } from "spheres/view"
import { container, update, createStore } from "spheres/store"

const clickCount = container({ initialValue: 0 })

function counter(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .p(el => {
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => update(clickCount, c => c + 1))
        el.children.textNode("Count!")
      })
  })
}

renderToDOM(createStore(), document.getElementById("app")!, counter)
```

## Core idioms

- **Reactive bindings.** Any attribute, text node, or subview selector accepts either a literal or a `(get) => T | undefined`. Prefer the stateful form whenever the value depends on a token — spheres will only update that specific binding.
- **Composition:** `subview(view)` inlines another view function. `subviews(get => get(items), itemView)` renders keyed lists (spheres diffs by identity, only updating changed items). `subviewOf(selector => selector.when(...).when(...).default(...))` picks one view based on state.
- **Updating containers:**
  - `write(container, value)` — set a new value directly.
  - `update(container, current => next)` — derive next value from current.
  - `reset(container)` — return to `initialValue`.
  - `batch([...])` — apply many messages as a single update (effects fire once).
  - `use(get => message)` — compute a message from current state, then dispatch.
- **Custom messages.** If a container has an `update` function, `write` sends messages of its input type `M` and the update function returns `{ value, message? }`. The optional returned `message` chains another dispatch.
- **Effects vs derived:** use `derived` for values you want to read reactively; use `useEffect` for side effects (logging, persistence, calling into external APIs).
- **Commands** model messages from app logic *to* the storage system. Register with `useCommand(store, command, manager)`; dispatch with `exec(command, message)`.

## Common mistakes to avoid

- Mutating a container's current value instead of producing a new one in `update`.
- Dispatching inside event handlers instead of returning a message.
- Reaching for React-style patterns: hooks, refs, lifecycle, `useState`, component props.
- Reading tokens outside a reactive context (`get` is only available inside a `Stateful` function, a `derived` query, a `useEffect.run`, a `CommandManager.exec`, or a store `init`).
- Forgetting that a token's value doesn't exist until it's registered with a store.
- Creating containers inside view functions — declare them at module scope or in setup code so they aren't recreated per render.
- Using `innerHTML` alongside children (children are ignored when `innerHTML` is set).

## Reference files

Load the relevant reference file when working in depth on that area. These mirror the wiki but are structured for quick lookup:

- `store-api.md` — full `spheres/store` API: state tokens, store, messages, hooks, commands, effects.
- `view-api.md` — full `spheres/view` API: builders, element functions, subview/subviews/subviewOf, stateful attributes, events.
- `ssr.md` — server-side rendering, streaming, `activateZone`, state manifests, the vite plugin.

## Project setup

Spheres apps are typically built with [vite](https://vitejs.dev). Quick start:

```
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install spheres
```

Then replace `src/main.ts` with a spheres view and mount with `renderToDOM`.

For SSR/streaming projects, use the `spheres/server` vite plugin — see `ssr.md`.

## Examples

More examples live at https://github.com/brian-watkins/spheres/tree/main/examples.
