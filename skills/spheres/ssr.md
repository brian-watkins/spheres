# Server-side rendering, streaming, and activation

Spheres can generate HTML on the server and selectively activate interactive parts of the page on the client. It supports both one-shot string rendering and streaming as data becomes available.

## When to use what

| Need | Use |
|------|-----|
| Client-only SPA | `renderToDOM` (see `view-api.md`) — no SSR needed |
| Render full HTML once on the server, then hydrate | `createStringRenderer` + `activateZone` |
| Stream HTML while data loads (suspense-like) | `createStreamRenderer` + `activateZone` |
| Produce optimized production bundles | `spheres/server` vite plugin |

## createStringRenderer

```ts
type SerializableState = Container<any> | SuppliedState<any>
type StateManifest = Record<string, SerializableState>

interface RendererOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
}

type HtmlStringRenderer = (store: Store) => string

function createStringRenderer(view: HTMLView, options?: RendererOptions): HtmlStringRenderer
```

Create the renderer **once** (at server startup) and call it per request with a freshly-initialized store:

```ts
const render = createStringRenderer(pageView, {
  stateManifest: { user: userContainer, posts: postsSupplied },
  activationScripts: ["./src/activate.ts"]
})

app.get("/", async (req, res) => {
  const store = createStore({
    init: async ({ supply }) => {
      supply(userContainer, await loadUser(req))
      supply(postsSupplied, await loadPosts(req))
    }
  })
  await store.initialized
  res.send(render(store))
})
```

- **`stateManifest`** — tokens that need to travel from server to client. Spheres serializes their values into the HTML; `activateZone` reads them on the client so the client store starts with the same values.
- **`activationScripts`** — client-side scripts to load. Paths here correspond to entry points built by the spheres vite plugin.

## createStreamRenderer

```ts
interface ZoneOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  store: State<Store>
  mountPoint: string
}
function zone(view: HTMLView, options: ZoneOptions): Zone

interface StreamOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  zones?: Array<Zone>
}

type HTMLStreamRenderer = (store: Store) => ReadableStream

function createStreamRenderer(view: HTMLView, options?: StreamOptions): HTMLStreamRenderer
```

Stream HTML to the client as the store's data arrives. HTML that depends on tokens which aren't yet supplied is sent with placeholders; as values are written to the store, their serialized form is streamed and the client replaces the placeholders.

The stream closes when the store is fully initialized (i.e. all tokens in the manifest have values).

Use it like:

```ts
const stream = createStreamRenderer(pageView, {
  stateManifest: { posts: postsSupplied },
  activationScripts: ["./src/activate.ts"]
})

app.get("/", (req, res) => {
  const store = createStore({
    init: async ({ supply }) => {
      // no await — let the stream start, data arrives later
      loadPostsSlowly(req).then(posts => supply(postsSupplied, posts))
    }
  })
  stream(store).pipeTo(res.body)
})
```

### Zones (multi-store streaming)

For advanced cases with multiple stores, pass `zones` to `createStreamRenderer`. Each `zone(view, { store, mountPoint, ... })` describes a subtree backed by its own store. The root store must expose each zone's store via a token passed as `store: State<Store>`.

## activateZone (client)

```ts
interface ActivationOptions {
  storeId?: string
  stateManifest?: StateManifest
  view: (activate: (element: Element, view: HTMLView) => void) => void
}
interface ActivatedZone {
  store: Store
}
function activateZone(options: ActivationOptions): ActivatedZone
```

Call `activateZone` in your activation script to hydrate interactive regions on the client. You don't have to activate the whole page — activate only the parts that respond to user activity. The rest stays static server-rendered HTML.

```ts
// src/activate.ts
import { activateZone } from "spheres/view"
import { appView } from "./appView"
import { userContainer, postsSupplied } from "./state"

const { store } = activateZone({
  stateManifest: { user: userContainer, posts: postsSupplied },
  view: (activate) => {
    activate(document.getElementById("app")!, appView)
  }
})

// streaming: initialized resolves when the server finishes streaming
await store.initialized
```

- The `stateManifest` must match the server's so tokens round-trip correctly.
- The `view` callback receives an `activate` function; call it with `(element, view)` for each region to hydrate.
- `store.initialized` resolves once streaming completes (or immediately for string-rendered pages).

## Vite plugin

```ts
import { defineConfig } from "vite"
import { spheres } from "spheres/server"

export default defineConfig({
  build: { target: "esnext" },
  plugins: [
    spheres({
      client: {
        entries: {
          client: "./src/activate.ts",
          styles: "./src/styles.css"
        }
      },
      server: {
        entries: {
          server: "./deploy/run.ts"
        }
      }
    })
  ]
})
```

The plugin produces both client and server bundles:
- Client entry names must match the paths passed as `activationScripts` on the server — the plugin rewrites those references to the optimized client bundle paths at build time.
- If your server view renders a full HTML document, `link rel="stylesheet"` and `script` references (e.g. `./src/styles.css`) are also rewritten to their built assets.
- When running `vite dev`, the plugin automatically injects the vite dev-server client for HMR.

`client` and `server` each accept an optional `build` field for any vite `BuildEnvironmentOptions`.

## Things to get right

- Server renderer: create it **once**, reuse per request with a new store. Creating it per request defeats its internal optimizations.
- Always `await store.initialized` before calling a string renderer (streaming handles this itself).
- The client's `stateManifest` must be identical to the server's — same keys, same tokens.
- `activationScripts` paths and client `entries` keys must line up so the vite plugin can wire them together.
- Only activate regions that need interactivity — unactivated HTML remains static and costs nothing at runtime.
- For streaming, don't `await` data in `init` — kick off async work inside `init` and let the renderer stream while you `supply` values as they arrive.
