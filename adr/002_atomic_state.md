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
local to a component and then other state management tools add onto that.

So we need to be careful not to allow for state management to contribute
to complexity more than it should.

