---
"spheres": minor
---

`activateZone` accepts a `configureStore` option and returns a promise that resolves once the store has initialized, to avoid race conditions during streaming. The `view` option has been renamed to `setupView`.
