---
"spheres": minor
---

Access meta state via the `meta(token)` function instead of a `.meta` property on containers and supplied state. `pending`/`error` methods on command and store initializer actions have been removed in favor of supplying values directly to `meta(token)`.
