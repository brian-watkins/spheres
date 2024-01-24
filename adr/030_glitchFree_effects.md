# Glitch Free Effects

Let's define a 'glitch' as an effect that runs multiple times
during processing of a message from the Store.

Here's an example: suppose that some effect depends on two state
tokens, each of which (somehow) depend on another state token.
When that 'root' state token is updated, both of the effect's
dependencies will be updated. Depending on how these updates are
processed, the effect could be called twice: first with one
updated state value and the other current state value and then
again with both state values updated.

This isn't great because we're potentially doing more work than
necessary in the effect, and depending on what the effect does,
it could result in strange or unexpected results. If an effect
updates the DOM, maybe the DOM appears in a weird state for a
moment.

We also have some 'internal' effects that suffer from the same
problem. If a command is created with a query that triggers it,
and the query falls into the case described above, then some updates
could trigger the command twice, even though we would expect
that it should only be triggered once. And this could be very bad
depending on what the command actually does. The same is true
for containers with a reactive constraint -- this could result
in multiple calls to the `onWrite` hook, when really we would
expect only one when a relevant message is dispatched to the store.

### Decision

In order to fix this problem, we will defer running effects until
the end of the event loop via the `queueMicrotask` function.

The thought is this: When a write message comes into the store, it
will trigger an update to a container. Once the updated value is
published, listeners will be triggered in turn. Some of those
listeners will be other derived state and some will be effects.
If we encounter an effect, we won't run the effect function immediately
but will call `queueMicrotask` to send it to the end of the event loop.
If we encounter a listener that is not an effect, then we will
update the listener immediately. So, following this method, we
should be able to move through the state dependency graph in a
depth-first approach, sending effects to the end of the event loop
along the way. Once the graph has been traversed, and all state
values have been updated, then effects will be run. The one trick
is that we have to ensure to queue each effect only once as a microtask.

Note that when we first schedule an effect with the store, we will
still follow the existing pattern where we run the effect immediately
with whatever the current values are of its state dependencies. This is
necessary in certain cases -- when rending a View to a string and
when first creating stateful views -- and it shouldn't cause any
problems since the state graph is in a determinate state and not in the
process of being updated. It's only when an effect is called
due to state changes that we could potentially encounter glitches.