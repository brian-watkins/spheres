# Event Delegation Again

We made some updates to the event delegation strategy
as described in [this ADR](./034_event_delegation.md). There were two
problems with the original approach:

1. Event propagation did not work as expected.
2. The `currentTarget` property would always be set to the root element
on the zone (where the events were actually attached) instead of the
element with the event handler being processed.

Now we use the `composedPath` method to get the list of elements that
the event will bubble through. For each one, we attempt to get the
attribute that determines what events it handles. If that's null then
we keep going, if not, we handle the event. Once we encounter the root
element of the zone, we stop and allow the event to continue bubbling
on its own. In this way, we manually manage the bubbling of the event
through the part of the dom that is managed by this spheres zone.

This approach seems better at least in that we don't need to call
`closest` and process a CSS query -- we just check the attribute to
determine which element has the relevant handler.

In addition, we now wrap the event object in a decorator that allows us
to record when `stopPropagation` and `stopImmediatePropagation` are called.
This allows us to break out of the loop to manually bubble the event
once a handler calls one of these functions.

So, we no longer stop propagation by default. But if an event handler
calls `stopPropagation` it should work as expected. And we simulate event
bubbling within the zone governed by spheres. This brings spheres into better
agreement with expected usage when working with events.