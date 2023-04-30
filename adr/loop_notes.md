# Loop

One thing I'm kind of worried about is having a global loop. It
would be better I think to be forced to create a loop and provide
it to things that need it. But if we were to do that we have to
pass it around a lot:

- Any piece of state needs access to the same loop that the view
will use.
- Providers and writers need access to the loop to register with it.
- When we render or create a view-fragment, it needs access to the
same view that the relevant state was defined on.
- The Display needs to reference the same loop so that it can dispatch
events to it.

What's nice about the current setup is that we can import state
identifiers like normal modules. And these provide type information
about pieces of data. And also it's extremely easy to attach a provider
or a writer to the state in a way that it is independent of everything
else.

We could conceivably just make each piece of state take a loop object
as an argument. And we could organize state objects with classes if that
helps. But still it's harder then to import and reference the state object
in the view code, I think.

Also, we need to think about how to get all the view elements to reference
the same loop. Conceivably we could create some kind of element that provides
a loop to its children. That would be kind of cool for cases in which we need
multiple loops.

Or even better, when we create the Display, we have to give it a loop and it
somehow passes the loop to the view fragments when they are mounted.

What would kind of be nice is if we could somehow define the state graph in
a way that is *independent of any particular loop*. And only when it is
attached to a loop does it become 'concretized' with actual data. Does that
even make sense?

WHEN would we need to 'concretize' the data? Everything should be declarative
so only 'at runtime' would the data need to actually flow. But what is meant
by 'at runtime'?

By 'at runtime', we should mean: When the view is rendered to HTML OR when
the view is mounted at some position in the DOM. Would that cover the cases that
need a reference to the loop?

- We would need to somehow 'connect' the graph to the loop ... not sure what
that would mean except maybe that when we subscribe we have to specify a loop?
- The Display is the thing that needs access to the loop to create a derived
state for any view fragments and then it subscribes to them. So if we give a loop
to the display then we would just have to supply it to the view fragment
elements somehow.
- And the Display is the thing that needs to attach an event listener to
dispatch events to the loop. So if we give the loop to the display then that
would work fine.

So really the thing that's kind of unclear is how we might connect some
supposed state graph to the loop to concretize it with data.

WHat about when we attach a provider or a writer? A writer would only be
activated when we try to write something to the container. But a provider
could be activated whenever. This is actually another case to consider.
We need a reference to the loop in order to register a provider.

I guess maybe given that some providers have been added to the loop
then in the Display we could do something like `loop.start()` and that
would run all the providers. And maybe the initial value for a container
is just an implicit provider that only gets run when the loop is
initialized.

The key I think is that if you have some set of state, then you could
attach it to a loop because you attach providers and writers to the loop
and when you subscribe to state, you don't do it via the state object itself
but via the loop like so:

```
loop.subscribeTo(myState, (updatedValue) => { ... })
```

Also, maybe we should call the loop the `domain` instead ... or the `model` ...
or maybe an `interpretation` ...

And then the state objects are really just glorified identifiers. They store
a derivation function -- and for containers with an initial state this
derivation function is just a function that does not use the passed in
`get` function.

Consider rendering ... in that case we would create a new interpretation and
attach any providers to it, and then pass it and the view to the render function.
And the views would use the interpretation to subscribe ... Hopefully this
would just eradicate the problem we were seeing with server-side rendering
where given how the bundling works we could end up with two loops ...

And on the client side. We would create a new interpretation and attach providers
to it on the index page. Then we would create a Display and provide the
interpretation. The Display would then pass this interpretation to any views
that are mounted and then would register an event listener that passes events
to the interpretation.

We may need to add some kind of element to the virtual dom that allows for
specifying that some part of the dom is associated with a particular interpretation?
But maybe if you did have that kind of situation you would be more in the
islands world anyway and would just boot up those different areas of interactivity
from some initial config file.

So, I guess I think this might work! And the idea here is that we distinguish
the state graph -- the relationships among the elements of state, the derived
state, the rules, any pure helper functions, etc. From how the data is stored
and who subscribes.

On this approach, the state elements are themselves just names that carry
type information with them. In addition they encode the relationships with
other pieces of state, but the point of that information is that it determines
the type of the value contained by that state.

The benefit is that the actual data for some set of state is contained in or
stored by the interpretation. This is better for testing and enables the
situation where we might want to run multiple copies of a state graph in
isolation from each other. And there's less magic overall, since the functions
that create elements of state would no longer have side effects. We're still
magically kind of getting the state in the state derivation functions, but
that's it.

Could it be confusing? For example, to know whether a given piece of state is
'affiliated' with a given interpretation? Not really. In practice I think there
would generally be one interpretation because you'd want to share state. We're
really just trying to avoid global objects, especially global objects that
are kind of hidden from view.



So what do we need to try this out?

We need some class that will get created. Call this a `Store`.
And then there are state tokens. These don't have any functions on them.
They just store a derivation function.
And when the store is activated they get connected and have a value.