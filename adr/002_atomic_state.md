# Atomic State

The are a variety of approaches to state mangement that have been formalized
recently in various frameworks. The Elm Architecture is probably the
ur-model for a pattern that involves a single store for all application
state, with a set of functions that update this state, and things that
listen for changes (most importantly a function that renders the view).
Redux implements a version of this pattern with React, and Vuex does the
same for Vue.js. With React and Vue it's always a bit more complicated
because the framework provides other ways to manage state -- through state
local to a component, state that's fetched on demand, and state that's held
in things like cookies or the document location. While Elm makes everything
go through one single update function and all state is stored in one place,
Redux and Vuex can only provide this /as an option/ within their
respective frameworks; there's always other ways to store state in addition.

This is one of the causes of complexity in an application, in my experience,
namely multiple places to handle and track state. Elm is able to enforce its
pattern because it is a programming language that only allows state to be
tracked in one particular way. React and Vue began with a notion of state
local to a component and then other state management strategies/tools add
onto that.

So we need to be careful not to allow for state management to contribute
to complexity more than it should.

# Why Atomic state?

The redux approach (and the elm approach) is about creating 'reducer' functions
-- or, in the case of Elm, an 'update' function more generally -- that update
the single state/model/store given some message. The model (I'll just use model
from now on) is the single source of truth and updates are 'pushed' into it
depending on messages received by the application.

An alternative is to think of state in terms of small 'atoms' instead of a single
model. The single model idea combines all the state in your app, which is there
for different purposes or has different significance, into one thing. The atomic
approach allows you to decompose that model into the smallest pieces of state that
make sense. What ends up happening, I think, is that the parts of your app that
need to respond to changes in state, generally are concerned with only one or
more pieces of the model, and yet they receive the entire model (or some view
function, for example, receives the model which then has to carve off the parts
that are relevant and pass them on to other parts of the view that need them).
On the atomic model, you divide your application state up into those parts and
then things that listen for changes can just subscribe to changes in the part
of state that they care about. On this approach, it's possible to think of the
view as itself not a single thing, but a collection of 'elements' that each depend
on particular pieces of state. A login indicator, for example, only depends on
the logged in user and so could subscribe to that piece of state specifically.

In addition, the atomic strategy let's us distinguish between 'essential' state
and 'derived' state. Instead of always thinking about running functions that push
changes into a single model, we can instead think of computations on the state
that run whenever relevant pieces of essential state change to produce a derived
state that might be relevenat for particular subscribers. In this way, updates
always happen to the essential state only, and this cascades changes to derived
state and to listeners. This is kind of a cool approach I think since it helps
to think more clearly about the logic of the application and the relationship
between state that might be stored on the server (for example) and state that
is ephemeral and needed only for the purposes of the application running in the
browser.

The final thought is that *view elements* themselves can be thought of as derived
state, since they depend ultimately on certain pieces of essential state. In this
way, there's no need for law of demeter violations where data is passed down from
a root element in some view hierarchy to some lower node that needs it, when the
view element itself does not. Instead view elements themselves just subscribe to
state and are recomputed like any derived state when the state they depend on
changes (which could itself be derived or essential). The view function then just
stitches these 'view elements' together.

Of course React has various strategies to avoid 'prop-drilling' or law of demeter
violations as well -- with the context api or hooks that connect with the redux
store directly. But I still think this approach is kind of interesting in that
it acknowledges that the view itself -- or really just parts of the view -- is
a kind of derived state.

A lot of this thinking was inspired by looking at [jotai](https://jotai.org) and
the approach it follows for state management in react. For Jotai, I think they
basically try to make all state seem like local state to a component, which is
one way (I think) of acknowledging in terms of react that particular elements of
the view really depend only on particular elements of application state.

### Decision

So we will experiment with an atomic state pattern. The hope is that this will
reduce some complexity by forcing a distinction between essential state and
derived state (which can then help the runtime decide if it needs to do anything
with regard to storing the state or optimizing things). And by allowing us to
represent very clearly the relationships between parts of the view and the
particular parts of the application state they depend on.