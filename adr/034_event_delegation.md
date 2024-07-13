# Event Delegation

By 'event delegation,' I mean the approach by which actual DOM events are
allowed to bubble up to some parent element with an appropriate event handler,
which then locates the original target of the event to determine an
appropriate action to take. Event delegation is seen as a strategy to
reduce the number of actual event handlers attached to the DOM, which itself
is a strategy to improve the performance and memory usage of the page.
Event delegation is most often used in cases where there are repeated
elements on a page, each of which would normally have an event handler
associated with it -- e.g., a list of elements that each have a button that
needs to do something when it is clicked.

So far spheres has not used event delegation at all. It has always been possible
for a user of spheres to implement this pattern using the API, but some
things make it tricky in general.

We did some experiments to determine if event delegation would speed up the
process of adding nodes to the DOM. The thought here is that if we don't
actually need to add an event handler when we add a node (because there is
some event handler higher up the hierarchy that will handle the event) then
we are doing less work and it should be faster to add that node to the DOM.

### Experiments

At first, we tried delegating events to handlers attached to the zone/template
root element. And this does speed things up in the case of adding 10k nodes,
each of which has two click event handlers. It also uses less memory.

We also tried delegating events to handlers attached to the document. In order
to do this, we used a WeakMap from zone/template root elements to a data structure
that holds the events within that zone. This worked, and was faster than the
no event delegation option, but still a bit slower than the previous option.
It also used way more memory than the previous option.

### Decision

We will automatically delegate events to handlers attached to the root element
of the zone within which the event is dispatched. We'll use the following
approach:

When a template/zone is first created, we will label any element that has an
event handler attached to it with an attribute: `data-spheres-[eventType]`
and the value of this attribute will be an id that is unique *within that zone*.
This means that when we add new instances of this zone, we can just copy
the attribute along with the rest of the DOM structure and not have to do
anything.

In addition, when a zone is first created, we will gather the event handlers
and organize them into a structure: eventType -> eventId -> handler

When a template instance needs to be rendered, we will first copy the dom
structure. Then, we will iterate over the event handlers. For each event type,
we will attach a listener to the root element. That event handler, when fired,
will follow this procedure:

1. Find the closest element to the target that has an attribute of
`data-spheres-[eventType]`. This handles the case where (for example) we might
click on a `span` inside an `a` that has an event handler attached.
2. Get the value of that attribute -- this is the eventId.
3. Look up the handler in the data structure based on its eventId.
4. Run the handler and dispatch the message to the store.
5. Stop event propogation.

We do step 5 in order to avoid cases where an event is handled by a zone but
then there's an enclosing zone that also has an event of the same type with the
same id, which would also get handled -- even if it's not actually in the
parent/child hierarchy (like if it's a sibling) -- since all event handlers are
being hoisted to the root element.

### Caveats

One drawback of this approach is that it may be confusing if someone wants to
put in place a complicated event handling flow based on bubbling of events.
On our approach no events bubble at all, even within a zone.

It would be possible to implement support for bubbling of events, but for now
we will leave things are they are. It seems that one could probably do whatever
one needed with a combination of handling one event and updating state
appropriately, without the need for handling the same event multiple times
with different handlers via bubbling.