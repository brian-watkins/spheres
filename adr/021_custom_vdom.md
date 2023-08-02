# Custom Virtual DOM Implementation

As a follow-on to the work on optimizing the display for performance
described in [this adr](./020_performance.md), we investigated alternatives
to Snabbdom for rendering HTML.

### Lit-HTML

We attempted to use [lit-html](https://lit.dev/docs/libraries/standalone-templates/),
which is a standalone version of lit just focused on rendering html. We
were able to get this working, but it has a lot of caveats which make
it unsuitable as a path forward.

- We were able to get this working by leveraging web components, but
web components are a different paradigm from what we've done so far. They
encapsulate more, including styling, and this doesn't fit with the
idea that the view should just be composed of functions -- not components.

- We also didn't really see an improvement in performance -- although we
didn't spend a huge amount of time optimizing either.

### HTML Templates

We attempted to created HTML5 templates for stateful views, which we could
then just patch, rather than creating from scratch. The hypothesis was that
this might improve the speed at which elements were created and added to
the DOM. While this approach seemed to work, it didn't show any real
performance improvement.

It turns out too that the Chrome profiler did not show that there were
multiple reflows or layouts during complicated renders (like adding 1000
elements to the view). This indicates that there's nothing inherently wrong
with virtual dom approach -- maybe it's just Snabbdom's diffing algorithm
that's slow.

### HyperApp

We stumbled upon another virtual dom based framework called
[hyperapp](https://github.com/jorgebucaran/hyperapp). This framework had much
faster performance on the js-framework benchmarks.

It didn't seem possible to use hyperapp directly, as it ties the virtual
dom implementation to a kind of event-loop and state management, in a way based
on elm, and the virtual dom diffing algorithm wasn't exposed independently of that.

So, we extracted the algorithm, wrote a bunch of tests to try and understand
what it was doing, refactored it a bit to account for our notion of stateful
views ... and, with this new virtual dom implementation, our framework performs
much better on the js-framework benchmarks! It also has smaller bundle size,
slightly faster startup, and a bit less memory usage. When running the benchmark
on my laptop, our framework performs better than lit-html, elm (another fast virtual dom
implementation), and even the standard implementation for hyperapp itself.

## Decision

For these reasons, we're going to stick with our custom, hyperapp-based
virtual dom diffing algorithm as the basis for how our framework renders HTML.
Snabbdom hasn't been updated in a long time, and this puts us in complete
control of optimizing the algorithm for our specific use case.

We still want to stick with a virtual dom implementation because it's
straightforward -- other approaches which may be still faster have build-time
dependencies to compile templates or whatever (ie solid). Or ask the developer to make more decisions about how to structure their views to optimize for performance -- like
blockdom or million.

The key innovation in our framework, it seems, is what we might call 'automatic
memoization'. Since we thought from the beginning about the view as divided into
parts that are not stateful (and so only need to render once) and parts that are
stateful, we were able to have the dom diffing algorithm 'stop' whenever it
encounters a stateful view, since we know that the stateful view will take care
of updating itself whenever it needs to. This means that the virtual dom diff only
has to work over a smaller area of the app, instead of diffing the entire dom on
each change. So this helps us get even a little more performance out of the
virtual dom approach.