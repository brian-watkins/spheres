# Full Event Delegation

In [this adr](./034_event_delegation.md), we described a process by which
events inside a template were delegated to handlers attached at the root
of that template. This improved performance but we were still creating
handlers for every template instance -- just only one handler for each
relevant type -- so there was still some performance improvements to be
had.

There was also a problem with this implementation: not all events can be
delegated, since not all native events bubble. For example, the `focus`
event does not bubble and so cannot be delegated.

Now, we've decided to implement event delegation for all events, and we
will attach event handlers at the root element where we append the elements
that compose the application.

To make this work, we need to make some changes.

#### Changing how mounting works

First, we need to change how mounting works. Previously it would *replace*
the mount point with the new elements, now it *appends* the new elements
as children of the mount point element. This is necessary to support the
use case where a list of items is the root element to mount.

#### Changing the event handling process

Previously, we tracked event handlers on a per-template-instance basis.
Now, we need to track event handlers across a 'zone', which is a view
mounted at a certain point in the DOM with an associated store.

To do this, we keep a map of 'element ids' to event handlers within the zone.
These element ids are generated at render time, and elements within a template
are identified based on the location of the element governing the templates
(either a list of views or a switch view). So when a template list is
created, that list has an id (call it '0.3') and then elements within it
will have an id based on their position (eg '0.3.1'). This id will map to
an event handler (with the key including the event type in case there are
multiple events on an element). The element id is attached to the element
via a data attribute like `data-spheres-click`. And this is all true for any
event, whether it is inside a template or not. So, here's what happens
whan an event is captured by the root event handler:

1. It looks for the closest element with `data-spheres-{eventType}`.
2. It gets the element id and looks up the handler.
3. If the handler is an 'element' handler, then the handler is run with
the event to produce a message and the message is dispatched to the store
associated with this mount point.
4. If the handler is a 'template' handler, then it looks for the closest
element with `data-spheres-template` and grabs a property from that element
which is a function that sets any template state (see below). We run that function then
run the handler with the event to produce a message and then dispatch that
message to the store associated with the mount point.

#### Switch Views use templates

Previously, only lists used templates -- these were used to create the
new instances of the list elements, since we knew these all were just instances
of the same view. Switch views were really just normal elements that were
attached to the DOM or removed based on state. But it turns out that if you
nest a switch view inside a list, you really now need the switch view to act
like a template so that copies of the event handlers aren't created for each
list item instance. So, switch views now just create template instances and mount
them in the DOM based on state. This is somewhat nicer from a performance
perspective but it also makes it easier to implement event delegation for
nested views, as we'll see below.

#### Handling nested template instance arguments

One thing that can happen with lists is that other template instances can be
nested inside them. So, a list can have items that contain switch views, or
even other lists. This means that it's possible for these nested views to
have references to the parent instance args. So whenever we run an effect or
handle an event, we need to make sure that the appropriate args are set
for the parent template instances, all up the hierarchy.

We already had a pattern where we wrapped effect functions inside a function
that would set the proper state args before executing the effect. We will
build on this pattern to make sure that as we nest further template instances,
each effect (and event) will be wrapped in a function that applies all
the preceding template instance args. So that any references to state from
the previous templates will resolve to the expected value.

This is true of events as well. And so each template will have a function
attached to its root element that will be executed before event handlers inside
that template instance are themselves executed, so that those event handlers
will have the correct args available.

Since lists and switch views render templates, ultimately if some view is
displayed it will have a single root element with a `data-spheres-template`
attribute and a function attached that sets args for any event handlers within.

### Caveats

The main caveat with this approach is that only certain events actually bubble
by default. And with custom events, we can't know for sure I guess that a given
event will bubble or not so no custom events will be delegated.

The other caveat is just that if someone attempts to write some kind of manual
event delegation using spheres/view they might get unexpected results. We haven't
really tested this out.
