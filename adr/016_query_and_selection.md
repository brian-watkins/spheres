# Query and Selection

We currently have Writers and Providers as two ways to attach
storage mechanisms to state.

A Writer is a function that gets triggered on any update to state,
before the value is published to dependents and subscribers. It has
an opportunity to do anything with that value and calls a callback
function when it is finished.

A Provider is a reactive query that is triggered whenever any of
its dependencies are updated. It can asynchronously write to any
state (ie it calls a callback to write to any state).

The thought behind Writers and Providers is that these are environment
specific. In other words, the details of how storage should occur
depends on what environment the application is deployed to. It could
be the case that for testing purposes we provide one set of Writers
and Providers (or none at all) and when deployed in production we
provide a different set.

For this reason, it's important that Writers and Providers do not
contain 'application logic' or 'business rules'. We want the state
graph itself to model the relationships between elements of state
and the details of how state is stored or fetched should be a separate
topic.

It's also now more difficult to use Providers and Writers within
the state graph because one must explicitly call functions on the
store to register these, whereas in the past they were automatically
registered with a global store, whereever they were constructed.

There are two cases so far where we need something /like/ a Provider or
a Writer in order to model some aspects of application logic or
business logic. And so we need a better way to model this logic within
the state graph.

#### Problem 1 (Read/Write Container)

Suppose that the application presents a text input area for adding notes.
When we click to save that note, the note input should be disabled but
the content should remain, and then if the save is successful then we
should clear the note input content so that a new note can be written.

The content of the note input was represented as a `Container<string>`
local to the module that defined the note input view.

Originally, to solve this problem, we created a Provider that was triggered
on changed to the list of notes. When the list of notes changed, then we
assemed it was ok to clear the note input content.

Instead, we'd like some way to define the note input content state in
such a way that it's clear that this content will reset itself under
certain conditions.

#### Problem 2 (Read Only Container)

Suppose there is a value displayed on the UI that is calculated from
various other values entered on the UI, and suppose that this calculation
is costly and so must occur on the server-side. Whenever one of the
input values changes, the program should trigger the server-side calculation
and whenever that is complete the value of the UI should be updated
accordingly.

We could model this interaction by creating a container for the calculated
value and then registering a Provider whose dependencies were the
inputs to the calculation. Whenever any of those change, the Provider would
make an HTTP request to the server and when the response returns write
the value to the container that holds the calcuated value.

This works, but now the logic of the calculation (or the facts about the
inputs to that calculation at least) is modeled by a Provider. By looking
at the container of the calculated value it's not clear how this value
is calculated at all.

Notice too that the container of the calculated value should be read-only but
to accomplish this we need it to be writable.

Instead, we'd like some way to show /within the definition of the container/
that there is a dependency between the calculated value and its inputs.

### Queries

To solve these problems, we can do two things.

#### 1. Add a Reactive Query to the Container definition

We've been thinking of containers so far as just a holder of a value that
gets written to it based on some user interactions. Basically, a variable
that is set to a value under certain conditions. Instead, we should think
of this as a special case. The more general case is that a container value
is set by a reactive query which itself can have some input provided by
a user interaction.

In this way, a container moves closer to the notion of derived state
(a `Value`). A Value is defined by a reactive query that provides its value
any time any of the state referenced in that query change their values.
What we need is for a container to be updated in the same way with the
difference that we can trigger the query by providing some input, as well
as when any of its dependencies change.

So, a container should be defined by a reactive query. In the case of the
basic writable container, the query is just a simple one that has no
dependencies and returns whatever the input value is. But in other cases,
this makes the container much more powerful.

Consider Problem 1. We can define the note input content container with
a query. That query will depend on the current state of the content and
the meta state of the list of notes. Whenever the meta state indicates
that a save is occurring, we update the note input content and wrap it
in a `saving` union type. At this point we can define explicitly in the
query that any input that is provided will be ignored. Then, when the
meta state of the note list indicates that the save is complete, we can
set the not input content to a `writing` union type with a value of the
empty string.

In this way, by looking at the query that defines the container, we can
see two important application rules: that any input should be ignored
while we are saving, and that after a successful save the content should
be reset to the empty string.

#### 2. Add a Reducer to the Value definition

On the other hand, we had been thinking of Values (derived state) as
simply generating the result of a reactive query. But we can broaden
the notion of a Value by having the reactive query generate a
reducer message which is then translated into a value by some reducer
function.

In this way, we bring the Value closer to the Container by allowing
the definition of a value to include a reducer function.

The reducer function allows us to be more explicit about the changes
to the Value. And we can leverage this to provide information to a
Writer that indicates the conditions under which values should be
stored.

So, consider Problem 2. We want read-only state to represent a calculated
value. But we need to make a request to the server to calculate this
value so we can't simply use a `Value` state. Instead, we create a
`Value` with a query that produces a `calculate` message. This message
will include all the inputs to the calculation, and, as such, it will
be produced any time the dependencies of the query are changed. We will
then define a reducer function that publishes a value any time it
receives a `calculated` message. If it receies a `calculate` message
then it will throw an error (since the calculation must be done on
the server-side).

In this way, we represent the dependency between the calculated value
and its inputs in the definition itself of the `Value` that holds this
number.

### Queries and Selections

So, by adding queries to Containers and reducers to Values we are able
to solve the two problems.

A container query is reactive, however, and sometimes we might want to
update the value of a container with reference to other state without
always triggering an update when any of those dependencies change. For this
we had been using a `rule`. We've decided to keep this behavior but call
this a `selection` instead to indicate that we are getting some value
based on elements in the state graph. Writing a value to a container is
just a specific type of selection where the input to the selection is
returned.

Given these changes, we now have a clearer picture of how to model state
interactions.

We have two (main) types of state:
- Containers, which can accept input,
- Values, which cannot accept input (ie their values are determined
solely by their dependencies).

We have two ways to model application logic via state interactions:
- Queries, which are reactive
- Selections, which are not reactive

We have two analogous ways to model storage logic for state elements:
- Providers, which are reactive and can write to any state
- Writers, which are not reactive and can write to a single state