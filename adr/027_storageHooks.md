# Storage Hooks

Previously we had the notion of a `Writer` which could be attached to
*any* state token and was called on writes to that state token. This
made it possible to inject storage capabilities into any state. There
are a few problems with this:
- It doesn't really make sense to attach a Writer to just *any* state.
Derived state should be a function of existing state so it should not
need to be persisted itself, for example. Really, we should only be
concerned about persisting *input* state, ie containers.
- We need to do more than just handle writes when it comes to storage
of containers. Sometimes we might fetch data as well. And the most
common time to fetch data is on app start, or when the container is
first referenced, so that it might recover any state that has been
persisted. We don't currently have a good way to handle this case,
without triggering the Writer itself again.

## Decision

We will remove the concept of a Writer and replace it with Storage Hooks.

Storage Hooks may be attached to any *container* via the `useStorage`
method on the `Store`. There are two storage hooks: one is called when
a container is 'ready,' that is, after it is registered with the store and
it's storage hooks have been attached. The other is called whenever a
write occurs to the container.

In each case, the hook can get the current value of the container, get
other state, set the meta value of the container, or publish a value (or
when there is a reducer, pass a message to the reducer). In this way,
each storage hook bypasses triggering the other hook (or itself).

Now if a container needs to recover its persisted state, it can do so
in the `onReady` hook. It could set up things like periodic refresh
in this hook, as well. Or even a websocket for sharing state across
sessions.

By adding the `onReady` hook, we (hopefully) have a more flexible and powerful
way to handle persistence for containers.